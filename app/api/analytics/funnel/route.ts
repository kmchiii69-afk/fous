// GET /api/analytics/funnel?days=30
//
// Funnelmaxxing Pro data backend. Returns two ORDERED funnels (free course +
// VSL) computed as true sequential funnels — each step counts people who did
// every prior step in time order, so counts are monotonic and conversions
// never exceed 100%. Plus: free→VSL crossover, traffic sources, and Whop
// revenue split by funnel.

import { NextRequest, NextResponse } from "next/server";
import { isAuthed } from "@/lib/analytics-auth";
import { fetchWhopRevenue } from "@/lib/whop";
import { attributeClosesToFreeCourse } from "@/lib/freecourse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// in-memory TTL cache per period — the aggregation is heavy (6–15s), so repeat
// period-switches within the window return instantly. Per warm instance; data
// is identical for all authed viewers, so keying on `days` alone is safe.
const _cache = new Map<number, { t: number; payload: unknown }>();
const CACHE_MS = 90_000;

const PH_PROJECT = "430887";
const PH_HOST = "https://us.i.posthog.com";
const FREE_HOST = "free.quantumcipherlab.com";

// ── Close call activity → per-rep leaderboard ──────────────────────
async function fetchCallStats(days: number) {
  const key = process.env.CLOSE_API_KEY || "";
  if (!key) return [];
  const auth = Buffer.from(`${key}:`).toString("base64");
  const since = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 19);

  type Rep = { name: string; calls: number; answered: number; talkSec: number };
  const reps: Record<string, Rep> = {};
  let skip = 0;
  // Cap at 30 pages (3000 calls); plenty for a 30–90d window, bounded latency.
  for (let p = 0; p < 30; p++) {
    const url = `https://api.close.com/api/v1/activity/call/?date_created__gte=${encodeURIComponent(since)}&_limit=100&_skip=${skip}`;
    const res = await fetch(url, { headers: { Authorization: `Basic ${auth}`, Accept: "application/json" }, next: { revalidate: 300 } });
    if (!res.ok) break;
    const d = await res.json();
    for (const c of (d.data ?? []) as { user_name?: string; duration?: number; disposition?: string }[]) {
      const name = c.user_name || "Unknown";
      const r = (reps[name] ??= { name, calls: 0, answered: 0, talkSec: 0 });
      r.calls++;
      const dur = c.duration ?? 0;
      r.talkSec += dur;
      if (c.disposition === "answered" || dur > 0) r.answered++;
    }
    if (!d.has_more) break;
    skip += 100;
  }
  return Object.values(reps)
    .filter((r) => r.calls >= 2)
    .sort((a, b) => b.calls - a.calls)
    .map((r) => ({
      name: r.name,
      calls: r.calls,
      answered: r.answered,
      connectPct: r.calls ? Math.round((r.answered / r.calls) * 100) : 0,
      talkMin: Math.round(r.talkSec / 60),
    }));
}

