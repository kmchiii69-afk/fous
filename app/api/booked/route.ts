// POST /api/booked
//
// Calendly webhook target. Fires when an invitee schedules a call.
// Updates the Close lead status to "Demo Booked" and pings #booked-calls
// in Discord so closers see who just booked.

import { NextRequest, NextResponse } from "next/server";
import { updateLeadFieldsByEmail } from "@/lib/close";
import { pingBooked } from "@/lib/discord";
import { tagSubscriber as kitTag } from "@/lib/kit";
import { capturePostHog } from "@/lib/posthog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ─── Calendly webhook payload (subset we care about) ──────────────

type CalendlyPayload = {
  event?: string; // "invitee.created" | "invitee.canceled" | ...
  payload?: {
    event_type?: string;
    name?: string;
    email?: string;
    text_reminder_number?: string;
    questions_and_answers?: Array<{ question?: string; answer?: string; position?: number }>;
    scheduled_event?: {
      name?: string;
      start_time?: string;
      end_time?: string;
    };
  };
};

function splitName(full: string): { first: string; last: string } {
  const parts = (full || "").trim().split(/\s+/);
  if (parts.length === 0) return { first: "", last: "" };
  if (parts.length === 1) return { first: parts[0], last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

function findPhoneInQA(qa: Array<{ question?: string; answer?: string }> = []): string {
  for (const item of qa) {
    const q = (item.question || "").toLowerCase();
    if (q.includes("phone") || q.includes("number") || q.includes("text")) {
      return item.answer || "";
    }
  }
  return "";
}

export async function POST(req: NextRequest) {
  let payload: CalendlyPayload;
  try {
    payload = (await req.json()) as CalendlyPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  // We only care about new bookings, not cancellations or reschedules
  const eventType = payload.event || "";
  if (eventType !== "invitee.created") {
    return NextResponse.json({ ok: true, ignored: eventType || "unknown" });
  }

  const p = payload.payload || {};
  const email = (p.email || "").toLowerCase();
  if (!email) {
    return NextResponse.json({ ok: false, error: "Missing email" }, { status: 400 });
  }

  const { first, last } = splitName(p.name || "");
  // Calendly stores phone in `text_reminder_number` for SMS reminders, OR
  // as a custom Q&A entry. Try both.
  const phone =
    p.text_reminder_number || findPhoneInQA(p.questions_and_answers || []) || "";

  const startTime = p.scheduled_event?.start_time || "";
  const eventName = p.scheduled_event?.name || p.event_type || "";

  const noteLines = [
    `Calendly booking received`,
    eventName && `Event: ${eventName}`,
    startTime && `Start: ${startTime}`,
  ].filter(Boolean) as string[];

  // Close FIRST so we have the lead_id for the Discord "View in Close" link.
  const closeRes = await Promise.allSettled([
    updateLeadFieldsByEmail(email, {
      status: "Demo Booked",
      note: noteLines.join("\n"),
    }),
  ]);
  if (closeRes[0].status === "rejected") console.error("[/api/booked] Close update failed:", closeRes[0].reason);

  const lead_id =
    closeRes[0].status === "fulfilled" && closeRes[0].value ? closeRes[0].value.lead_id : null;

  const [discordRes, kitTagRes, posthogRes] = await Promise.allSettled([
    pingBooked({
      first_name: first,
      last_name: last,
      email,
      phone,
      call_time: startTime,
      event_name: eventName,
      lead_id,
    }),
    // Fire "Booked Call" Kit tag → triggers the Booked Call Sequence
    // automation the user already has set up.
    kitTag({
      email,
      first_name: first,
      last_name: last,
      phone,
      tagId: process.env.KIT_TAG_BOOKED,
    }),
    capturePostHog("call_booked", email, {
      event_name: eventName,
      call_time: startTime,
    }),
  ]);
  if (discordRes.status === "rejected") console.error("[/api/booked] Discord ping failed:", discordRes.reason);
  if (kitTagRes.status === "rejected") console.error("[/api/booked] Kit tag failed:", kitTagRes.reason);
  if (posthogRes.status === "rejected") console.error("[/api/booked] PostHog capture failed:", posthogRes.reason);

  return NextResponse.json({
    ok: true,
    close: closeRes[0].status,
    discord: discordRes.status,
    kit_tag: kitTagRes.status,
  });
}

export async function GET() {
  return NextResponse.json({ ok: true, endpoint: "/api/booked", method: "POST expected" });
}
