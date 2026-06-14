// Kit (formerly ConvertKit) helpers
//
// Uses the Kit v3 (legacy) API at api.convertkit.com. Both `subscribeToForm`
// and `tagSubscriber` work with just the public API Key — no secret needed.

const KIT_V3_BASE = "https://api.convertkit.com/v3";

export async function subscribeToForm(input: {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  formId?: string;
}): Promise<{ subscription_id?: number } | null> {
  const apiKey = process.env.KIT_API_KEY || "";
  const formId = input.formId || process.env.KIT_FORM_ID || "";
  if (!apiKey) throw new Error("KIT_API_KEY not configured");
  if (!formId) throw new Error("KIT_FORM_ID not configured");
  if (!input.email) throw new Error("Kit subscribe requires an email");

  const res = await fetch(`${KIT_V3_BASE}/forms/${formId}/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      email: input.email,
      first_name: input.first_name || "",
      fields: {
        last_name: input.last_name || "",
        phone: input.phone || "",
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Kit subscribe ${res.status}: ${text.slice(0, 400)}`);
  }

  const data = (await res.json().catch(() => ({}))) as {
    subscription?: { id?: number };
  };
  return data.subscription?.id ? { subscription_id: data.subscription.id } : null;
}

/**
 * Attach a Kit tag to a subscriber by email. Creates the subscriber if they
 * don't exist yet (Kit auto-creates on tag subscribe). Returns silently if
 * `tagId` is missing/empty so callers don't have to guard each invocation.
 */
export async function tagSubscriber(input: {
  email: string;
  tagId: string | number | null | undefined;
  first_name?: string;
  last_name?: string;
  phone?: string;
}): Promise<{ subscription_id?: number } | null> {
  if (!input.tagId) return null; // tag id not configured — skip silently
  const apiKey = process.env.KIT_API_KEY || "";
  if (!apiKey) throw new Error("KIT_API_KEY not configured");
  if (!input.email) throw new Error("Kit tagSubscriber requires an email");

  const res = await fetch(`${KIT_V3_BASE}/tags/${input.tagId}/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      email: input.email,
      first_name: input.first_name || "",
      fields: {
        last_name: input.last_name || "",
        phone: input.phone || "",
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Kit tag ${input.tagId} ${res.status}: ${text.slice(0, 400)}`);
  }

  const data = (await res.json().catch(() => ({}))) as {
    subscription?: { id?: number };
  };
  return data.subscription?.id ? { subscription_id: data.subscription.id } : null;
}
