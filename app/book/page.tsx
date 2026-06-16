"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import posthog from "posthog-js";
import BookingCalendar from "@/components/page2/BookingCalendar";

// Used only by the callback fallback flow (not the main calendar)
const BASE_CALENDLY = process.env.NEXT_PUBLIC_CALENDLY_URL || "https://calendly.com/benitezsalescontact/30min";

// Legacy Calendly theme — kept for the callback fallback iframe only
const CALENDLY_THEME = {
  background_color: "06070A",
  text_color: "F2F0E6",
  primary_color: "BFFA46",
  hide_event_type_details: "1",
  hide_landing_page_details: "1",
};

function buildCalendlyUrl(name: string, email: string, _phone: string) {
  const params = new URLSearchParams({ ...CALENDLY_THEME });
  if (name) params.set("name", name);
  if (email) params.set("email", email);
  // Phone is intentionally NOT pre-filled here. The Calendly event currently
  // has no Phone custom question — so `a1=` would land in "Please share
  // anything for our meeting" which is confusing. Phone is already in Close
  // and Discord; setters can dial from there. To re-enable: add a Phone
  // question as the FIRST custom question on the Calendly event, then
  // restore `params.set("a1", _phone)`.
  // URLSearchParams encodes spaces as "+"; Calendly's prefill parser
  // interprets "+" literally, so swap to %20 to render "Cameron Fous"
  // correctly instead of "Cameron+Fous".
  return `${BASE_CALENDLY}?${params.toString().replace(/\+/g, "%20")}`;
}

function Logo() {
  return (
    <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", flexShrink: 0, whiteSpace: "nowrap" }}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="0.5" y="0.5" width="27" height="27" stroke="var(--acid)" strokeWidth="1" />
        <rect x="7" y="7" width="14" height="14" fill="var(--acid)" />
        <rect x="11" y="11" width="6" height="6" fill="var(--bg)" />
      </svg>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "var(--bone)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
        Quantum Cipher
      </span>
    </Link>
  );
}

