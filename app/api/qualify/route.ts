// POST /api/qualify
//
// Two payload shapes are accepted:
//
//   1. Custom form (primary) — posted by /qualify on our own domain:
//      { first_name, last_name, email, phone, answers: { id: value, ... } }
//
//   2. Tally webhook (fallback) — kept in case the old Tally form is still
//      collecting traffic somewhere:
//      { eventType, data: { fields: [{ label, type, value, options? }] } }
//
// In both cases we end up with a flat answers map, look up the existing
// Close lead by email, update status/source based on which investment tier
// they picked, post a note with the full Q&A, and ping Discord.

import { NextRequest, NextResponse } from "next/server";
import { updateLeadFieldsByEmail } from "@/lib/close";
import { pingQuantumQualified, pingWolfpackQualified, type QualifiedLead } from "@/lib/discord";
import { tagSubscriber as kitTag } from "@/lib/kit";
import { isLowPPP } from "@/lib/geo";
import { capturePostHog } from "@/lib/posthog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ─── Type guards ──────────────────────────────────────────────────

type Answers = Record<string, string>;

type CustomPayload = {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  answers?: Record<string, string | number | boolean | string[] | null>;
};

type TallyField = {
  key?: string;
  label?: string;
  type?: string;
  value?: string | number | boolean | string[] | null;
  options?: Array<{ id: string; text: string }>;
};

type TallyPayload = {
  eventType?: string;
  data?: { formId?: string; formName?: string; fields?: TallyField[] };
};

function isCustom(p: unknown): p is CustomPayload {
  if (!p || typeof p !== "object") return false;
  const o = p as Record<string, unknown>;
  return "answers" in o && typeof o.answers === "object";
}

function isTally(p: unknown): p is TallyPayload {
  if (!p || typeof p !== "object") return false;
  const o = p as Record<string, unknown>;
  return o.eventType === "FORM_RESPONSE" || (typeof o.data === "object" && o.data !== null && "fields" in (o.data as object));
}

// ─── Wolfpack vs Quantum routing ──────────────────────────────────

function isWolfpackTier(tier: string): boolean {
  return tier.trim().startsWith("$500");
}

// ─── Answer extraction ────────────────────────────────────────────

function extractFromCustom(payload: CustomPayload): {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  tier: string;
  answers: Answers;
} {
  const flat: Answers = {};
  const a = payload.answers || {};
  for (const [k, v] of Object.entries(a)) {
    if (v === null || v === undefined) flat[k] = "";
    else if (typeof v === "boolean") flat[k] = v ? "Yes" : "No";
    else if (Array.isArray(v)) flat[k] = v.filter(Boolean).join(" · ");
    else flat[k] = String(v);
  }
  return {
    first_name: payload.first_name || "",
    last_name: payload.last_name || "",
    email: (payload.email || "").toLowerCase(),
    phone: payload.phone || "",
    tier: flat["investment_tier"] || "",
    answers: flat,
  };
}

function extractFromTally(payload: TallyPayload): {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  tier: string;
  answers: Answers;
} {
  const fields = payload.data?.fields || [];
  const out: Answers = {};
  for (const f of fields) {
    const label = (f.label || f.key || "").trim();
    if (!label) continue;
    const v = f.value;
    if (v === null || v === undefined) out[label] = "";
    else if (Array.isArray(v)) {
      const texts = v.map((id) => f.options?.find((o) => o.id === id)?.text ?? String(id));
      out[label] = texts.join(", ");
    } else if (typeof v === "number" || typeof v === "boolean") out[label] = String(v);
    else out[label] = String(v);
  }
  const pick = (...needles: string[]): string => {
    for (const [k, v] of Object.entries(out)) {
      const hay = k.toLowerCase();
      if (needles.every((n) => hay.includes(n.toLowerCase()))) return v;
    }
    return "";
  };
  return {
    first_name: out["first_name"] || pick("first", "name"),
    last_name: out["last_name"] || pick("last", "name"),
    email: (out["email"] || pick("email")).toLowerCase(),
    phone: out["phone"] || pick("phone"),
    tier: pick("invest"),
    answers: out,
  };
}

