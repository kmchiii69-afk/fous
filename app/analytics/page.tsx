import { cookies } from "next/headers";
import { createHash } from "crypto";
import PasswordGate from "./PasswordGate";
import Dashboard from "./Dashboard";
import "./jarvis.css";

export const metadata = { title: "Analytics · Quantum Cipher" };

function isAuthed(token: string | undefined): boolean {
  const password = (process.env.ANALYTICS_PASSWORD || "").trim();
  if (!password || !token) return false;
  const expected = createHash("sha256").update(`qc-analytics:${password}`).digest("hex");
  return token === expected;
}

export default async function AnalyticsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("qc_auth")?.value;

  if (!isAuthed(token)) {
    return <PasswordGate />;
  }

  return <Dashboard />;
}
