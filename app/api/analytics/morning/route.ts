// GET /api/analytics/morning?end=<iso>
//
// The Morning Report. It's a 5am snapshot of the COMPLETED prior day: `end` is
// the viewer's most-recent local 5am (computed client-side), and the window is
// the 24h BEFORE it — [end-24h, end]. So at any time of day you see everything
// that happened "yesterday", and it rolls over at the next 5am. Deltas compare
// to the 24h before that ([end-48h, end-24h]). Revenue is from Whop.

import { NextRequest, NextResponse } from "next/server";
import { isAuthed } from "@/lib/analytics-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Whop revenue strictly within [startSec, endSec] — accurate to the morning
// window. VSL high-ticket products + the ≥$2,500 one-time rule define a "close"
// (same as the rest of the dashboard).
async function revenueWithin(startSec: number, endSec: number) {
  const apiKey = process.env.WHOP_API_KEY || "";
  if (!apiKey) return null;
  const headers = { Authorization: `Bearer ${apiKey}`, Accept: "application/json" };
  const floor = startSec - 2 * 86_400; // stop paging a bit past the window
  const VSL = new Set(["prod_23wyE3QA7YRM1", "prod_nEYd6ZU4cVPQe"]); // Quantum Cipher, Mentorship ELITE
  type Pay = { status?: string; final_amount?: number; paid_at?: number; created_at?: number; billing_reason?: string; product?: string };
  let net = 0, count = 0, highTicket = 0, highTicketRev = 0;
  for (let pg = 1; pg <= 20; pg++) {
    const res = await fetch(`https://api.whop.com/api/v2/payments?page=${pg}&per=50`, { headers, cache: "no-store" });
    if (!res.ok) break;
    const items: Pay[] = (await res.json()).data ?? [];
    if (items.length === 0) break;
    for (const p of items) {
      const ts = p.paid_at ?? p.created_at ?? 0;
      if (ts >= startSec && ts < endSec && p.status === "paid") {
        const amt = p.final_amount ?? 0;
        net += amt;
        count++;
        const oneTime = p.billing_reason === "one_time" || p.billing_reason === "subscription_create";
        if (oneTime && amt >= 2500 && VSL.has(typeof p.product === "string" ? p.product : "")) {
          highTicket++;
          highTicketRev += amt;
        }
      }
    }
    if (Math.min(...items.map((p) => p.paid_at ?? p.created_at ?? 0)) < floor) break;
  }
  return { net: Math.round(net), count, highTicket, highTicketRev: Math.round(highTicketRev) };
}

const PH_PROJECT = "430887";
const PH_HOST = "https://us.i.posthog.com";
const FREE_HOST = "free.quantumcipherlab.com";

async function hogql(query: string): Promise<unknown[][]> {
  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY || "";
  if (!apiKey) return [];
  const res = await fetch(`${PH_HOST}/api/projects/${PH_PROJECT}/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
    cache: "no-store",
  });
  if (!res.ok) return [];
  return ((await res.json()).results ?? []) as unknown[][];
}

const dt = (iso: string) => `toDateTime('${iso.slice(0, 19).replace("T", " ")}')`;
const isoOk = (s: string | null) => !!s && /^[\dT:.\-+Z ]+$/.test(s);

// counts for [start, end)
function windowQuery(start: string, end: string): string {
  return `
    SELECT
      uniqIf(person_id, event = '$pageview') AS visitors,
      countIf(event = '$pageview' AND (properties.$host = '${FREE_HOST}' OR properties.$pathname = '/free-course')) AS free_views,
      countIf(event = 'free_course_submitted') AS free_signups,
      countIf(event = 'lead_submitted') AS vsl_leads,
      countIf(event = 'qualify_form_started') AS apps_started,
      countIf(event = 'qualify_form_submitted') AS qualified,
      countIf(event = 'qualify_form_submitted' AND properties.routing = 'book') AS quantum,
      countIf(event = 'qualify_form_submitted' AND properties.routing = 'wolfpack') AS wolf,
      countIf(event = 'broker_offer_clicked') AS broker_clicks,
      countIf(event = 'book_page_viewed') AS book_views,
      countIf(event = 'call_booked') AS booked,
      countIf(event = 'book_fallback_requested') AS callbacks
    FROM events
    WHERE timestamp >= ${dt(start)} AND timestamp < ${dt(end)}
  `;
}

const KEYS = ["visitors", "free_views", "free_signups", "vsl_leads", "apps_started", "qualified", "quantum", "wolf", "broker_clicks", "book_views", "booked", "callbacks"] as const;

export async function GET(req: NextRequest) {
  if (!isAuthed(req.cookies.get("qc_auth")?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // `end` = the viewer's most-recent local 5am (the report anchor). The window
  // is the completed 24h before it. (`since` accepted as a legacy alias.)
  const endParam = req.nextUrl.searchParams.get("end") || req.nextUrl.searchParams.get("since");
  const nowIso = new Date().toISOString();
  const DAY = 86_400_000;
  const end = isoOk(endParam) ? (endParam as string) : nowIso;
  const endMs = Date.parse(end);
  const start = new Date(endMs - DAY).toISOString();        // 24h before the 5am anchor
  const prevStart = new Date(endMs - 2 * DAY).toISOString(); // the day before that

  const [curRows, prevRows, revenue] = await Promise.all([
    hogql(windowQuery(start, end)),
    hogql(windowQuery(prevStart, start)),
    revenueWithin(Math.floor(Date.parse(start) / 1000), Math.floor(endMs / 1000)).catch(() => null),
  ]);

  const toObj = (rows: unknown[][]) => {
    const row = rows[0] ?? [];
    const o: Record<string, number> = {};
    KEYS.forEach((k, i) => (o[k] = Number(row[i] ?? 0)));
    return o;
  };

  return NextResponse.json({
    start, end,
    now: nowIso,
    windowHours: Math.round((endMs - Date.parse(start)) / 3_600_000),
    current: toObj(curRows),
    previous: toObj(prevRows),
    revenue,
  });
}
