// Close.com API helpers
//
// All Close API calls go through `closeFetch`. We look up status IDs
// and custom-field IDs by name with a module-level cache (5-min TTL)
// so cold-start serverless invocations don't repeatedly hit those
// metadata endpoints.

const CLOSE_BASE = "https://api.close.com/api/v1";

function authHeader() {
  const key = process.env.CLOSE_API_KEY || "";
  if (!key) throw new Error("CLOSE_API_KEY not configured");
  // Close uses Basic auth with api_key as the username and an empty password
  const token = Buffer.from(`${key}:`).toString("base64");
  return `Basic ${token}`;
}

async function closeFetch<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${CLOSE_BASE}${path}`, {
    ...init,
    headers: {
      ...init.headers,
      Authorization: authHeader(),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    // Vercel default 30s timeout — Close usually responds in <2s
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Close ${path} ${res.status}: ${text.slice(0, 400)}`);
  }
  return res.json();
}

// ─── ID lookup caches ─────────────────────────────────────────────

type CacheEntry<T> = { value: T; expires: number };
const TTL_MS = 5 * 60 * 1000;
let statusCache: CacheEntry<Map<string, string>> | null = null;
let customFieldCache: CacheEntry<Map<string, string>> | null = null;

async function getStatusMap(): Promise<Map<string, string>> {
  if (statusCache && statusCache.expires > Date.now()) return statusCache.value;
  const data = await closeFetch<{ data: Array<{ id: string; label: string }> }>("/status/lead/");
  const map = new Map(data.data.map((s) => [s.label, s.id]));
  statusCache = { value: map, expires: Date.now() + TTL_MS };
  return map;
}

async function getCustomFieldMap(): Promise<Map<string, string>> {
  if (customFieldCache && customFieldCache.expires > Date.now()) return customFieldCache.value;
  const data = await closeFetch<{ data: Array<{ id: string; name: string }> }>("/custom_field/lead/");
  const map = new Map(data.data.map((f) => [f.name, f.id]));
  customFieldCache = { value: map, expires: Date.now() + TTL_MS };
  return map;
}

export async function getStatusId(name: string): Promise<string | null> {
  const map = await getStatusMap();
  return map.get(name) || null;
}

export async function getCustomFieldId(name: string): Promise<string | null> {
  const map = await getCustomFieldMap();
  return map.get(name) || null;
}

// ─── Lead operations ──────────────────────────────────────────────

export type CloseLead = {
  id: string;
  display_name?: string;
  status_id?: string;
  status_label?: string;
};

// Close's `?email_address=X` query parameter is silently ignored by the v1
// Leads API — it returns the entire org's lead list regardless of value.
// Use the documented `?query=email:"X"` filter syntax instead, then validate
// the returned leads actually contain a contact with the requested email.
// Returns the most-recently-created matching lead so we operate on the
// freshest funnel record rather than a legacy duplicate.
type LeadWithContacts = CloseLead & {
  date_created?: string;
  contacts?: Array<{ emails?: Array<{ email?: string }> }>;
};

export async function findLeadByEmail(email: string): Promise<CloseLead | null> {
  if (!email) return null;
  const target = email.trim().toLowerCase();
  if (!target) return null;
  // Quote the email so `+` and `.` are treated literally; encode for URL.
  const queryValue = `email:"${target}"`;
  const data = await closeFetch<{ data: LeadWithContacts[] }>(
    `/lead/?query=${encodeURIComponent(queryValue)}&_limit=25`
  );
  const matching = (data.data || []).filter((lead) =>
    (lead.contacts || []).some((c) =>
      (c.emails || []).some((e) => (e.email || "").toLowerCase() === target)
    )
  );
  if (matching.length === 0) return null;
  matching.sort((a, b) => (b.date_created || "").localeCompare(a.date_created || ""));
  return matching[0];
}

export type CreateOrUpdateInput = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string; // e.g. "Opt In"
  source: string; // value for the "Lead Source" custom field, e.g. "VSL Funnel"
};

