// Server-side PostHog capture for events that originate in API routes
// (Calendly webhooks, geo-gated routing decisions). Keyed on the lead's
// email — the same distinct_id the client identifies with — so server and
// browser events join up on one person timeline.
export async function capturePostHog(
  event: string,
  distinctId: string,
  properties: Record<string, unknown>,
) {
  const apiKey = (process.env.NEXT_PUBLIC_POSTHOG_KEY || "").trim();
  const host = (process.env.NEXT_PUBLIC_POSTHOG_HOST || "").trim();
  if (!apiKey || !host || !distinctId) return;
  const res = await fetch(`${host.replace(/\/$/, "")}/capture/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: apiKey, event, distinct_id: distinctId, properties }),
  });
  if (!res.ok) throw new Error(`PostHog capture ${res.status}`);
}
