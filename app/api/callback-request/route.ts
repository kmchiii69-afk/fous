// POST /api/callback-request
//
// Fired from the /book page when a qualified lead can't (or won't) pick a
// Calendly slot and taps "have the team call me" instead. Attaches a note
// to the Close lead and pings setters in Discord so the intent is worked
// immediately instead of evaporating when the tab closes.

import { NextRequest, NextResponse } from "next/server";
import { updateLeadFieldsByEmail } from "@/lib/close";
import { pingCallbackRequested } from "@/lib/discord";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(s: unknown, max: number): string {
  return typeof s === "string" ? s.trim().slice(0, max) : "";
}

export async function POST(req: NextRequest) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const body = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;

  const first_name = clean(body.first_name, 40);
  const last_name = clean(body.last_name, 40);
  const email = clean(body.email, 120).toLowerCase();
  const phone = clean(body.phone, 24);

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
  }

  const closeRes = await Promise.allSettled([
    updateLeadFieldsByEmail(email, {
      note: "Callback requested from /book — lead reached the booking calendar but asked for a call instead of self-scheduling. Speed-to-lead applies.",
    }),
  ]);
  if (closeRes[0].status === "rejected") {
    console.error("[/api/callback-request] Close update failed:", closeRes[0].reason);
  }
  const lead_id =
    closeRes[0].status === "fulfilled" && closeRes[0].value ? closeRes[0].value.lead_id : null;

  const [discordRes] = await Promise.allSettled([
    pingCallbackRequested({ first_name, last_name, email, phone, lead_id }),
  ]);
  if (discordRes.status === "rejected") {
    console.error("[/api/callback-request] Discord ping failed:", discordRes.reason);
  }

  return NextResponse.json({
    ok: true,
    close: closeRes[0].status,
    discord: discordRes.status,
  });
}

export async function GET() {
  return NextResponse.json({ ok: true, endpoint: "/api/callback-request", method: "POST expected" });
}
