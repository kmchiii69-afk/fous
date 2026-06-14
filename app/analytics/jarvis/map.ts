/* eslint-disable @typescript-eslint/no-explicit-any */
// buildV4 — transforms the live analytics API responses into the V4-shaped
// object the ported design components consume. Funnel + morning are fully
// live; the historical/CRM sections (TREND/LEGACY/WEEKLY/ATTRIB/CRM/ROI/PIVOT)
// are seeded from real-recent values and wired to /trends in Phase 2.

export const C = {
  acid: "#BFFA46", blue: "#8FD0FF", purp: "#C9A8FF", amber: "#F59E0B",
  drop: "#F0826D", cyan: "#6FE9FF", bone: "#F2F0E6", ash: "#9AA0AC", dim: "#6B7280",
};

const usd = (n: number) => "$" + Math.round(n || 0).toLocaleString();
const kUsd = (n: number) => (n >= 1000 ? "$" + (n / 1000).toFixed(1) + "K" : "$" + Math.round(n || 0));
const int = (n: number) => Math.round(n || 0).toLocaleString();
const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) + "%" : "—");

// relative time for the live feed — `now` passed in (ticking) so labels stay fresh
export function rel(ts: string, now: number): string {
  const t = Date.parse(ts.replace(" ", "T") + (ts.includes("Z") ? "" : "Z"));
  const s = Math.max(0, Math.round((now - t) / 1000));
  if (s < 45) return "now";
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
}
const deltaStr = (cur: number, prev: number) => {
  if (prev === 0 && cur === 0) return { delta: "—", down: false };
  if (prev === 0) return { delta: "new", down: false };
  const d = Math.round(((cur - prev) / prev) * 100);
  return { delta: `${d >= 0 ? "▲" : "▼"} ${Math.abs(d)}% vs prior`, down: d < 0 };
};

// ── Action Center directives (same logic as the prior Action Center) ──
function buildDirectives(funnel: any) {
  const rev = funnel?.revenue, booking = funnel?.booking, split = funnel?.vslSplit, nurture = funnel?.nurture;
  const avgClose = rev && rev.quantumClose?.count > 0 ? rev.quantumClose.revenue / rev.quantumClose.count : 6500;
  const showRate = booking && booking.meetings > 0 ? booking.showed / booking.meetings : null;
  const closeRate = booking && booking.showed > 0 ? (rev?.quantumClose?.count ?? 0) / booking.showed : 0.35;
  const recs: any[] = [];

  if (booking && booking.meetings >= 3 && showRate !== null && showRate < 0.7) {
    const target = Math.round(booking.meetings * 0.75);
    const extraShows = Math.max(0, target - booking.showed);
    recs.push({
      sev: "HIGH", color: C.drop, node: "q_booked",
      title: "No-shows are eating your closes",
      money: Math.round(extraShows * closeRate * avgClose),
      problem: `${Math.round((1 - showRate) * 100)}% of booked calls no-show or cancel — only ${booking.showed} of ${booking.meetings} actually showed.`,
      fix: "Add SMS + email reminders and a confirm-or-deposit step before the call. Lifting show-rate to 75% is your single biggest lever.",
      metric: `show rate ${Math.round(showRate * 100)}% → 75% target · +${extraShows} shows`,
    });
  }
  if (booking) {
    const notBooked = Math.max(0, (split?.quantum ?? 0) - booking.booked);
    if (notBooked > 0 && booking.laterBooked === 0) {
      recs.push({
        sev: "HIGH", color: C.drop, node: "q_book",
        title: "Qualified leads who don't book get nothing",
        money: Math.round(notBooked * 0.2 * closeRate * avgClose),
        problem: `${notBooked} call-qualified leads never grabbed a time — and 0 were recovered by email or setter follow-up.`,
        fix: "Build a “you qualified but didn't book” sequence (email + SMS, 4–5 touches over 7 days). Recovering 1 in 5 pays for itself.",
        metric: `${notBooked} lost · 0 recovered today`,
      });
    }
  }
  if (nurture && nurture.enrolled > 50) {
    const cr = pct(nurture.toVsl, nurture.enrolled);
    recs.push({
      sev: "MED", color: C.amber, node: "free_signup", money: 0,
      title: "Your free course barely feeds the money funnel",
      problem: `Only ${cr} of ${int(nurture.enrolled)} free signups cross into the VSL, and $0 high-ticket has been traced back to it.`,
      fix: "Rework the first 3 nurture emails to drive the VSL hard. A free magnet that never graduates buyers is a cost center, not an asset.",
      metric: `${cr} free → VSL`,
    });
  }
  if (rev && (split?.globalViewed ?? 0) <= 3) {
    recs.push({
      sev: "LOW", color: C.purp, node: "w_geo", money: 0,
      title: "$297 geo tier is starved, not broken",
      problem: `Only ${split?.globalViewed ?? 0} low-PPP visitor reached /wolfpack-global. Zero sales there is a traffic problem, not a pricing one — don't judge the offer on this.`,
      fix: "Either drive low-PPP traffic into the free funnel, or shelve the geo tier until total reach grows. The decision is upstream of the page.",
      metric: `${split?.globalViewed ?? 0} reached the page`,
    });
  }
  recs.sort((a, b) => (b.money ?? -1) - (a.money ?? -1));
  recs.forEach((r, i) => (r.rank = i + 1));
  const total = recs.reduce((a, r) => a + (r.money ?? 0), 0);
  return { directives: recs, total };
}