// ── Close booking sub-funnel: booked (self vs setter-rescued), show, cancel ──
async function fetchBookingFunnel(days: number) {
  const key = process.env.CLOSE_API_KEY || "";
  if (!key) return null;
  const auth = Buffer.from(`${key}:`).toString("base64");
  const headers = { Authorization: `Basic ${auth}`, Accept: "application/json" };
  const since = new Date(Date.now() - days * 86_400_000).toISOString();

  // status id → label map
  let idName: Record<string, string> = {};
  try {
    const sd = await (await fetch("https://api.close.com/api/v1/status/lead/", { headers, next: { revalidate: 3600 } })).json();
    idName = Object.fromEntries((sd.data ?? []).map((s: { id: string; label: string }) => [s.id, s.label]));
  } catch {
    return null;
  }

  // status_change history → per-lead label sequence. Pull a WIDER window
  // (90d, or the report window + 60d) so each booked lead's earlier statuses
  // are captured — otherwise a lead who qualified before the window but
  // booked recently looks falsely "immediate".
  const histDays = Math.max(days + 60, 90);
  const histSince = new Date(Date.now() - histDays * 86_400_000).toISOString();
  const bookCutoff = Date.now() - days * 86_400_000; // only count bookings in the report window
  const seq: Record<string, { t: number; label: string }[]> = {};
  for (let p = 0; p < 32; p++) {
    const url = `https://api.close.com/api/v1/activity/status_change/lead/?date_created__gte=${encodeURIComponent(histSince)}&_limit=100&_skip=${p * 100}`;
    const res = await fetch(url, { headers, next: { revalidate: 600 } });
    if (!res.ok) break;
    const d = await res.json();
    for (const sc of (d.data ?? []) as { lead_id?: string; new_status_id?: string; status_id?: string; date_created?: string }[]) {
      const lid = sc.lead_id ?? "";
      const label = idName[(sc.new_status_id ?? sc.status_id) ?? ""] ?? "?";
      (seq[lid] ??= []).push({ t: sc.date_created ? Date.parse(sc.date_created) : 0, label });
    }
    if (!d.has_more) break;
  }
  // 3-way booking split: immediate self-book vs setter-rescued vs later (email/nurture)
  let booked = 0, immediateBooked = 0, setterRescued = 0, laterBooked = 0;
  for (const events of Object.values(seq)) {
    events.sort((a, b) => a.t - b.t);
    const bi = events.findIndex((e) => e.label === "Demo Booked");
    if (bi < 0) continue;
    const bookedAt = events[bi].t;
    if (bookedAt < bookCutoff) continue; // booking outside the report window
    booked++;
    const setterBefore = events.slice(0, bi).some((e) => e.label.includes("Setter"));
    if (setterBefore) {
      setterRescued++;
    } else {
      const gapHours = (bookedAt - events[0].t) / 3_600_000;
      if (gapHours <= 24) immediateBooked++;
      else laterBooked++;
    }
  }
  const selfBooked = immediateBooked; // back-compat alias

  // meeting activity → showed vs canceled
  let showed = 0, canceled = 0, meetings = 0;
  for (let p = 0; p < 12; p++) {
    const url = `https://api.close.com/api/v1/activity/meeting/?date_created__gte=${encodeURIComponent(since)}&_limit=100&_skip=${p * 100}`;
    const res = await fetch(url, { headers, next: { revalidate: 600 } });
    if (!res.ok) break;
    const d = await res.json();
    for (const m of (d.data ?? []) as { status?: string }[]) {
      meetings++;
      if (m.status === "completed") showed++;
      else if (m.status === "canceled") canceled++;
    }
    if (!d.has_more) break;
  }

  return { booked, immediateBooked, setterRescued, laterBooked, selfBooked, meetings, showed, canceled };
}

// ── Kit automated sequences → enrollment per funnel ────────────────
async function fetchSequences() {
  const key = process.env.KIT_API_KEY || "";
  const sec = process.env.KIT_API_SECRET || "";
  if (!key || !sec) return [];
  const listRes = await fetch(`https://api.convertkit.com/v3/sequences?api_key=${key}`, { next: { revalidate: 600 } });
  if (!listRes.ok) return [];
  const seqs: { id: number; name: string }[] = (await listRes.json()).courses ?? [];

  // map a sequence to a funnel by name
  const funnelOf = (name: string): "free" | "vsl" | "post-call" | "other" => {
    const n = name.toLowerCase();
    if (n.includes("free course")) return "free";
    if (n.includes("vsl") || n.includes("quantum")) return "vsl";
    if (n.includes("booked call") || n.includes("book")) return "post-call";
    return "other";
  };

  // enrolled count per sequence (1 call each, capped to the relevant ones)
  const relevant = seqs.filter((s) => funnelOf(s.name) !== "other").slice(0, 12);
  const out = await Promise.all(
    relevant.map(async (s) => {
      const r = await fetch(`https://api.convertkit.com/v3/sequences/${s.id}/subscriptions?api_secret=${sec}&page=1`, { next: { revalidate: 600 } });
      const enrolled = r.ok ? (await r.json()).total_subscriptions ?? 0 : 0;
      return { id: s.id, name: s.name, funnel: funnelOf(s.name), enrolled };
    }),
  );
  return out.filter((s) => s.enrolled > 0).sort((a, b) => b.enrolled - a.enrolled);
}

