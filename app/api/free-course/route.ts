// POST /api/free-course
//
// Called by the free course signup form. Creates/updates the lead in Close
// (status "Opt In", source "Free Course"), subscribes the email to the
// free-course Kit form (KIT_FREE_COURSE_FORM_ID), and pings the
// #free-course Discord channel.
// Close runs first so we have a lead_id for the Discord "View in Close" link.
// Kit + Discord then run in parallel. Side-effects never block the response.

import { NextRequest, NextResponse } from "next/server";
import { createOrUpdateLead } from "@/lib/close";
import { subscribeToForm as kitSubscribe } from "@/lib/kit";
import { pingFreeCourseOptIn } from "@/lib/discord";

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
  const last_name  = clean(body.last_name,  40, /[^A-Za-z\s'-]/g);
  const email      = clean(body.email, 120).toLowerCase();
  const phone      = clean(body.phone, 24, /[^\d+\s()-]/g);

  if (!first_name) return NextResponse.json({ ok: false, error: "Missing first name" }, { status: 400 });
  if (!EMAIL_RE.test(email)) return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });

  // ── Close (run first to get lead_id for Discord link) ──────────────
  const [closeRes] = await Promise.allSettled([
    createOrUpdateLead({
      first_name,
      last_name,
      email,
      phone: phone || "",
      status: "Opt In",
      source: "Free Course",
    }),
  ]);
  if (closeRes.status === "rejected") console.error("[/api/free-course] Close failed:", closeRes.reason);

  const lead_id = closeRes.status === "fulfilled" ? closeRes.value.lead_id : null;
  const created = closeRes.status === "fulfilled" ? closeRes.value.created : true;

  // ── Kit + Discord in parallel ──────────────────────────────────────
  const formId = process.env.KIT_FREE_COURSE_FORM_ID || "";

  const [kitRes, discordRes] = await Promise.allSettled([
    kitSubscribe({ email, first_name, last_name, phone, formId }),
    pingFreeCourseOptIn({ first_name, last_name, email, phone, lead_id, created }),
  ]);

  if (kitRes.status === "rejected") console.error("[/api/free-course] Kit failed:", kitRes.reason);
  if (discordRes.status === "rejected") console.error("[/api/free-course] Discord failed:", discordRes.reason);

  return NextResponse.json({
    ok: true,
    lead_id,
    close: closeRes.status,
    kit: kitRes.status,
    discord: discordRes.status,
  });
}
