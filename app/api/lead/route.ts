// POST /api/lead
//
// Called by the Page 1 squeeze modal. Creates an "Opt In" lead in Close,
// subscribes the email to Kit's VSL Opt-In form, and pings #new-vsl-optins
// in Discord. All three side-effects run in parallel; we never block the
// response on a side-effect failure (we log it and move on).

import { NextRequest, NextResponse } from "next/server";
import { createOrUpdateLead } from "@/lib/close";
import { subscribeToForm as kitSubscribe, tagSubscriber as kitTag } from "@/lib/kit";
import { pingOptIn } from "@/lib/discord";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(s: unknown, max: number, allowedChars?: RegExp): string {
  if (typeof s !== "string") return "";
  let v = s.trim().slice(0, max);
  if (allowedChars) v = v.replace(allowedChars, "");
  return v;
}

export async function POST(req: NextRequest) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const body = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;

  const first_name = clean(body.first_name, 40, /[^A-Za-z\s'-]/g);
  const last_name = clean(body.last_name, 40, /[^A-Za-z\s'-]/g);
  const email = clean(body.email, 120).toLowerCase();
  const phone = clean(body.phone, 24, /[^\d+\s()-]/g);

  if (!first_name || !last_name) {
    return NextResponse.json({ ok: false, error: "Missing name" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
  }
  if (phone.replace(/\D/g, "").length < 7) {
    return NextResponse.json({ ok: false, error: "Invalid phone" }, { status: 400 });
  }

  // Run Close FIRST so we can include the lead_id + created flag in the
  // Discord ping (so setters can click "View in Close" straight to the
  // right record). Kit runs in parallel with Discord afterwards since it
  // doesn't depend on the Close lead.
  const closeRes = await Promise.allSettled([
    createOrUpdateLead({
      first_name,
      last_name,
      email,
      phone,
      status: "Opt In",
      source: "VSL Funnel",
    }),
  ]);
  if (closeRes[0].status === "rejected") console.error("[/api/lead] Close failed:", closeRes[0].reason);

  const lead_id = closeRes[0].status === "fulfilled" ? closeRes[0].value.lead_id : null;
  const created = closeRes[0].status === "fulfilled" ? closeRes[0].value.created : true;

  const [kitRes, kitTagRes, discordRes] = await Promise.allSettled([
    kitSubscribe({ email, first_name, last_name, phone }),
    // Also tag with "VSL Opt-In" so existing Kit automations triggered by
    // that tag (welcome sequence, follow-up drip, etc.) fire.
    kitTag({ email, first_name, last_name, phone, tagId: process.env.KIT_TAG_OPTIN }),
    pingOptIn({ first_name, last_name, email, phone, lead_id, created }),
  ]);

  if (kitRes.status === "rejected") console.error("[/api/lead] Kit subscribe failed:", kitRes.reason);
  if (kitTagRes.status === "rejected") console.error("[/api/lead] Kit tag failed:", kitTagRes.reason);
  if (discordRes.status === "rejected") console.error("[/api/lead] Discord failed:", discordRes.reason);

  return NextResponse.json({
    ok: true,
    lead_id,
    close: closeRes[0].status,
    kit: kitRes.status,
    kit_tag: kitTagRes.status,
    discord: discordRes.status,
  });
}