// ── living-funnel topology (positions fixed; counts from live funnel) ──
function buildTopology(funnel: any, dirs: any[]) {
  const free = funnel?.free ?? [], vsl = funnel?.vsl ?? [], split = funnel?.vslSplit ?? {},
    booking = funnel?.booking ?? {}, rev = funnel?.revenue ?? {}, cross = funnel?.crossover ?? {},
    broker = funnel?.broker ?? {}, sources = funnel?.sources ?? [];
  const cnt = (a: any[], i: number) => a[i]?.count ?? 0;
  const traffic = cnt(free, 0) + cnt(vsl, 0);
  const qc = rev.quantumClose ?? { count: 0, revenue: 0 };
  const ww = rev.wolfNewWestern ?? { count: 0, revenue: 0 };
  const wg = rev.wolfNewIntl ?? { count: 0, revenue: 0 };
  const top3 = sources.slice(0, 3).map((s: any) => `${(s.source || "").replace(/^www\.|\.com$/g, "").slice(0, 10)} ${int(s.visitors)}`).join(" · ");
  const leak = (node: string) => { const d = dirs.find((x) => x.node === node && x.money > 0); return d ? { text: `${kUsd(d.money)} LEAKING`, sev: "high" } : null; };

  const nodes: any = {
    traffic:     { x: 0.042, y: 0.45,  label: "ALL TRAFFIC", sub: top3 || "all sources", count: traffic, color: "bone", kind: "source" },
    free_visit:  { x: 0.168, y: 0.250, label: "FREE VISIT", sub: "free.quantumcipherlab.com", count: cnt(free, 0), color: "acid" },
    vsl_visit:   { x: 0.168, y: 0.625, label: "VSL VISIT", sub: "quantumcipherlab.com", count: cnt(vsl, 0), color: "blue" },
    free_signup: { x: 0.318, y: 0.215, label: "SIGNUP", sub: "email captured", count: cnt(free, 1), color: "acid", chip: true },
    vsl_optin:   { x: 0.318, y: 0.625, label: "OPT-IN", sub: "lead captured", count: cnt(vsl, 1), color: "blue" },
    free_course: { x: 0.468, y: 0.170, label: "COURSE", sub: "reached content", count: cnt(free, 2), color: "acid", kind: "terminal" },
    vsl_app:     { x: 0.468, y: 0.625, label: "APPLIED", sub: "started application", count: cnt(vsl, 2), color: "blue" },
    qualified:   { x: 0.598, y: 0.625, label: "QUALIFIED", sub: "routing gate", count: cnt(vsl, 3), color: "blue", kind: "gate" },
    q_book:      { x: 0.718, y: 0.460, label: "/BOOK", sub: `${split.quantum ?? 0} quantum-qualified`, count: split.bookViewed ?? 0, color: "blue" },
    q_booked:    { x: 0.818, y: 0.360, label: "BOOKED", sub: "call on calendar", count: booking.booked ?? 0, color: "blue" },
    q_showed:    { x: 0.894, y: 0.275, label: "SHOWED", sub: "attended call", count: booking.showed ?? 0, color: "blue" },
    q_closed:    { x: 0.958, y: 0.190, label: "CLOSED", sub: `${kUsd(qc.revenue)} cash`, count: qc.count, color: "acid", kind: "terminal", money: true },
    w_page:      { x: 0.748, y: 0.795, label: "/WOLFPACK", sub: "western · $997", count: split.wolfpackViewed ?? 0, color: "cyan" },
    w_buy:       { x: 0.872, y: 0.795, label: "WOLF · $997", sub: `${kUsd(ww.revenue)} cash`, count: ww.count, color: "cyan", kind: "terminal" },
    w_geo:       { x: 0.872, y: 0.915, label: "GEO · $297", sub: `${split.globalViewed ?? 0} visit · ${wg.count} sales`, count: Math.max(split.globalViewed ?? 0, wg.count), color: "purp", kind: "terminal" },
  };
  const e = (from: string, to: string, count: number, extra: any = {}) => ({ from, to, count, ...extra });
  const edges = [
    e("traffic", "free_visit", cnt(free, 0)),
    e("traffic", "vsl_visit", cnt(vsl, 0)),
    e("free_visit", "free_signup", cnt(free, 1), { conv: pct(cnt(free, 1), cnt(free, 0)) }),
    e("free_signup", "free_course", cnt(free, 2), { conv: pct(cnt(free, 2), cnt(free, 1)) }),
    e("free_signup", "vsl_optin", cross.crossed ?? 0, { cross: true, tag: { text: `FREE→VSL · ${pct(cross.crossed ?? 0, cnt(free, 1))}`, sev: "med" } }),
    e("vsl_visit", "vsl_optin", Math.max(0, cnt(vsl, 1) - (cross.crossed ?? 0)), { conv: pct(cnt(vsl, 1), cnt(vsl, 0)) }),
    e("vsl_optin", "vsl_app", cnt(vsl, 2), { conv: pct(cnt(vsl, 2), cnt(vsl, 1)) }),
    e("vsl_app", "qualified", cnt(vsl, 3), { conv: pct(cnt(vsl, 3), cnt(vsl, 2)) }),
    e("qualified", "q_book", split.bookViewed ?? 0),
    e("qualified", "w_page", split.wolfpackViewed ?? 0),
    e("qualified", "w_geo", split.globalViewed ?? 0),
    e("q_book", "q_booked", booking.booked ?? 0, { conv: pct(booking.booked ?? 0, split.bookViewed ?? 0) }),
    e("q_booked", "q_showed", booking.showed ?? 0, { conv: pct(booking.showed ?? 0, booking.booked ?? 0) }),
    e("q_showed", "q_closed", qc.count, { conv: pct(qc.count, booking.showed ?? 0) }),
    e("w_page", "w_buy", ww.count, { conv: pct(ww.count, split.wolfpackViewed ?? 0) }),
  ];
  return {
    nodes, edges,
    leakTags: { q_book: leak("q_book"), q_booked: leak("q_booked") },
    stages: [
      { x: 0.168, t: "01 REACH" }, { x: 0.318, t: "02 CAPTURE" }, { x: 0.468, t: "03 INTENT" },
      { x: 0.598, t: "04 QUALIFY" }, { x: 0.718, t: "05 ROUTE" }, { x: 0.818, t: "06 CALL" }, { x: 0.958, t: "07 CLOSE" },
    ],
    brokerChip: `BROKER BUMP · ${broker.viewed ?? 0} SAW · HYDRA ${broker.hydra ?? 0} / BLOFIN ${broker.blofin ?? 0}`,
  };
}

export const EVENT_TYPES: any = {
  booked_call:   { color: C.acid, glyph: "★", label: "BOOKED A CALL", sub: "call scheduled", stage: "q_booked" },
  book_view:     { color: C.blue, glyph: "▥", label: "Viewed booking page", sub: "on the calendar", stage: "q_book" },
  quantum_qual:  { color: C.blue, glyph: "▶", label: "QUANTUM qualified", sub: "$2,500+ tier · routed to a call", stage: "qualified" },
  wolf_qual:     { color: C.cyan, glyph: "▷", label: "Wolf qualified", sub: "budget tier · self-serve", stage: "qualified" },
  app_started:   { color: C.blue, glyph: "▣", label: "Started application", sub: "filling the survey", stage: "vsl_app" },
  vsl_optin:     { color: C.blue, glyph: "◆", label: "VSL opt-in", sub: "entered the VSL funnel", stage: "vsl_optin" },
  course_reached:{ color: C.acid, glyph: "◇", label: "Reached the course", sub: "free funnel", stage: "free_course" },
  broker_skip:   { color: C.dim,  glyph: "▢", label: "Skipped brokers", sub: "straight to course", stage: "free_signup" },
  broker_view:   { color: C.amber, glyph: "▤", label: "Saw broker offers", sub: "order-bump", stage: "free_signup" },
  free_optin:    { color: C.acid, glyph: "◈", label: "Free course opt-in", sub: "new lead", stage: "free_signup" },
  hydra_click:   { color: C.amber, glyph: "▦", label: "Clicked Hydra", sub: "affiliate click", stage: "free_signup" },
  blofin_click:  { color: C.amber, glyph: "▦", label: "Clicked BloFin", sub: "affiliate click", stage: "free_signup" },
  callback:      { color: C.purp, glyph: "◑", label: "Requested a callback", sub: "didn't self-book", stage: "q_book" },
};

