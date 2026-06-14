// GET /api/analytics/trends
//
// Long-range growth trends — the view a 30-day snapshot can't show. Monthly
// revenue (one-time vs recurring) + membership churn from Whop, plus weekly
// leads/views from PostHog. Heavy historical aggregation, cached 1h, loaded
// lazily by the dashboard so it never blocks the main view.

import { NextRequest, NextResponse } from "next/server";
import { isAuthed } from "@/lib/analytics-auth";
import { fetchWhopTrends } from "@/lib/whop";
import { fetchSegAttribution } from "@/lib/segmetrics";
import { fetchFreeCourseRoi } from "@/lib/freecourse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const PH_PROJECT = "430887";
const PH_HOST = "https://us.i.posthog.com";

async function hogql(query: string): Promise<unknown[][]> {
  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY || "";
  if (!apiKey) return [];
  try {
    const res = await fetch(`${PH_HOST}/api/projects/${PH_PROJECT}/query`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
      next: { revalidate: 1800 },
    });
    if (!res.ok) return [];
    return ((await res.json()).results ?? []) as unknown[][];
  } catch {
    // a slow/unreachable upstream must not 500 the whole trends route —
    // return empty so the other sources still render (client seeds the rest)
    return [];
  }
}

export async function GET(req: NextRequest) {
  if (!isAuthed(req.cookies.get("qc_auth")?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const weeklyQuery = `
    SELECT toStartOfWeek(timestamp) AS wk,
      countIf(event = '$pageview') AS views,
      uniqIf(person_id, event = '$pageview') AS visitors,
      countIf(event = 'free_course_submitted') AS free,
      countIf(event = 'lead_submitted') AS vsl,
      countIf(event = 'qualify_form_submitted') AS qualified
    FROM events
    WHERE timestamp >= now() - INTERVAL 84 DAY
    GROUP BY wk ORDER BY wk
  `;

  const [trends, weeklyRows, attribution, freeCourseRoi] = await Promise.all([
    fetchWhopTrends(8).catch(() => null),
    hogql(weeklyQuery),
    fetchSegAttribution().catch(() => null),
    fetchFreeCourseRoi(120).catch(() => null),
  ]);

  const weekly = weeklyRows.map((r) => ({
    week: String(r[0] ?? "").slice(0, 10),
    views: Number(r[1] ?? 0),
    visitors: Number(r[2] ?? 0),
    free: Number(r[3] ?? 0),
    vsl: Number(r[4] ?? 0),
    qualified: Number(r[5] ?? 0),
  }));

  return NextResponse.json({
    monthly: trends?.monthly ?? [],
    memberships: trends?.memberships ?? { active: 0, canceled: 0, expired: 0, completed: 0 },
    weekly,
    attribution,
    freeCourseRoi,
  });
}
