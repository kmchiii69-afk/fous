import { createHash } from "crypto";

// Shared auth check for the Funnelmaxxing/analytics API routes. The token is
// a sha256 of the analytics password set as the `qc_auth` cookie by
// /api/analytics/auth — same scheme the original dashboard shipped with.
export function isAuthed(token: string | undefined): boolean {
  const password = (process.env.ANALYTICS_PASSWORD || "").trim();
  if (!password || !token) return false;
  const expected = createHash("sha256").update(`qc-analytics:${password}`).digest("hex");
  return token === expected;
}