// map a raw /api/analytics/live event → telemetry event type
export function mapLiveEvent(e: any): string {
  switch (e.event) {
    case "call_booked": return "booked_call";
    case "book_page_viewed": return "book_view";
    case "qualify_form_submitted": return e.routing === "book" ? "quantum_qual" : "wolf_qual";
    case "qualify_form_started": return "app_started";
    case "lead_submitted": return "vsl_optin";
    case "free_course_confirm_viewed": return "course_reached";
    case "broker_offers_skipped": return "broker_skip";
    case "broker_offers_viewed": return "broker_view";
    case "free_course_submitted": return "free_optin";
    case "broker_offer_clicked": return e.broker === "hydra" ? "hydra_click" : "blofin_click";
    case "book_fallback_requested": return "callback";
    case "qualify_intl_offer": return "wolf_qual";
    default: return "vsl_optin";
  }
}

// ── seeds for the historical/CRM tail (real-recent; wired live in Phase 2) ──
const SEEDS = {
  PIVOT: [
    { color: C.purp, title: "Recurring was sunset on purpose", text: "The legacy $197/mo base is winding down by design, not churn-as-failure. Crypto audiences quit hard in bear markets — recurring was the wrong model for them." },
    { color: C.acid, title: "The pivot is working", text: "One-time revenue ramped ~4.5× Jan→Apr ($9k → $41k) as high-ticket replaced recurring. April's $51k was your best month ever — the new model can out-earn the old one." },
    { color: C.amber, title: "But high-ticket is lumpy by nature", text: "A handful of $7.5k closes = inherent month-to-month swing. May regressed to $37k. The fix isn't a steadier price — it's more qualified volume in the pipeline." },
    { color: C.blue, title: "Long trust cycle = nurture is everything", text: "Nobody pays $7,500 cold — it takes time. So the warm-up engine (free course → email → VSL) is now mission-critical, and it's leaky: only ~10% of free signups cross to the VSL." },
    { color: C.acid, title: "Revenue is reach-constrained", text: "Sales track content reach (Bitly clicks) almost 1:1 — April peak clicks = April peak revenue. The growth lever is top-of-funnel volume feeding the nurture, not conversion tweaks." },
    { color: C.drop, title: "Recent reach is softening", text: "Last 4 weeks: page views down sharply, qualified leads falling. Fewer people entering the nurture now means fewer high-ticket closes 30–60 days out." },
  ],
  ROI: {
    flow: [
      { v: "345", label: "Free course signups", sub: "entered the magnet" },
      { v: "2", label: "Ever bought anything", sub: "0.6% buy rate" },
      { v: "0", label: "Bought high-ticket", sub: "Quantum / VSL offers", drop: true },
      { v: "$493", label: "Total revenue produced", sub: "all-time, all products", money: true },
    ],
    verdict: "The free course has produced $0 in high-ticket and $493 total. Out of 345 signups, 2 bought — and only tiny low-ticket subs, not a single Quantum close. Your #1 lead magnet is, in revenue terms, not working yet. This is the single most important thing to fix.",
    buyers: ["rmi***@gmail.com · $394 · Wolf Pack Pro", "jrl***@gmail.com · $99 · Wolf Pack Pro"],
    method: "Matched: free-course email subscribers (Kit) ∩ paid Whop buyers (by membership email), last 120 days. A lower bound.",
  },
  TREND: { months: ["25-10","25-11","25-12","26-01","26-02","26-03","26-04","26-05","26-06*"], values: [41,44,38,27,29,42,52,37,13], deltas: [null,"+5%","-12%","-30%","+7%","+46%","+23%","-27%",null], note: "* current month is partial. 9 months from Whop — legacy recurring handed off to high-ticket one-time, which peaked in April." },
  LEGACY: [
    { label: "Still active", value: "141", sub: "residual recurring", color: C.acid },
    { label: "Ended (by design)", value: "4,760", sub: "legacy $197/mo base", color: C.purp },
    { label: "Recurring now", value: "$13,639", sub: "trailing month", color: C.bone },
    { label: "Replaced by", value: "High-ticket", sub: "$997 · $7,500 one-time", color: C.blue, small: true },
  ],
  WEEKLY: { labels: ["05-17", "05-24", "05-31", "06-07"], lines: [
    { name: "Page views", color: C.ash, values: [40, 420, 520, 300], scale: "main" },
    { name: "VSL leads", color: C.blue, values: [18, 90, 55, 52], scale: "sub" },
    { name: "Qualified", color: C.acid, values: [8, 44, 30, 28], scale: "sub" },
  ], note: "PostHog history starts late May. Page views use the left scale; leads/qualified share a sub-scale." },
  ATTRIB: {
    tiles: [
      { label: "Tracked revenue", value: "$35,114", sub: "71 customers", color: C.acid, money: true },
      { label: "Leads", value: "584", sub: "1.37% convert", color: C.bone },
      { label: "Lead value", value: "$37", sub: "avg $ per lead", color: C.blue },
      { label: "Days to purchase", value: "—", sub: "lead → sale, avg", color: C.amber },
    ],
    channels: [
      ["social", C.purp, "282", "3", "1.1%", "$2,491", "$9"], ["direct", C.acid, "159", "5", "3.1%", "$5,488", "$35"],
      ["email", C.blue, "26", "1", "3.8%", "$997", "$38"], ["search", C.amber, "6", "0", "0.0%", "$0", "$0"], ["referral", C.drop, "5", "0", "0.0%", "$0", "$0"],
    ],
    first: [["social", 282, C.purp], ["direct", 159, C.acid], ["email", 26, C.blue], ["search", 6, C.amber], ["referral", 5, C.drop]],
    last: [["direct", 5488, C.acid], ["social", 0, C.purp], ["email", 0, C.blue], ["search", 0, C.amber], ["referral", 0, C.drop]],
    campaigns: [["Congrats, youre now part of the 1%", 12], ["Welcome — You Made the Right Call", 4], ["The proof is in the results", 4], ["The $2 trillion edge smart money has over you", 4], ["How institutions really trade", 4], ["Bull markets create the biggest losers", 3]],
    pattern: "Social & YouTube dominate first touch (they fill the funnel) but barely appear in last touch — people discover through your content, then come back direct to buy. Judge content ROI on first touch, judge closing friction on last touch.",
  },
  CRM: {
    members: [
      { label: "Active Members", value: "2,899", sub: "all-time active on Whop", color: C.acid },
      { label: "Email Subscribers", value: "13,700", sub: "+618 new in 30d", color: C.blue },
      { label: "Demo Booked", value: "10", sub: "last 30 days · from Close", color: C.bone },
      { label: "Closed Won", value: "0", sub: "Close status — see note", color: C.drop },
    ],
    rates: [["Connection Rate", "0 called → 224 connected", "—"], ["Booking Rate", "224 connected → 10 booked", "4%"], ["No Pickups", "Setter called · no answer", "16"], ["Show Rate", "10 booked → 10 showed", "100%"], ["Close Rate", "10 showed → 0 closed", "0%"], ["No Shows", "Booked · didn't appear", "0"]],
    buckets: [["Short-Term FU", "0", "Closes within 7 days"], ["Long-Term FU", "0", "Longer nurture"], ["Deposit", "0", "Partial payment in"], ["Lost / DQ'd", "24", "All disqualified"]],
    booked: [["Total Booked", "7"], ["Active", "7"], ["Canceled", "0"], ["Cancel Rate", "0%"]],
    pipeline: [["Opt In", 315, C.ash], ["Setter Connected", 224, C.purp], ["DQ", 24, C.drop], ["No pickup", 16, C.dim], ["Demo Booked", 10, C.blue], ["Free Course Opt In", 9, C.acid], ["Opted in again", 5, C.ash], ["Applied But Did Not Book", 4, C.ash]],
  },
};