// ─── Handler ──────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  let parsed: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    tier: string;
    answers: Answers;
  };

  if (isCustom(raw)) {
    parsed = extractFromCustom(raw);
  } else if (isTally(raw)) {
    parsed = extractFromTally(raw);
  } else {
    return NextResponse.json({ ok: false, error: "Unrecognized payload shape" }, { status: 400 });
  }

  if (!parsed.email) {
    return NextResponse.json({ ok: false, error: "Missing email" }, { status: 400 });
  }

  // Geo informs PRICE, not access: the tier the visitor picked decides
  // routing (a $7,500 click from Jakarta is exactly who setters want to
  // talk to — the call filters real from fantasy). Budget-tier leads from
  // low-PPP countries get flagged for the regional Wolfpack offer.
  const country = (req.headers.get("x-vercel-ip-country") || "").toUpperCase();
  const isWolfpack = isWolfpackTier(parsed.tier);
  const intlOffer = isLowPPP(country) && isWolfpack;

  const newSource = isWolfpack ? "Wolfpack" : "VSL Funnel";
  const newStatus = isWolfpack ? "Opt In" : "Applied But Did Not Book";

  // Note that gets attached to the Close lead — setters see this on the call
  const noteLines = Object.entries(parsed.answers)
    .filter(([k]) => !["first_name", "last_name", "email", "phone"].includes(k))
    .map(([k, v]) => `• ${prettyLabel(k)}: ${v}`);
  const tierLabel = parsed.tier || "—";
  const note = [
    `Qualification submitted (${isWolfpack ? "Wolfpack" : "Quantum"} tier · investment: ${tierLabel})`,
    ...(intlOffer ? [`Low-PPP country (${country}) — routed to the regional Wolfpack offer`] : []),
    ...(!isWolfpack && isLowPPP(country) ? [`Note: lead is in ${country} (low-PPP geo) but picked ${tierLabel} — verify budget on the call`] : []),
    "",
    ...noteLines,
  ].join("\n");

  // Map our internal answer ids to the user's existing Close custom fields
  // so setters/closers see structured data in the lead sidebar (not just
  // a single note blob). Unknown fields are silently skipped by the lib —
  // safe to add more mappings later without breaking anything.
  const a = parsed.answers;
  const customFields = {
    "Invest": a["investment_tier"] || "",
    "Monthly Income": a["monthly_income_goal"] || "",
    "Experience Level": a["trading_length"] || "",
    "Commitment OK": a["commitment_score"] ? `${a["commitment_score"]}/10` : "",
    "Long Term Goal": a["extra_income_dream"] || "",
    "Capital On Hand": a["education_spend"] || "",
    "Application Questions": noteLines.join("\n"),
  };

  // Build the Discord embed answers map — pretty labels for human reading
  const prettyAnswers: Answers = {};
  for (const [k, v] of Object.entries(parsed.answers)) {
    if (["first_name", "last_name", "email", "phone"].includes(k)) continue;
    prettyAnswers[prettyLabel(k)] = v;
  }

  // Close FIRST so we have the lead_id to embed in the Discord "View in
  // Close" link. Discord ping fires immediately after.
  const closeRes = await Promise.allSettled([
    updateLeadFieldsByEmail(parsed.email, {
      status: newStatus,
      source: newSource,
      note,
      customFields,
    }),
  ]);
  if (closeRes[0].status === "rejected") {
    console.error("[/api/qualify] Close update failed:", closeRes[0].reason);
  }

  const lead_id =
    closeRes[0].status === "fulfilled" && closeRes[0].value
      ? closeRes[0].value.lead_id
      : null;

  // Edge case: Tally or our form fires before /api/lead created the lead.
  // Log it but still ping Discord so the team isn't blind.
  if (closeRes[0].status === "fulfilled" && closeRes[0].value === null) {
    console.warn(
      "[/api/qualify] No existing Close lead for",
      parsed.email,
      "— Discord ping will lack View-in-Close link",
    );
  }

  const qualifiedLead: QualifiedLead = {
    first_name: parsed.first_name,
    last_name: parsed.last_name,
    email: parsed.email,
    phone: parsed.phone,
    tier: parsed.tier,
    answers: prettyAnswers,
    lead_id,
  };

  // Fire Kit tags so existing automations trigger:
  //   - "Application Submitted" — every qualification regardless of tier
  //   - "QC qualified" or "Wolf Qualified" — tier-specific
  const tierTagId = isWolfpack
    ? process.env.KIT_TAG_WOLF_QUALIFIED
    : process.env.KIT_TAG_QC_QUALIFIED;

  const [discordRes, appTagRes, tierTagRes, geoEventRes] = await Promise.allSettled([
    isWolfpack ? pingWolfpackQualified(qualifiedLead) : pingQuantumQualified(qualifiedLead),
    kitTag({
      email: parsed.email,
      first_name: parsed.first_name,
      last_name: parsed.last_name,
      phone: parsed.phone,
      tagId: process.env.KIT_TAG_APPLIED,
    }),
    kitTag({
      email: parsed.email,
      first_name: parsed.first_name,
      last_name: parsed.last_name,
      phone: parsed.phone,
      tagId: tierTagId,
    }),
    intlOffer
      ? capturePostHog("qualify_intl_offer", parsed.email, { country, investment_tier: parsed.tier })
      : Promise.resolve(),
  ]);

  if (discordRes.status === "rejected") console.error("[/api/qualify] Discord ping failed:", discordRes.reason);
  if (appTagRes.status === "rejected") console.error("[/api/qualify] Kit Applied tag failed:", appTagRes.reason);
  if (tierTagRes.status === "rejected") console.error("[/api/qualify] Kit tier tag failed:", tierTagRes.reason);
  if (geoEventRes.status === "rejected") console.error("[/api/qualify] PostHog intl-offer event failed:", geoEventRes.reason);

  return NextResponse.json({
    ok: true,
    tier_routed: isWolfpack ? "wolfpack" : "quantum",
    intl_offer: intlOffer,
    close: closeRes[0].status,
    discord: discordRes.status,
    kit_applied: appTagRes.status,
    kit_tier: tierTagRes.status,
  });
}

export async function GET() {
  return NextResponse.json({ ok: true, endpoint: "/api/qualify", method: "POST expected" });
}

// ─── Helpers ──────────────────────────────────────────────────────

// Map internal question ids → human-readable labels for the Close note + Discord embed.
// Anything we don't recognize gets passed through unchanged.
const LABELS: Record<string, string> = {
  trading_length: "How long trading",
  profitable_month: "Profitable month?",
  markets: "Markets traded",
  current_style: "Current style",
  blocker: "Biggest blocker",
  education_spend: "Education spend so far",
  prior_courses: "Prior courses bought",
  trading_plan: "Has written plan?",
  hours_per_week: "Hours/week available",
  monthly_income_goal: "Monthly income goal",
  one_day_dream: "1 Sunday + zero screen?",
  investment_tier: "Investment level",
  commitment_score: "Commitment 1–10",
  extra_income_dream: "What income would unlock",
  consent: "Consent given?",
};

function prettyLabel(key: string): string {
  return LABELS[key] || key;
}