export async function createOrUpdateLead(input: CreateOrUpdateInput): Promise<{ lead_id: string; created: boolean }> {
  const existing = await findLeadByEmail(input.email);

  const statusId = await getStatusId(input.status);

  const name = `${input.first_name} ${input.last_name}`.trim() || input.email;
  const body: Record<string, unknown> = {};
  if (statusId) body.status_id = statusId;
  // Funnel source — try "Lead Source" first (if user created that custom
  // field), fall back to "Ads Source" (which exists by default in their
  // org). Either field captures where the lead came from.
  await applyCustomField(body, "Lead Source", input.source);
  await applyCustomField(body, "Ads Source", input.source);

  if (existing) {
    await closeFetch(`/lead/${existing.id}/`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    return { lead_id: existing.id, created: false };
  }

  body.name = name;
  body.contacts = [
    {
      name,
      emails: input.email ? [{ email: input.email, type: "office" }] : [],
      phones: input.phone ? [{ phone: input.phone, type: "office" }] : [],
    },
  ];

  const created = await closeFetch<{ id: string }>("/lead/", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return { lead_id: created.id, created: true };
}

// Helper: mutates `body` to set the given custom field if it exists.
// Silently skips fields that don't exist in the org — caller doesn't need
// to check existence first.
async function applyCustomField(body: Record<string, unknown>, fieldName: string, value: string | number | null | undefined): Promise<void> {
  if (value === null || value === undefined || value === "") return;
  const id = await getCustomFieldId(fieldName);
  if (!id) return;
  body[`custom.${id}`] = typeof value === "number" ? value : String(value);
}

export async function updateLeadStatusByEmail(email: string, status: string): Promise<{ lead_id: string } | null> {
  const lead = await findLeadByEmail(email);
  if (!lead) return null;
  const statusId = await getStatusId(status);
  if (!statusId) throw new Error(`Close status not found: ${status}`);
  await closeFetch(`/lead/${lead.id}/`, {
    method: "PUT",
    body: JSON.stringify({ status_id: statusId }),
  });
  return { lead_id: lead.id };
}

export type CustomFieldUpdates = Record<string, string | number | null | undefined>;

export async function updateLeadFieldsByEmail(
  email: string,
  fields: {
    status?: string;
    source?: string;
    note?: string;
    /**
     * Map of custom-field DISPLAY NAME → value. Each name is resolved to
     * its Close field ID via getCustomFieldId() and applied if it exists.
     * Unknown field names are skipped silently so the route never breaks
     * if a Close field is renamed or missing.
     */
    customFields?: CustomFieldUpdates;
  }
): Promise<{ lead_id: string } | null> {
  let lead = await findLeadByEmail(email);

  // Close's search index has a ~1-2 second lag after a brand-new lead is
  // created. When /api/lead and /api/qualify fire back-to-back (rare in
  // production, common in smoke tests), the qualify lookup can race the
  // index and find nothing — leaving the Discord ping without a
  // View-in-Close link. One retry covers it.
  if (!lead) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    lead = await findLeadByEmail(email);
  }

  if (!lead) return null;

  const body: Record<string, unknown> = {};
  if (fields.status) {
    const sid = await getStatusId(fields.status);
    if (sid) body.status_id = sid;
  }
  // Funnel source — try both names so it lands regardless of which custom
  // field the org has set up.
  if (fields.source) {
    await applyCustomField(body, "Lead Source", fields.source);
    await applyCustomField(body, "Ads Source", fields.source);
  }
  // Caller-supplied custom field updates (e.g. answer-by-answer mapping
  // from the qualification form into structured Close fields).
  if (fields.customFields) {
    for (const [name, value] of Object.entries(fields.customFields)) {
      await applyCustomField(body, name, value);
    }
  }

  if (Object.keys(body).length > 0) {
    await closeFetch(`/lead/${lead.id}/`, { method: "PUT", body: JSON.stringify(body) });
  }

  if (fields.note) {
    await closeFetch("/activity/note/", {
      method: "POST",
      body: JSON.stringify({ lead_id: lead.id, note: fields.note }),
    });
  }

  return { lead_id: lead.id };
}