// ── live mappers for the historical/CRM tail (/trends + /data) ──
const CH: Record<string, string> = { email: C.blue, social: C.purp, direct: C.acid, search: C.amber, referral: C.drop };

function liveTrend(t: any) {
  const m = t.monthly || [];
  if (m.length < 2) return SEEDS.TREND;
  const nowYM = new Date().toISOString().slice(0, 7);
  return {
    months: m.map((x: any) => x.month.slice(2) + (x.month === nowYM ? "*" : "")),
    values: m.map((x: any) => Math.round((x.total || 0) / 1000)),
    deltas: m.map((x: any, i: number) => {
      if (i === 0 || x.month === nowYM) return null;
      const prev = m[i - 1].total;
      return prev > 0 ? `${x.total >= prev ? "+" : ""}${Math.round(((x.total - prev) / prev) * 100)}%` : null;
    }),
    note: "9 months from Whop — legacy recurring handed off to high-ticket one-time. * current month is partial.",
  };
}
function liveLegacy(t: any) {
  const mem = t.memberships || { active: 0, canceled: 0, expired: 0, completed: 0 };
  if (!mem.active && !mem.canceled && !mem.expired && !mem.completed) return SEEDS.LEGACY; // empty → keep seed
  const m = t.monthly || [];
  const nowYM = new Date().toISOString().slice(0, 7);
  const recNow = m.length ? (m[m.length - 1].month === nowYM ? (m[m.length - 2]?.recurring ?? 0) : m[m.length - 1].recurring) : 0;
  return [
    { label: "Still active", value: int(mem.active), sub: "residual recurring", color: C.acid },
    { label: "Ended (by design)", value: int(mem.canceled + mem.expired + mem.completed), sub: "legacy $197/mo base", color: C.purp },
    { label: "Recurring now", value: usd(recNow), sub: "trailing month", color: C.bone },
    { label: "Replaced by", value: "High-ticket", sub: "$997 · $7,500 one-time", color: C.blue, small: true },
  ];
}
function liveWeekly(t: any) {
  const w = (t.weekly || []).slice(-8);
  if (w.length < 2) return SEEDS.WEEKLY;
  return {
    labels: w.map((x: any) => x.week.slice(5)),
    lines: [
      { name: "Page views", color: C.ash, values: w.map((x: any) => x.views), scale: "main" },
      { name: "VSL leads", color: C.blue, values: w.map((x: any) => x.vsl), scale: "sub" },
      { name: "Qualified", color: C.acid, values: w.map((x: any) => x.qualified), scale: "sub" },
    ],
    note: "Top-of-funnel momentum, week over week. Page views use the left scale; leads/qualified share a sub-scale.",
  };
}
function liveAttrib(t: any) {
  const a = t.attribution;
  if (!a) return SEEDS.ATTRIB;
  return {
    tiles: [
      { label: "Tracked revenue", value: usd(a.revenue), sub: `${a.customers} customers`, color: C.acid, money: true },
      { label: "Leads", value: int(a.totalLeads), sub: `${a.convRate}% convert`, color: C.bone },
      { label: "Lead value", value: usd(a.leadValue), sub: "avg $ per lead", color: C.blue },
      { label: "Days to purchase", value: a.daysUntilPurchase > 0 ? `${a.daysUntilPurchase}d` : "—", sub: "lead → sale, avg", color: C.amber },
    ],
    channels: (a.byChannel || []).map((c: any) => [c.channel, CH[c.channel] || C.dim, int(c.leads), int(c.customers), `${(c.conversionRate ?? 0).toFixed(1)}%`, usd(c.revenue), usd(c.leadValue)]),
    first: (a.firstTouch || []).map((x: any) => [x.channel, x.leads, CH[x.channel] || C.dim]),
    last: (a.lastTouch || []).map((x: any) => [x.channel, x.revenue, CH[x.channel] || C.dim]),
    campaigns: (a.topCampaigns || []).map((c: any) => [c.campaign, c.leads]),
    pattern: SEEDS.ATTRIB.pattern,
  };
}
function liveRoi(t: any) {
  const fc = t.freeCourseRoi;
  if (!fc) return SEEDS.ROI;
  const buyRate = fc.signups > 0 ? (Math.round((fc.buyers / fc.signups) * 1000) / 10) : 0;
  return {
    flow: [
      { v: int(fc.signups), label: "Free course signups", sub: "entered the magnet" },
      { v: int(fc.buyers), label: "Ever bought anything", sub: `${buyRate}% buy rate` },
      { v: int(fc.highTicketBuyers), label: "Bought high-ticket", sub: "Quantum / VSL offers", drop: fc.highTicketBuyers === 0 },
      { v: usd(fc.revenue), label: "Total revenue produced", sub: "all-time, all products", money: true },
    ],
    verdict: fc.highTicketBuyers === 0
      ? `The free course has produced $0 in high-ticket and ${usd(fc.revenue)} total. Out of ${int(fc.signups)} signups, ${fc.buyers} bought — ${fc.buyers > 0 ? "only tiny low-ticket subs, not a single Quantum close" : "nothing at all"}. Your #1 lead magnet is, in revenue terms, not working yet. This is the single most important thing to fix.`
      : `The free course produced ${usd(fc.revenue)} from ${fc.buyers} buyers (${fc.highTicketBuyers} high-ticket). Matched by email, so it's a floor — same-email purchases only.`,
    buyers: (fc.details || []).slice(0, 3).map((d: any) => `${d.masked} · ${usd(d.revenue)} · ${d.product}`),
    method: "Matched: free-course email subscribers (Kit) ∩ paid Whop buyers (by membership email), last 120 days. A lower bound.",
  };
}
function liveCrm(data: any) {
  if (!data) return SEEDS.CRM;
  const s = data.close?.byStatus ?? {};
  const g = (k: string) => s[k] ?? 0;
  const closed = g("Closed"), deposit = g("Deposit");
  const setterCalled = g("Setter Called"), setterConn = g("Setter Connected"), demoBooked = g("Demo Booked");
  const noShow = g("No Show"), callCanceled = g("Call Canceled"), noPickup = g("No pickup");
  const showed = Math.max(0, demoBooked - noShow - callCanceled);
  const lost = g("DQ") + g("Not Financially Qualified") + g("Bad Fit") + g("DNC (do not contact)") + noShow + callCanceled + g("Bad Data");
  const pv = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) + "%" : "—");
  const cal = data.calendly ?? { total: 0, active: 0, canceled: 0 };
  const WIN = ["Closed", "Deposit"], LOSS = ["DQ", "Not Financially Qualified", "Bad Fit", "DNC (do not contact)", "No Show", "Call Canceled", "Bad Data"], ACT = ["Potential", "Booked", "Qualified", "Short Term Follow Up (7-days Till Close)", "Long Term Follow Up", "Rescheduling", "Demo Booked", "Waitlist Lead"];
  const barColor = (l: string) => WIN.includes(l) ? C.acid : LOSS.includes(l) ? C.drop : ACT.includes(l) ? C.blue : l.startsWith("Setter") ? C.purp : C.dim;
  const pipeline = Object.entries(s).filter(([, v]: any) => v > 0).sort((a: any, b: any) => b[1] - a[1]).slice(0, 10).map(([l, v]: any) => [l, v, barColor(l)]);
  return {
    members: [
      { label: "Active Members", value: int(data.whop?.totalActive ?? 0), sub: "all-time active on Whop", color: C.acid },
      { label: "Email Subscribers", value: int(data.kit?.totalSubscribers ?? 0), sub: data.kit?.newSubscribers ? `+${int(data.kit.newSubscribers)} new in 30d` : "total on Kit", color: C.blue },
      { label: "Demo Booked", value: int(demoBooked), sub: "last 30 days · from Close", color: C.bone },
      { label: "Closed Won", value: int(closed + deposit), sub: "Close status — see note", color: closed + deposit > 0 ? C.acid : C.drop },
    ],
    rates: [
      ["Connection Rate", `${int(setterCalled)} called → ${int(setterConn)} connected`, pv(setterConn, setterCalled)],
      ["Booking Rate", `${int(setterConn)} connected → ${int(demoBooked)} booked`, pv(demoBooked, setterConn)],
      ["No Pickups", "Setter called · no answer", int(noPickup)],
      ["Show Rate", `${int(demoBooked)} booked → ${int(showed)} showed`, pv(showed, demoBooked)],
      ["Close Rate", `${int(showed)} showed → ${int(closed)} closed`, pv(closed, showed)],
      ["No Shows", "Booked · didn't appear", int(noShow)],
    ],
    buckets: [
      ["Short-Term FU", int(g("Short Term Follow Up (7-days Till Close)")), "Closes within 7 days"],
      ["Long-Term FU", int(g("Long Term Follow Up")), "Longer nurture"],
      ["Deposit", int(deposit), "Partial payment in"],
      ["Lost / DQ'd", int(lost), "All disqualified"],
    ],
    booked: [["Total Booked", int(cal.total)], ["Active", int(cal.active)], ["Canceled", int(cal.canceled)], ["Cancel Rate", pv(cal.canceled, cal.total)]],
    pipeline,
  };
}

