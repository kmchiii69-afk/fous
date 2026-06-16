// GET /api/calendly/slots?start=YYYY-MM-DD&days=14&timezone=America/New_York
//
// Fetches real available time slots from Calendly for the next N days.
// Returns slots grouped by date so the custom calendar can render them.
// Uses CALENDLY_PAT server-side — never exposes the token to the client.

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CALENDLY_API = "https://api.calendly.com";

// Cache the event type lookup — it never changes, so 1h TTL is fine.
let _eventType: { uri: string; uuid: string; t: number } | null = null;

async function getEventType(): Promise<{ uri: string; uuid: string } | null> {
  if (_eventType && Date.now() - _eventType.t < 3_600_000) return _eventType;

  const pat = process.env.CALENDLY_PAT;
  if (!pat) return null;

  const headers = { Authorization: `Bearer ${pat}`, "Content-Type": "application/json" };

  const userRes = await fetch(`${CALENDLY_API}/users/me`, { headers });
  if (!userRes.ok) {
    console.error("[calendly/slots] /users/me failed:", userRes.status);
    return null;
  }
  const { resource: user } = await userRes.json();

  const etRes = await fetch(
    `${CALENDLY_API}/event_types?user=${encodeURIComponent(user.uri)}&active=true`,
    { headers },
  );
  if (!etRes.ok) {
    console.error("[calendly/slots] /event_types failed:", etRes.status);
    return null;
  }
  const { collection } = await etRes.json();

  // Prefer the 30-min event type; fall back to the first active one.
  const et =
    (collection as any[])?.find((e) => e.slug === "30min" || e.duration === 30) ??
    (collection as any[])?.[0];

  if (!et?.uri) return null;

  const uuid = (et.uri as string).split("/").pop() ?? "";
  _eventType = { uri: et.uri, uuid, t: Date.now() };
  return _eventType;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const timezone = searchParams.get("timezone") || "UTC";
  const startDate = searchParams.get("start") || new Date().toISOString().slice(0, 10);
  const days = Math.min(parseInt(searchParams.get("days") || "14") || 14, 21);

  const eventType = await getEventType();
  if (!eventType) {
    return NextResponse.json(
      { error: "Calendar not configured — check CALENDLY_PAT env var", slots: {} },
      { status: 503 },
    );
  }

  const pat = process.env.CALENDLY_PAT!;
  // Start from today (never in the past), end N days out
  const startTime = new Date(startDate + "T00:00:00.000Z").toISOString();
  const endTime = new Date(Date.now() + days * 86_400_000).toISOString();

  const url =
    `${CALENDLY_API}/event_type_available_times` +
    `?event_type=${encodeURIComponent(eventType.uri)}` +
    `&start_time=${encodeURIComponent(startTime)}` +
    `&end_time=${encodeURIComponent(endTime)}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${pat}`, "Content-Type": "application/json" },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    console.error("[calendly/slots] available_times failed:", res.status, (await res.text()).slice(0, 200));
    return NextResponse.json({ error: "Failed to fetch availability", slots: {} }, { status: 502 });
  }

  const data = await res.json();

  // Group by date in the requested timezone so the calendar knows which
  // days to highlight and which times to show per day.
  const slots: Record<string, Array<{ time: string; schedulingUrl: string }>> = {};
  for (const item of (data.collection ?? []) as any[]) {
    if (item.status !== "available") continue;
    // toLocaleDateString with "en-CA" locale returns YYYY-MM-DD
    const date = new Date(item.start_time).toLocaleDateString("en-CA", { timeZone: timezone });
    if (!slots[date]) slots[date] = [];
    slots[date].push({ time: item.start_time, schedulingUrl: item.scheduling_url });
  }

  return NextResponse.json({ slots, eventTypeUri: eventType.uri, eventTypeUuid: eventType.uuid });
}
