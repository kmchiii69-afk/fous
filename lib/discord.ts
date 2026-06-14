// Discord webhook helpers
//
// Four webhooks — one per channel. Each function builds a message styled
// like the legacy Close → Discord notifications: bold header, role mention
// for the responsible team, "View in Close" deep-link to the lead profile,
// and the lead's core contact info below a separator.
//
// We swallow errors at the caller level (Promise.allSettled) so a Discord
// outage never blocks a real lead from being saved in Close.

type DiscordPayload = {
  content?: string;
  embeds?: DiscordEmbed[];
  allowed_mentions?: { parse?: string[]; roles?: string[]; users?: string[] };
};

type DiscordEmbed = {
  title?: string;
  description?: string;
  color?: number;
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
  timestamp?: string;
  footer?: { text: string };
};

async function postWebhook(url: string, payload: DiscordPayload) {
  if (!url) {
    throw new Error("Discord webhook URL not configured");
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Discord ${res.status}: ${text.slice(0, 400)}`);
  }
}

// Build a Discord role mention string. If the role ID env var is set we
// emit the proper <@&ID> syntax which actually pings the role. If it
// isn't set we emit an empty string — callers filter empties out so the
// message reads cleanly without dead "@Setters" placeholders.
function mentionRole(team: "setters" | "closers"): string {
  const id = team === "setters" ? process.env.DISCORD_SETTERS_ROLE_ID : process.env.DISCORD_CLOSERS_ROLE_ID;
  return id ? `<@&${id}>` : "";
}

// Whitelist the role IDs we want to actually ping. Without this Discord
// suppresses role mentions sent via webhook by default.
function allowedMentions(): DiscordPayload["allowed_mentions"] {
  const roles: string[] = [];
  if (process.env.DISCORD_SETTERS_ROLE_ID) roles.push(process.env.DISCORD_SETTERS_ROLE_ID);
  if (process.env.DISCORD_CLOSERS_ROLE_ID) roles.push(process.env.DISCORD_CLOSERS_ROLE_ID);
  return { roles };
}

function viewInClose(leadId?: string | null): string {
  if (!leadId) return "";
  return `👉 [View in Close](https://app.close.com/lead/${leadId}/)`;
}

const SEPARATOR = "━━━━━━━━━━━━━━━━━━━━━━━━━━━";

// ─── Channel pings ────────────────────────────────────────────────

export async function pingFreeCourseOptIn(lead: {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  lead_id?: string | null;
  created?: boolean;
}) {
  const isNew = lead.created !== false;
  const header = isNew
    ? "📚 **NEW Free Course Sign-Up**"
    : "📚 **(Re-subscribed) Free Course Sign-Up**";
  const callout = viewInClose(lead.lead_id);
  const fullName = `${lead.first_name} ${lead.last_name}`.trim() || "—";

  const lines = [
    header,
    ...(callout ? [callout] : []),
    "",
    `**Name:** ${fullName}`,
    `**Email:** ${lead.email || "—"}`,
    ...(lead.phone ? [`**Phone:** ${lead.phone}`] : []),
    SEPARATOR,
  ];

  return postWebhook(process.env.DISCORD_WEBHOOK_FREE_COURSE || "", {
    content: lines.join("\n"),
  });
}

export async function pingOptIn(lead: {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  lead_id?: string | null;
  /** True if /api/lead created a brand-new Close record; false if it
   * updated an existing one (i.e. someone opted in again). */
  created?: boolean;
}) {
  const isNew = lead.created !== false;
  const header = isNew
    ? "🔥 **NEW VSL Opt-In**"
    : "🌀 **(Opted In Again) VSL Opt-In**";
  const callout = [mentionRole("setters"), viewInClose(lead.lead_id)].filter(Boolean).join(" — ");
  const fullName = `${lead.first_name} ${lead.last_name}`.trim() || "—";

  const content = [
    header,
    callout,
    "",
    `**Name:** ${fullName}`,
    `**Email:** ${lead.email || "—"}`,
    `**Phone:** ${lead.phone || "—"}`,
    SEPARATOR,
  ].join("\n");

  return postWebhook(process.env.DISCORD_WEBHOOK_OPTINS || "", {
    content,
    allowed_mentions: allowedMentions(),
  });
}

export type QualifiedLead = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  tier: string;
  answers: Record<string, string>; // pretty-label → readable value
  lead_id?: string | null;
};

export async function pingQuantumQualified(lead: QualifiedLead) {
  return postWebhook(process.env.DISCORD_WEBHOOK_QUALIFIED || "", buildQualifiedPayload(lead, "Quantum"));
}

export async function pingWolfpackQualified(lead: QualifiedLead) {
  return postWebhook(process.env.DISCORD_WEBHOOK_WOLFPACK_QUALIFIED || "", buildQualifiedPayload(lead, "Wolfpack"));
}

function buildQualifiedPayload(lead: QualifiedLead, program: "Quantum" | "Wolfpack"): DiscordPayload {
  const header = program === "Quantum"
    ? "💎 **QUANTUM QUALIFIED Lead**"
    : "🐺 **WOLFPACK QUALIFIED Lead**";
  const callout = [mentionRole("setters"), viewInClose(lead.lead_id)].filter(Boolean).join(" — ");
  const fullName = `${lead.first_name} ${lead.last_name}`.trim() || "—";
  const answersBlock = Object.entries(lead.answers)
    .slice(0, 14)
    .map(([k, v]) => `• **${k}:** ${v}`)
    .join("\n")
    .slice(0, 3500);

  const content = [
    header,
    callout,
    "",
    `**Name:** ${fullName}`,
    `**Email:** ${lead.email || "—"}`,
    `**Phone:** ${lead.phone || "—"}`,
    `**Investment tier:** ${lead.tier || "—"}`,
    "",
    answersBlock,
    SEPARATOR,
  ].join("\n");

  return {
    content,
    allowed_mentions: allowedMentions(),
  };
}

// Fired when a qualified lead reaches the booking calendar but taps
// "have the team call me" instead of picking a slot. Goes to the qualified
// channel — setters work that queue and these are the hottest hand-raisers.
export async function pingCallbackRequested(lead: {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  lead_id?: string | null;
}) {
  const callout = [mentionRole("setters"), viewInClose(lead.lead_id)].filter(Boolean).join(" — ");
  const fullName = `${lead.first_name} ${lead.last_name}`.trim() || "—";

  const content = [
    "☎️ **CALLBACK REQUESTED — qualified lead skipped the calendar**",
    callout,
    "",
    `**Name:** ${fullName}`,
    `**Email:** ${lead.email || "—"}`,
    `**Phone:** ${lead.phone || "—"}`,
    "Reached the booking page and asked for a call instead of self-scheduling. Dial while it's hot.",
    SEPARATOR,
  ].join("\n");

  return postWebhook(process.env.DISCORD_WEBHOOK_QUALIFIED || "", {
    content,
    allowed_mentions: allowedMentions(),
  });
}

export async function pingBooked(booking: {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  call_time?: string;
  event_name?: string;
  lead_id?: string | null;
}) {
  const callout = [mentionRole("closers"), viewInClose(booking.lead_id)].filter(Boolean).join(" — ");
  const fullName = `${booking.first_name} ${booking.last_name}`.trim() || "—";

  const lines = [
    "📞 **NEW BOOKING — Call Scheduled**",
    callout,
    "",
    `**Name:** ${fullName}`,
    `**Email:** ${booking.email || "—"}`,
    `**Phone:** ${booking.phone || "—"}`,
  ];
  if (booking.call_time) lines.push(`**Call time:** ${booking.call_time}`);
  if (booking.event_name) lines.push(`**Event:** ${booking.event_name}`);
  lines.push(SEPARATOR);

  return postWebhook(process.env.DISCORD_WEBHOOK_BOOKED || "", {
    content: lines.join("\n"),
    allowed_mentions: allowedMentions(),
  });
}
