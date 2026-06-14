// GET /api/analytics/live?after=<iso>
//
// The real-time funnel feed. Returns recent funnel events (newest first) as
// individual items for a Twitter-style stream. With ?after=<iso> it returns
// only events newer than that timestamp (for incremental polling).

import { NextRequest, NextResponse } from "next/server";
import { isAuthed } from "@/lib/analytics-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PH_PROJECT = "430887";
const PH_HOST = "https://us.i.posthog.com";

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

export async function GET(req: NextRequest) {
  if (!isAuthed(req.cookies.get("qc_auth")?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const after = req.nextUrl.searchParams.get("after");
  // sanitize: only accept an ISO-ish timestamp
  const afterClause = after && /^[\dT:.\-+Z ]+$/.test(after) ? `AND timestamp > toDateTime('${after.slice(0, 19).replace("T", " ")}')` : "";

  const rows = await hogql(`
    SELECT
      event,
      toString(timestamp) AS ts,
      coalesce(nullIf(properties.email, ''), nullIf(person.properties.email, ''), '') AS email,
      coalesce(properties.first_name, person.properties.first_name, '') AS first_name,
      coalesce(properties.routing, '') AS routing,
      coalesce(properties.broker, '') AS broker,
      coalesce(properties.investment_tier, '') AS tier,
      coalesce(properties.$geoip_country_code, '') AS country,
      properties.$host AS host
    FROM events
    WHERE timestamp >= now() - INTERVAL 3 DAY
      AND event IN ('free_course_submitted','lead_submitted','qualify_form_started','qualify_form_submitted','qualify_intl_offer','broker_offers_viewed','broker_offer_clicked','broker_offers_skipped','book_page_viewed','book_fallback_requested','call_booked','free_course_confirm_viewed')
      ${afterClause}
    ORDER BY timestamp DESC
    LIMIT 80
  `);

  const mask = (email: string) => {
    if (!email || !email.includes("@")) return "";
    const [u, d] = email.split("@");
    return `${u.slice(0, 3)}***@${d}`;
  };

  const events = rows.map((r) => {
    const [event, ts, email, firstName, routing, broker, tier, country, host] = r as string[];
    return {
      event,
      ts,
      who: (firstName && String(firstName).trim()) || mask(String(email)) || "someone",
      routing: String(routing || ""),
      broker: String(broker || ""),
      tier: String(tier || ""),
      country: String(country || ""),
      host: String(host || ""),
    };
  });

  return NextResponse.json({ events, now: new Date().toISOString() });
}