export type V4 = ReturnType<typeof buildV4>;

export function buildV4(funnel: any, morning: any, trends: any = null, data: any = null) {
  const { directives, total } = buildDirectives(funnel);
  const rev = funnel?.revenue ?? {};
  const split = funnel?.vslSplit ?? {};
  const booking = funnel?.booking ?? {};
  const daily = funnel?.daily ?? [];
  const team = funnel?.team ?? [];
  const sources = funnel?.sources ?? [];
  const nurture = funnel?.nurture ?? {};
  const free = funnel?.free ?? [];
  const vsl = funnel?.vsl ?? [];
  const broker = funnel?.broker ?? {};
  const cross = funnel?.crossover ?? {};
  const newLeads = daily.reduce((a: number, d: any) => a + d.free + d.vsl, 0);
  const dials = team.reduce((a: number, t: any) => a + t.calls, 0);
  const convo = team.reduce((a: number, t: any) => a + t.answered, 0);
  const qc = rev.quantumClose ?? { count: 0, revenue: 0 };

  // MORNING
  const m = morning?.current ?? {};
  const p = morning?.previous ?? {};
  const mr = morning?.revenue ?? { net: 0, count: 0, highTicket: 0, highTicketRev: 0 };
  const mLeads = (m.free_signups ?? 0) + (m.vsl_leads ?? 0), pLeads = (p.free_signups ?? 0) + (p.vsl_leads ?? 0);
  const MORNING = {
    meta: `the 5am report · prior ${morning?.windowHours ?? 24}h (yesterday)`,
    current: m, previous: p,
    tiles: [
      { label: "Revenue collected", value: usd(mr.net), sub: `${mr.count} payments`, color: C.acid, money: true },
      { label: "High-ticket closes", value: String(mr.highTicket), sub: `${usd(mr.highTicketRev)} this window`, color: C.bone },
      { label: "New leads", value: int(mLeads), sub: "free + VSL", ...deltaStr(mLeads, pLeads), color: C.bone },
      { label: "Free signups", value: int(m.free_signups ?? 0), sub: "free funnel", ...deltaStr(m.free_signups ?? 0, p.free_signups ?? 0), color: C.bone },
      { label: "VSL opt-ins", value: int(m.vsl_leads ?? 0), sub: "vsl funnel", ...deltaStr(m.vsl_leads ?? 0, p.vsl_leads ?? 0), color: C.blue },
      { label: "Qualified", value: int(m.qualified ?? 0), sub: `${m.quantum ?? 0} quantum · ${m.wolf ?? 0} wolf`, ...deltaStr(m.qualified ?? 0, p.qualified ?? 0), color: C.bone },
      { label: "Calls booked", value: int(m.booked ?? 0), sub: (m.callbacks ?? 0) > 0 ? `${m.callbacks} callback req` : "calls", ...deltaStr(m.booked ?? 0, p.booked ?? 0), color: C.blue },
      { label: "Broker clicks", value: int(m.broker_clicks ?? 0), sub: "affiliate", ...deltaStr(m.broker_clicks ?? 0, p.broker_clicks ?? 0), color: C.amber },
    ],
    flow: [[int(m.visitors ?? 0), "visitors"], [int(mLeads), "leads"], [int(m.apps_started ?? 0), "applied"], [int(m.qualified ?? 0), "qualified"], [int(m.booked ?? 0), "booked"], [String(mr.highTicket), "closed"]],
  };

  // JARVIS briefing + read (from live morning)
  const tod = (() => { const h = new Date().getHours(); return h < 12 ? "morning" : h < 18 ? "afternoon" : "evening"; })();
  const briefing = `Good ${tod}, Cameron. Yesterday: ${int(m.visitors ?? 0)} visitors, ${int(mLeads)} new leads, ${int(m.qualified ?? 0)} qualified — ${m.quantum ?? 0} quantum and ${m.wolf ?? 0} wolf — and ${m.booked ?? 0} ${(m.booked ?? 0) === 1 ? "call" : "calls"} booked. ${usd(mr.net)} collected${mr.highTicket > 0 ? `, ${mr.highTicket} high-ticket close.` : ", no high-ticket close."}`;
  const myRead: any[] = [];
  if ((m.visitors ?? 0) > 0) { const r = Math.round(mLeads / m.visitors * 100); myRead.push({ color: r >= 12 ? C.acid : C.amber, text: `Opt-in is ${r}% of ${int(m.visitors)} visitors — ${r >= 12 ? "healthy for cold traffic. Keep the top of funnel fed." : "the hook or landing page is leaking."}` }); }
  if (mLeads > 0) { const r = Math.round((m.qualified ?? 0) / mLeads * 100); myRead.push({ color: r >= 30 ? C.acid : C.amber, text: `${m.qualified ?? 0} of ${mLeads} leads qualified (${r}%) — ${r >= 30 ? "the survey is filtering well." : "watch traffic quality or survey tightness."}` }); }
  if ((m.booked ?? 0) > 0 && mr.highTicket === 0) myRead.push({ color: C.drop, text: `${m.booked} calls booked but zero closed. Today's money is on those calls showing and closing — your number one lever right now.` });
  if (!myRead.length) myRead.push({ color: C.amber, text: "Quiet window so far. Reach drives everything here — let's get more eyes on the funnel." });

  const d0 = directives[0], d1 = directives[1];
  const JARVIS = {
    briefing, myRead,
    qa: [
      { q: "what should i fix", a: d0 ? `${d0.title}. ${d0.problem} ${d0.fix}${d0.money > 0 ? ` That's ~${usd(d0.money)} back.` : ""}${d1 && d1.money > 0 ? ` Then: ${d1.title.toLowerCase()} — ~${usd(d1.money)}.` : ""}` : "The funnel looks clean right now — keep feeding the top." },
      { q: "how's the wolf path", a: `${int(split.wolfpackViewed ?? 0)} viewed /wolfpack, ${rev.wolfNewWestern?.count ?? 0} bought at $997 — ${usd(rev.wolfNewWestern?.revenue ?? 0)}, a ${pct(rev.wolfNewWestern?.count ?? 0, split.wolfpackViewed ?? 0)} page conversion. The $297 geo page had ${split.globalViewed ?? 0} visitor and ${rev.wolfNewIntl?.count ?? 0} sales: starved, not broken — a traffic decision, not pricing.` },
      { q: "where did leads come from", a: sources.slice(0, 3).map((s: any) => `${(s.source || "").replace(/^www\.|\.com$/g, "")}: ${int(s.visitors)} visitors, ${int(s.freeSignups)} free signups`).join(". ") + "." },
      { q: "how much on the table", a: `~${usd(total)} across the top leaks — ${directives.filter((x: any) => x.money > 0).map((x: any) => `${usd(x.money)} (${x.title.toLowerCase()})`).join(" and ")}. Both are sequence fixes, not traffic fixes.` },
      { q: "is it working", a: "The pivot is working — one-time high-ticket ramped ~4.5× Jan→Apr and April was the best month ever. But it's lumpy, reach is softening, and the call stage leaks hard. Feed the top, plug the no-shows." },
    ],
    fallback: "I read the funnel, not the future. Ask what to fix, how a path is doing, or where leads came from.",
  };

  const SCOREBOARD = [
    { label: "Net revenue", value: rev.net ?? 0, fmt: "usd", sub: `${rev.count ?? 0} payments`, color: C.acid, money: true },
    { label: "One-time cash", value: rev.oneTime?.revenue ?? 0, fmt: "usd", sub: `${rev.oneTime?.count ?? 0} new sales`, color: C.bone },
    { label: "Recurring (MRR-ish)", value: rev.recurring?.revenue ?? 0, fmt: "usd", sub: `${rev.recurring?.count ?? 0} renewals`, color: C.purp },
    { label: "New leads", value: newLeads, fmt: "int", sub: "free + VSL", color: C.blue },
    { label: "Dials", value: dials, fmt: "int", sub: `${int(convo)} conversations`, color: C.bone },
    { label: "VSL closes", value: qc.count, fmt: "int", sub: usd(qc.revenue), color: C.acid, money: true },
  ];

  const gauge = (id: string, label: string, value: number, target: number, color: string, basis: string) => ({ id, label, value, target, color, unit: "%", basis });
  const showRate = booking.meetings > 0 ? Math.round(booking.showed / booking.meetings * 100) : 0;
  const GAUGES = [
    gauge("optin", "VSL OPT-IN", vsl[0]?.count ? Math.round((vsl[1]?.count ?? 0) / vsl[0].count * 100) : 0, 30, C.blue, `${int(vsl[1]?.count ?? 0)} of ${int(vsl[0]?.count ?? 0)} visits`),
    gauge("signup", "FREE SIGNUP", free[0]?.count ? Math.round((free[1]?.count ?? 0) / free[0].count * 100) : 0, 30, C.acid, `${int(free[1]?.count ?? 0)} of ${int(free[0]?.count ?? 0)} visits`),
    gauge("qual", "APP → QUALIFIED", vsl[2]?.count ? Math.round((vsl[3]?.count ?? 0) / vsl[2].count * 100) : 0, 80, C.blue, `${int(vsl[3]?.count ?? 0)} of ${int(vsl[2]?.count ?? 0)} applied`),
    gauge("show", "SHOW RATE", showRate, 75, showRate < 60 ? C.drop : C.acid, `${booking.showed ?? 0} showed · ${booking.canceled ?? 0} canceled`),
    gauge("close", "CLOSE ON SHOWS", booking.showed > 0 ? Math.round(qc.count / booking.showed * 100) : 0, 35, C.acid, `${qc.count} closed of ${booking.showed ?? 0} shown`),
    gauge("cross", "FREE → VSL", free[1]?.count ? Math.round((cross.crossed ?? 0) / free[1].count * 100) : 0, 20, C.drop, `${cross.crossed ?? 0} of ${int(free[1]?.count ?? 0)} signups`),
  ];

  const DAILY = { total: newLeads, days: daily.map((d: any) => (d.date || "").slice(5)), series: daily.map((d: any) => ({ free: d.free, vsl: d.vsl })) };

  const REVENUE = {
    cards: [
      { label: "Quantum closes (≥$2.5k)", value: usd(qc.revenue), sub: `${qc.count} full high-ticket`, color: C.blue },
      { label: "Quantum partials + recurring", value: usd((rev.quantumPartial?.revenue ?? 0) + (rev.quantumRecurring?.revenue ?? 0)), sub: `${rev.quantumPartial?.count ?? 0} deposit/downsell · ${rev.quantumRecurring?.count ?? 0} plan installments`, color: C.bone },
      { label: "Wolf — new $997 (western)", value: usd(rev.wolfNewWestern?.revenue ?? 0), sub: `${rev.wolfNewWestern?.count ?? 0} sales`, color: C.acid },
      { label: "Wolf — recurring (legacy)", value: usd(rev.wolfRecurring?.revenue ?? 0), sub: `${rev.wolfRecurring?.count ?? 0} monthly subs`, color: C.purp },
    ],
    note: `On "Quantum closes": total Quantum revenue is ${usd(rev.quantum?.revenue ?? 0)}, but that's ${rev.quantum?.count ?? 0} payments, not closes. Only ${qc.count} are full high-ticket closes (≥$2,500 one-time) = ${usd(qc.revenue)}. The rest are small one-time (deposit/downsell) + recurring payment-plan installments. The booking funnel counts only the real closes.`,
    products: (rev.segments ?? []).map((s: any) => [s.product, s.kind, usd(s.price), usd(s.revenue), s.count]),
    footer: `Gross ${usd(rev.gross ?? 0)} · net of refunds ${usd(rev.net ?? 0)}. Whop's dashboard payout is ~10% lower after its platform fee. The $297 geo tier is live but had no sales this period.`,
  };

  const stepFree = [
    { label: "Visited free course", count: free[0]?.count ?? 0 },
    { label: "Signed up (email captured)", count: free[1]?.count ?? 0, conv: `${pct(free[1]?.count ?? 0, free[0]?.count ?? 0)} continued`, dropped: `${int((free[0]?.count ?? 0) - (free[1]?.count ?? 0))} dropped` },
    { label: "Reached the course", count: free[2]?.count ?? 0, conv: `${pct(free[2]?.count ?? 0, free[1]?.count ?? 0)} continued`, sub: "incl. email re-visits" },
  ];
  const stepVsl = [
    { label: "Visited VSL page", count: vsl[0]?.count ?? 0 },
    { label: "Opted in (lead)", count: vsl[1]?.count ?? 0, conv: `${pct(vsl[1]?.count ?? 0, vsl[0]?.count ?? 0)} continued`, dropped: `${int((vsl[0]?.count ?? 0) - (vsl[1]?.count ?? 0))} dropped` },
    { label: "Started application", count: vsl[2]?.count ?? 0, conv: `${pct(vsl[2]?.count ?? 0, vsl[1]?.count ?? 0)} continued`, dropped: `${int((vsl[1]?.count ?? 0) - (vsl[2]?.count ?? 0))} dropped` },
    { label: "Qualified (submitted)", count: vsl[3]?.count ?? 0, conv: `${pct(vsl[3]?.count ?? 0, vsl[2]?.count ?? 0)} continued` },
  ];

  const BROKER = {
    tiles: [
      { label: "Saw broker offers", value: int(broker.viewed ?? 0), sub: "reached the order-bump page", color: C.amber },
      { label: "Hydra Funding", value: int(broker.hydra ?? 0), sub: `${pct(broker.hydra ?? 0, broker.viewed ?? 0)} of viewers`, color: C.amber },
      { label: "BloFin", value: int(broker.blofin ?? 0), sub: `${pct(broker.blofin ?? 0, broker.viewed ?? 0)} of viewers`, color: C.amber },
      { label: "Skipped to course", value: int(broker.skipped ?? 0), sub: `${pct(broker.skipped ?? 0, broker.viewed ?? 0)} · no broker click`, color: C.dim },
    ],
    note: `Affiliate clicks pay commissions in Hydra/BloFin dashboards, not in Whop — this revenue isn't in the totals above. Live since Jun 10. Total broker clicks: ${broker.clicked ?? 0}.`,
  };

  const CROSSOVER = { big: int(cross.crossed ?? 0), text: `${pct(cross.crossed ?? 0, free[1]?.count ?? 0)} of free signups crossed into the VSL funnel.`, sub: "Warm them up, then graduate them. ↓" };

  const BOOKING = {
    flow: [
      { v: int(split.quantum ?? 0), label: "Quantum qualified" }, { conv: pct(split.bookViewed ?? 0, split.quantum ?? 0) },
      { v: int(split.bookViewed ?? 0), label: "Landed on /book" }, { conv: pct(booking.booked ?? 0, split.bookViewed ?? 0) },
      { v: int(booking.booked ?? 0), label: "Booked a call" }, { conv: pct(booking.showed ?? 0, booking.booked ?? 0) },
      { v: int(booking.showed ?? 0), label: "Showed up" }, { conv: pct(qc.count, booking.showed ?? 0) },
      { v: String(qc.count), label: "Closed", money: usd(qc.revenue) },
    ],
    splits: [
      { label: "How they booked", parts: [[int(booking.immediateBooked ?? 0), "immediate", C.acid], [int(booking.setterRescued ?? 0), "setter", C.blue], [int(booking.laterBooked ?? 0), "email/later", C.drop]] },
      { label: "Show rate", big: `${showRate}%`, color: showRate < 60 ? C.amber : C.acid, sub: `${booking.showed ?? 0} showed · ${booking.canceled ?? 0} canceled` },
      { label: "Close rate (on shows)", big: pct(qc.count, booking.showed ?? 0), color: C.acid, sub: `${qc.count} closed of ${booking.showed ?? 0} shown` },
    ],
    alert: `The email booking-rescue is ${(booking.laterBooked ?? 0) === 0 ? "dead (0)" : "weak"}: people book immediately on the page (${booking.immediateBooked ?? 0}) or because the setter dialed them (${booking.setterRescued ?? 0}). A qualified lead who doesn't book on the spot and isn't caught by the setter is just lost. A "you didn't book" email sequence is open money.`,
    method: "3-way split from Close status-change history (90-day window): immediate = booked ≤24h of qualifying, no setter · setter = Setter Connected before Demo Booked · email/later = booked >24h later with no setter touch. Show/no-show from Close meetings, closes from Whop.",
  };

  const WOLF = {
    west: { head: "WESTERN · $997", sub: "/wolfpack · full price", viewed: split.wolfpackViewed ?? 0, conv: pct(rev.wolfNewWestern?.count ?? 0, split.wolfpackViewed ?? 0), bought: rev.wolfNewWestern?.count ?? 0, money: usd(rev.wolfNewWestern?.revenue ?? 0) },
    geo: { head: "GEO · $297", sub: "/wolfpack-global · low-PPP countries", viewed: split.globalViewed ?? 0, conv: pct(rev.wolfNewIntl?.count ?? 0, split.globalViewed ?? 0), bought: rev.wolfNewIntl?.count ?? 0, money: usd(rev.wolfNewIntl?.revenue ?? 0) },
    note: `${int(split.wolf ?? 0)} wolf-qualified leads. The $297 geo page is live but starved — only ${split.globalViewed ?? 0} low-PPP visitor reached it this period, so ${rev.wolfNewIntl?.count ?? 0} sales there isn't a conversion problem, it's a traffic problem.`,
  };

  const closerNames = new Set(["Benitez Sales", "Jesus Benitez"]);
  const closer = team.find((t: any) => closerNames.has(t.name));
  const setters = team.filter((t: any) => t.name !== "Unknown" && !closerNames.has(t.name));
  const fmtTalk = (min: number) => { const h = Math.floor(min / 60); const m2 = Math.round(min % 60); return h > 0 ? `${h}h ${m2}m` : `${m2}m`; };
  const TEAM = {
    closer: { name: closer?.name === "Benitez Sales" ? "Jesus Benitez" : (closer?.name ?? "Jesus Benitez"), role: "CLOSER", sub: `Sole closer · owns the booking calendar · ${closer?.calls ?? 0} dials logged`, closes: qc.count, revenue: usd(qc.revenue) },
    setters: setters.map((s: any) => [s.name, int(s.calls), int(s.answered), `${s.connectPct ?? 0}%`, fmtTalk(s.talkMin ?? 0)]),
  };

  const NURTURE = {
    flow: [
      { v: int(nurture.enrolled ?? 0), label: "Free signups", sub: "entered the nurture" },
      { v: int(nurture.toVsl ?? 0), label: "→ VSL opt-in", sub: `${pct(nurture.toVsl ?? 0, nurture.enrolled ?? 0)} converted` },
      { v: int(nurture.toQualified ?? 0), label: "→ Qualified", sub: `${pct(nurture.toQualified ?? 0, nurture.enrolled ?? 0)} of signups` },
      { v: `${nurture.avgDays ?? 0}d`, label: "Avg time to convert", sub: `${nurture.within7 ?? 0}% within 7 days` },
    ],
    warn: "Read this carefully: the end-to-end graduation rate undersells a deliberate slow warm (email → YouTube → Bitly → VSL), and PostHog only has ~4 weeks of history. The within-7-days figure is mostly a young-data artifact. The real fuel gauge is email click-through into YouTube/Bitly.",
    sequences: (funnel?.sequences ?? []).map((s: any) => [s.name, s.funnel, int(s.enrolled)]),
    broadcasts: (funnel?.broadcasts ?? []).map((b: any) => [b.subject, b.date, int(b.recipients), `${Math.round(b.openRate)}%`, `${(b.clickRate ?? 0).toFixed(1)}%`, int(b.clicks)]),
  };

  const SOURCES = sources.map((s: any) => [s.source, int(s.visitors), int(s.freeSignups), int(s.surveys)]);

  return {
    C, MORNING, JARVIS, DIRECTIVES: directives, DIRECTIVES_TOTAL: `~${usd(total)} more every ${funnel?.period ?? 30} days`,
    SCOREBOARD, TOPOLOGY: buildTopology(funnel, directives), GAUGES, DAILY, REVENUE,
    FREE_FUNNEL: stepFree, VSL_FUNNEL: stepVsl, BROKER, CROSSOVER, BOOKING, WOLF, TEAM, NURTURE, SOURCES,
    EVENT_TYPES,
    PIVOT: SEEDS.PIVOT,
    ROI: trends ? liveRoi(trends) : SEEDS.ROI,
    TREND: trends ? liveTrend(trends) : SEEDS.TREND,
    LEGACY: trends ? liveLegacy(trends) : SEEDS.LEGACY,
    WEEKLY: trends ? liveWeekly(trends) : SEEDS.WEEKLY,
    ATTRIB: trends ? liveAttrib(trends) : SEEDS.ATTRIB,
    CRM: data ? liveCrm(data) : SEEDS.CRM,
  };
}
