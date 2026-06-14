"use client";

import { useEffect, useState } from "react";
import posthog from "posthog-js";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--bg)",
  border: "1px solid var(--line-2)",
  color: "var(--bone)",
  padding: "16px 18px",
  fontFamily: "var(--font-mono)",
  fontSize: 13,
  letterSpacing: "0.04em",
  outline: "none",
  borderRadius: 0,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-mono)",
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: "0.22em",
  color: "var(--ash)",
  textTransform: "uppercase",
  marginBottom: 10,
};

export type LeadModalForm = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
};

export default function LeadModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (form: LeadModalForm) => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState<string | undefined>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your first and last name.");
      return;
    }
    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!phone || !isValidPhoneNumber(phone)) {
      setError("Please enter a valid phone number with country code.");
      return;
    }

    setSubmitting(true);

    const payload: LeadModalForm = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || "",
    };

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || `Request failed (${res.status})`);
      }
      // Identify the user in PostHog and fire conversion event
      posthog.identify(payload.email, {
        email: payload.email,
        first_name: payload.first_name,
        last_name: payload.last_name,
        phone: payload.phone,
      });
      posthog.capture("lead_submitted", {
        first_name: payload.first_name,
        email: payload.email,
      });
      onSubmit(payload);
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(6,7,10,0.85)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 560,
          background: "var(--bg-1)",
          border: "1px solid var(--acid)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 80px rgba(191,250,70,0.15)",
          padding: "48px 44px 40px",
          position: "relative",
          maxHeight: "calc(100vh - 48px)",
          overflowY: "auto",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            background: "transparent",
            border: 0,
            color: "var(--ash)",
            fontFamily: "var(--font-mono)",
            fontSize: 14,
            width: 28,
            height: 28,
            cursor: "pointer",
          }}
        >
          ✕
        </button>

        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div className="pulse" style={{ width: 8, height: 8, background: "var(--acid)" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, color: "var(--acid)", letterSpacing: "0.24em", textTransform: "uppercase" }}>
              · One More Step ·
            </span>
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 36, lineHeight: 1.02, letterSpacing: "-0.03em", color: "var(--bone)", margin: 0 }}>
            Where should I send<br />the <em style={{ color: "var(--acid)" }}>free training?</em>
          </h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.55, color: "var(--ash)", margin: "16px 0 0" }}>
            Drop your details. You&rsquo;ll be watching the training in 10 seconds. Application info is at the end if it&rsquo;s a fit.
          </p>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle} htmlFor="qc-first">First Name</label>
              <input
                id="qc-first"
                style={inputStyle}
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jane"
                autoFocus
                autoComplete="given-name"
                maxLength={40}
              />
            </div>
            <div>
              <label style={labelStyle} htmlFor="qc-last">Last Name</label>
              <input
                id="qc-last"
                style={inputStyle}
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                autoComplete="family-name"
                maxLength={40}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle} htmlFor="qc-email">Email Address</label>
            <input
              id="qc-email"
              type="email"
              style={inputStyle}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@operator.io"
              autoComplete="email"
              maxLength={120}
            />
          </div>

          <div>
            <label style={labelStyle} htmlFor="qc-phone">Phone Number</label>
            <div className="qc-phone-wrap">
              <PhoneInput
                id="qc-phone"
                international
                defaultCountry="US"
                value={phone}
                onChange={setPhone}
                placeholder="(555) 555-5555"
              />
            </div>
          </div>

          {error && (
            <div
              role="alert"
              style={{
                padding: "10px 14px",
                background: "rgba(255,45,171,0.10)",
                border: "1px solid var(--pink)",
                color: "var(--bone)",
                fontFamily: "var(--font-body)",
                fontSize: 13,
                lineHeight: 1.45,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: 6,
              padding: "18px 26px",
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              background: "var(--acid)",
              color: "var(--bg)",
              border: 0,
              borderRadius: 2,
              cursor: submitting ? "wait" : "pointer",
              opacity: submitting ? 0.6 : 1,
              boxShadow: "0 0 0 1px var(--acid), 0 0 32px rgba(191,250,70,0.25)",
            }}
          >
            {submitting ? "Securing your seat..." : "Join Quantum Cipher →"}
          </button>
        </form>

        <div style={{ marginTop: 26, paddingTop: 22, borderTop: "1px solid var(--line)", display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
          {["100% Free", "No Credit Card", "Unsubscribe Anytime"].map((t) => (
            <span key={t} style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 500, color: "var(--muted)", letterSpacing: "0.22em", textTransform: "uppercase" }}>
              · {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