function BookInner() {
  const sp = useSearchParams();
  const firstName = (sp.get("first_name") || "").replace(/[^A-Za-z\s'-]/g, "").slice(0, 40);
  const lastName = (sp.get("last_name") || "").replace(/[^A-Za-z\s'-]/g, "").slice(0, 40);
  const email = (sp.get("email") || "").slice(0, 120);
  const phone = (sp.get("phone") || "").slice(0, 24);

  useEffect(() => {
    if (email) posthog.identify(email, { email, first_name: firstName, last_name: lastName, phone });
    posthog.capture("book_page_viewed", { email: email || undefined });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BookingCalendar
      firstName={firstName}
      lastName={lastName}
      email={email}
      phone={phone}
    />
  );
}

function FirstNameGreeting() {
  const sp = useSearchParams();
  const fn = (sp.get("first_name") || "").replace(/[^A-Za-z\s'-]/g, "").slice(0, 24);
  if (!fn) return null;
  return (
    <>
      , <em style={{ color: "var(--acid)" }}>{fn}</em>
    </>
  );
}

// Fallback for visitors who reach the calendar but don't pick a slot —
// historically ~4 in 5 of them. One tap flags the lead in Close + pings
// setters in Discord so the intent isn't lost when they close the tab.
//
// Deliberately a safety net, not an option: it stays hidden for the first
// 75 seconds — inside the window where committed people pick a slot — so it
// can't siphon anyone away from self-booking. Only lingerers (the cohort
// that historically bounces with nothing) ever see it.
const FALLBACK_DELAY_MS = 75_000;

function CallbackFallback() {
  const sp = useSearchParams();
  const email = (sp.get("email") || "").slice(0, 120);
  const firstName = (sp.get("first_name") || "").replace(/[^A-Za-z\s'-]/g, "").slice(0, 40);
  const lastName = (sp.get("last_name") || "").replace(/[^A-Za-z\s'-]/g, "").slice(0, 40);
  const phone = (sp.get("phone") || "").slice(0, 24);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setVisible(true), FALLBACK_DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  // Without an email we can't tie the request to a lead — hide the offer.
  if (!email || !visible) return null;

  async function request() {
    if (status === "sending" || status === "done") return;
    setStatus("sending");
    posthog.capture("book_fallback_requested");
    try {
      const res = await fetch("/api/callback-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, email, phone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) throw new Error();
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div style={{ marginTop: 14, padding: "18px 22px", border: "1px solid var(--acid)", background: "rgba(191,250,70,0.06)", display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--acid)", lineHeight: 1 }}>✓</span>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--bone)" }}>
          Got it — the team will reach out to you shortly{phone ? ` at ${phone}` : ""}.
        </span>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 14, padding: "18px 22px", border: "1px solid var(--line)", background: "var(--bg-1)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", animation: "lbIn 400ms ease both" }}>
      <span style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--ash)" }}>
        Can&rsquo;t find a time that works?
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        {status === "error" && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--pink)", letterSpacing: "0.1em" }}>Something went wrong — try again</span>
        )}
        <button
          onClick={request}
          disabled={status === "sending"}
          className="btn-ghost"
          style={{ padding: "12px 20px", background: "transparent", border: 0, boxShadow: "0 0 0 1px var(--line-2)", color: "var(--bone)", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", cursor: status === "sending" ? "wait" : "pointer" }}
        >
          {status === "sending" ? "Sending..." : "Have the team call me →"}
        </button>
      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <div className="grid-bg" style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--bone)" }}>
      {/* HEADER */}
      <header style={{ borderBottom: "1px solid var(--line)", padding: "20px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Logo />
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span className="pulse" style={{ width: 6, height: 6, background: "var(--acid)", display: "inline-block" }} />
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--acid)", letterSpacing: "0.22em", textTransform: "uppercase" }}>
            · Qualified · Pick your time ·
          </div>
        </div>
      </header>

      {/* HERO — compact on purpose: the calendar is the conversion surface,
          keep it as close to the fold as possible */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 48px 24px", textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(800px 360px at 50% 0%, rgba(191,250,70,0.10), transparent 60%)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--acid)", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 14 }}>
            · You&rsquo;re in · Final step ·
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 48, lineHeight: 0.98, letterSpacing: "-0.045em", color: "var(--bone)", margin: "0 0 14px" }}>
            Pick a time
            <Suspense fallback={null}><FirstNameGreeting /></Suspense>.
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 17, lineHeight: 1.55, color: "var(--ash)", margin: "0 auto", maxWidth: 640, fontWeight: 400 }}>
            30 minutes with the team — we&rsquo;ll walk the system, see if it fits where you are, and answer anything on your mind. Grabbing a slot takes 30 seconds.
          </p>
        </div>
      </section>

      {/* CALENDLY EMBED */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "0 48px 32px" }}>
        <div style={{ background: "var(--bg-1)", border: "1px solid var(--line)", padding: "32px 36px", position: "relative" }}>
          <Suspense fallback={
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 360, color: "var(--ash)", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase" }}>
              <span className="pulse" style={{ width: 8, height: 8, background: "var(--acid)", marginRight: 12, display: "inline-block" }} />
              · Preparing calendar ·
            </div>
          }>
            <BookInner />
          </Suspense>
        </div>
        <Suspense fallback={null}>
          <CallbackFallback />
        </Suspense>
      </section>

      {/* WHAT TO EXPECT */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "0 48px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {[
            { n: "01", t: "Tell us your situation", d: "5 minutes on where you are, what you've tried, and what you actually want." },
            { n: "02", t: "We walk the system", d: "How the Quantum Cipher framework actually works — phases, swing setups, weekly plan." },
            { n: "03", t: "Decide together", d: "If we're a fit you'll know on the call. If we're not, we'll point you somewhere useful." },
          ].map((s, i) => (
            <div key={i} style={{ background: "var(--bg-1)", border: "1px solid var(--line)", borderTop: "1px solid var(--acid)", padding: "20px 22px" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--acid)", letterSpacing: "0.22em", marginBottom: 10 }}>· {s.n} ·</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, color: "var(--bone)", letterSpacing: "-0.015em", marginBottom: 8 }}>{s.t}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.55, color: "var(--ash)", fontWeight: 400 }}>{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid var(--line)", padding: "32px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.22em", textTransform: "uppercase" }}>
        <span>© 2026 · iknkfx inc · All Rights Reserved</span>
        <span>· Not financial advice · Trading involves real risk of loss ·</span>
      </footer>
    </div>
  );
}