// ── Kit broadcasts → real per-email open/click (the actual emails sent) ──
async function fetchBroadcasts() {
  const sec = process.env.KIT_API_SECRET || "";
  if (!sec) return [];
  const listRes = await fetch(`https://api.convertkit.com/v3/broadcasts?api_secret=${sec}`, { next: { revalidate: 600 } });
  if (!listRes.ok) return [];
  const all: { id: number; subject: string; created_at: string }[] = ((await listRes.json()).broadcasts ?? [])
    .sort((a: { created_at: string }, b: { created_at: string }) => b.created_at.localeCompare(a.created_at))
    .slice(0, 8);
  const stats = await Promise.all(
    all.map((b) =>
      fetch(`https://api.convertkit.com/v3/broadcasts/${b.id}/stats?api_secret=${sec}`, { next: { revalidate: 600 } })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    ),
  );
  const out: { subject: string; date: string; recipients: number; openRate: number; clickRate: number; clicks: number }[] = [];
  for (let i = 0; i < all.length; i++) {
    const s = stats[i]?.broadcast?.stats;
    if (!s || s.status !== "completed") continue;
    out.push({
      subject: all[i].subject,
      date: all[i].created_at,
      recipients: s.recipients ?? 0,
      openRate: s.open_rate ?? 0, // already a percentage (e.g. 42.31)
      clickRate: s.click_rate ?? 0,
      clicks: s.total_clicks ?? 0,
    });
  }
  return out;
}

async function hogql(query: string): Promise<unknown[][]> {
  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY || "";
  if (!apiKey) return [];
  const res = await fetch(`${PH_HOST}/api/projects/${PH_PROJECT}/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    console.error("[funnel] HogQL failed:", res.status, (await res.text()).slice(0, 300));
    return [];
  }
  return ((await res.json()).results ?? []) as unknown[][];
}

// An ordered funnel step: id, display label, and the HogQL event condition
// that marks completion.
type Step = { id: string; label: string; cond: string; note?: string };

const VSL_STEPS: Step[] = [
  { id: "visit", label: "Visited VSL page", cond: `event = '$pageview' AND properties.$host != '${FREE_HOST}' AND properties.$pathname IN ('/', '/training')` },
  { id: "lead", label: "Opted in (lead)", cond: `event = 'lead_submitted'` },
  { id: "survey_start", label: "Started application", cond: `event = 'qualify_form_started'` },
  { id: "survey_done", label: "Qualified (submitted)", cond: `event = 'qualify_form_submitted'` },
];

const FREE_STEPS: Step[] = [
  { id: "visit", label: "Visited free course", cond: `event = '$pageview' AND (properties.$host = '${FREE_HOST}' OR properties.$pathname IN ('/free-course', '/free-course/confirm', '/free-course/broker'))` },
  { id: "signup", label: "Signed up (email captured)", cond: `event = 'free_course_submitted'` },
  { id: "confirm", label: "Reached course content", cond: `event = 'free_course_confirm_viewed'` },
];

// Build a single HogQL query that computes an ordered funnel: per person, the
// first timestamp of each step, then count people who completed each step at
// or after the previous one.
function orderedFunnelQuery(steps: Step[], days: number): string {
  const minCols = steps
    .map((s, i) => `nullIf(minIf(timestamp, ${s.cond}), toDateTime(0)) AS s${i}`)
    .join(",\n      ");

  // step0 = did s0; stepN = did s0..sN each >= the prior
  const counts = steps
    .map((_, i) => {
      const chain = Array.from({ length: i + 1 }, (_, j) => `isNotNull(s${j})`).concat(
        Array.from({ length: i }, (_, j) => `s${j + 1} >= s${j}`),
      );
      return `countIf(${chain.join(" AND ")}) AS c${i}`;
    })
    .join(",\n    ");

  return `
    SELECT ${counts}
    FROM (
      SELECT person_id,
      ${minCols}
      FROM events
      WHERE timestamp >= now() - INTERVAL ${days} DAY
      GROUP BY person_id
    )
  `;
}

export async function GET(req: NextRequest) {
  if (!isAuthed(req.cookies.get("qc_auth")?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const days = Math.min(Math.max(parseInt(req.nextUrl.searchParams.get("days") ?? "30") || 30, 1), 365);

  const cached = _cache.get(days);
  if (cached && Date.now() - cached.t < CACHE_MS) return NextResponse.json(cached.payload);

  const crossoverQuery = `
    SELECT
      (SELECT count(DISTINCT person_id) FROM events WHERE event = 'free_course_submitted' AND timestamp >= now() - INTERVAL ${days} DAY) AS free_total,
      (SELECT count(DISTINCT person_id) FROM events WHERE event IN ('lead_submitted','qualify_form_started','qualify_form_submitted') AND timestamp >= now() - INTERVAL ${days} DAY) AS vsl_total,
      count(DISTINCT person_id) AS crossed
    FROM events
    WHERE event IN ('lead_submitted','qualify_form_started','qualify_form_submitted')
      AND timestamp >= now() - INTERVAL ${days} DAY
      AND person_id IN (
        SELECT DISTINCT person_id FROM events
        WHERE event = 'free_course_submitted' AND timestamp >= now() - INTERVAL ${days} DAY
      )
  `;

  const sourcesQuery = `
    SELECT
      coalesce(nullIf(person.properties.$initial_utm_source, ''), nullIf(replaceAll(person.properties.$initial_referring_domain, '$direct', ''), ''), '(direct)') AS source,
      coalesce(nullIf(person.properties.$initial_utm_content, ''), '') AS content,
      uniqIf(person_id, event = '$pageview') AS visitors,
      uniqIf(person_id, event = 'free_course_submitted') AS free_signups,
      uniqIf(person_id, event = 'qualify_form_submitted') AS surveys
    FROM events
    WHERE timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY source, content
    HAVING visitors > 1 OR free_signups > 0 OR surveys > 0
    ORDER BY visitors DESC
    LIMIT 12
  `;

  const dailyQuery = `
    SELECT toDate(timestamp) AS d,
      countIf(event = 'free_course_submitted') AS free,
      countIf(event = 'lead_submitted') AS vsl
    FROM events
    WHERE timestamp >= now() - INTERVAL ${days} DAY
      AND event IN ('free_course_submitted', 'lead_submitted')
    GROUP BY d ORDER BY d
  `;

  // Broker order-bump (free funnel step 2) + VSL routing split, one scan each.
  const brokerQuery = `
    SELECT
      uniqIf(person_id, event = 'broker_offers_viewed') AS viewed,
      uniqIf(person_id, event = 'broker_offer_clicked') AS clicked,
      uniqIf(person_id, event = 'broker_offer_clicked' AND properties.broker = 'hydra') AS hydra,
      uniqIf(person_id, event = 'broker_offer_clicked' AND properties.broker = 'blofin') AS blofin,
      uniqIf(person_id, event = 'broker_offers_skipped') AS skipped,
      uniqIf(person_id, event = 'free_course_confirm_viewed') AS confirmed
    FROM events WHERE timestamp >= now() - INTERVAL ${days} DAY
  `;
  const vslSplitQuery = `
    SELECT
      uniqIf(person_id, event = 'qualify_form_submitted' AND properties.routing = 'book') AS quantum,
      uniqIf(person_id, event = 'qualify_form_submitted' AND properties.routing = 'wolfpack') AS wolf,
      uniqIf(person_id, event = 'qualify_intl_offer') AS intl,
      uniqIf(person_id, event = 'book_page_viewed') AS book_viewed,
      uniqIf(person_id, event = 'wolfpack_page_viewed' OR (event = '$pageview' AND properties.$pathname = '/wolfpack')) AS wolfpack_viewed,
      uniqIf(person_id, event = '$pageview' AND properties.$pathname = '/wolfpack-global') AS global_viewed
    FROM events WHERE timestamp >= now() - INTERVAL ${days} DAY
  `;

  // Nurture conversion: free signups → VSL opt-in → qualified, with timing.
  // Behavioural answer to "did the free-course follow-up convert to a VSL
  // opt-in?" — measured in PostHog, not Kit. 120d scan, 90d cohort.
  const nurtureQuery = `
    SELECT
      countIf(isNotNull(t_free)) AS enrolled,
      countIf(isNotNull(t_free) AND isNotNull(t_vsl) AND t_vsl >= t_free) AS to_vsl,
      countIf(isNotNull(t_free) AND isNotNull(t_q) AND t_q >= t_free) AS to_qual,
      round(avg(if(isNotNull(t_free) AND isNotNull(t_vsl) AND t_vsl >= t_free, dateDiff('day', t_free, t_vsl), null)), 1) AS avg_days,
      countIf(isNotNull(t_free) AND isNotNull(t_vsl) AND t_vsl >= t_free AND dateDiff('day', t_free, t_vsl) <= 7) AS within7
    FROM (
      SELECT person_id,
        nullIf(minIf(timestamp, event = 'free_course_submitted'), toDateTime(0)) AS t_free,
        nullIf(minIf(timestamp, event = 'lead_submitted'), toDateTime(0)) AS t_vsl,
        nullIf(minIf(timestamp, event = 'qualify_form_submitted'), toDateTime(0)) AS t_q
      FROM events WHERE timestamp >= now() - INTERVAL 120 DAY
      GROUP BY person_id
    )
    WHERE isNotNull(t_free) AND t_free >= now() - INTERVAL ${days} DAY
  `;

  const [vslRows, freeRows, crossRows, sourceRows, dailyRows, brokerRows, vslSplitRows, nurtureRows, trackingSinceRows, team, sequences, broadcasts, revenue, booking] = await Promise.all([
    hogql(orderedFunnelQuery(VSL_STEPS, days)),
    hogql(orderedFunnelQuery(FREE_STEPS, days)),
    hogql(crossoverQuery),
    hogql(sourcesQuery),
    hogql(dailyQuery),
    hogql(brokerQuery),
    hogql(vslSplitQuery),
    hogql(nurtureQuery),
    hogql(`SELECT min(timestamp) FROM events`),
    fetchCallStats(days).catch(() => []),
    fetchSequences().catch(() => []),
    fetchBroadcasts().catch(() => []),
    fetchWhopRevenue(days).catch(() => null),
    fetchBookingFunnel(days).catch(() => null),
  ]);

  const buildSteps = (defs: Step[], rows: unknown[][]) => {
    const row = rows[0] ?? [];
    return defs.map((s, i) => ({ id: s.id, label: s.label, count: Number(row[i] ?? 0), note: s.note }));
  };

  const cr = crossRows[0] ?? [];
  const crossover = {
    freeTotal: Number(cr[0] ?? 0),
    vslTotal: Number(cr[1] ?? 0),
    crossed: Number(cr[2] ?? 0),
  };

  const sources = sourceRows.map((r) => ({
    source: String(r[0] ?? "(direct)"),
    content: String(r[1] ?? ""),
    visitors: Number(r[2] ?? 0),
    freeSignups: Number(r[3] ?? 0),
    surveys: Number(r[4] ?? 0),
  }));

  const daily = dailyRows.map((r) => ({
    date: String(r[0] ?? ""),
    free: Number(r[1] ?? 0),
    vsl: Number(r[2] ?? 0),
  }));

  const br = brokerRows[0] ?? [];
  const broker = {
    viewed: Number(br[0] ?? 0),
    clicked: Number(br[1] ?? 0),
    hydra: Number(br[2] ?? 0),
    blofin: Number(br[3] ?? 0),
    skipped: Number(br[4] ?? 0),
    confirmed: Number(br[5] ?? 0),
  };
  // Attribute the actual closes back to their lead source (free course?).
  const closeOrigin = await attributeClosesToFreeCourse(revenue?.quantumCloseMems ?? [], revenue?.wolfWesternMems ?? []).catch(() => null);

  const vs = vslSplitRows[0] ?? [];
  const vslSplit = {
    quantum: Number(vs[0] ?? 0), // book route → high-ticket
    wolf: Number(vs[1] ?? 0), // wolfpack route → self-serve
    intl: Number(vs[2] ?? 0), // geo $297 offer
    bookViewed: Number(vs[3] ?? 0), // landed on /book
    wolfpackViewed: Number(vs[4] ?? 0), // landed on /wolfpack
    globalViewed: Number(vs[5] ?? 0), // landed on /wolfpack-global ($297)
    quantumFromFree: closeOrigin?.quantumFromFree ?? 0, // closes that came from a free-course signup
    wolfFromFree: closeOrigin?.wolfFromFree ?? 0,
  };

  const nr = nurtureRows[0] ?? [];
  const nurture = {
    enrolled: Number(nr[0] ?? 0),
    toVsl: Number(nr[1] ?? 0),
    toQualified: Number(nr[2] ?? 0),
    avgDays: Number(nr[3] ?? 0),
    within7: Number(nr[4] ?? 0),
  };

  const trackingSince = trackingSinceRows[0]?.[0] ? String(trackingSinceRows[0][0]) : null;

  const payload = {
    period: days,
    trackingSince,
    free: buildSteps(FREE_STEPS, freeRows),
    vsl: buildSteps(VSL_STEPS, vslRows),
    crossover,
    sources,
    daily,
    broker,
    vslSplit,
    nurture,
    team,
    sequences,
    broadcasts,
    booking,
    revenue,
  };
  _cache.set(days, { t: Date.now(), payload });
  return NextResponse.json(payload);
}
