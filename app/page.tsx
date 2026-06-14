"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import Logo from "@/components/shared/Logo";
import VideoThumbnail from "@/components/page1/VideoThumbnail";
import LeadModal, { type LeadModalForm } from "@/components/page1/LeadModal";

export default function SqueezePage() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function openModal() {
    posthog.capture("lead_modal_opened");
    setOpen(true);
  }

  function handleSubmit(form: LeadModalForm) {
    const params = new URLSearchParams({
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      phone: form.phone,
    });
    router.push(`/training?${params.toString()}`);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundImage:
          "radial-gradient(900px 600px at 50% 0%, rgba(191,250,70,0.06), transparent 60%), radial-gradient(700px 600px at 50% 100%, rgba(191,250,70,0.04), transparent 60%)",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          padding: "20px 48px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Logo />
        <span
          className="qc-hide-mobile"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            fontWeight: 600,
            color: "var(--muted)",
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          · Free Training · No Charge ·
        </span>
      </div>

      {/* Hero */}
      <div
        className="grid-bg"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 48px 40px",
          textAlign: "center",
          position: "relative",
        }}
      >
        {/* Live pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 18,
            padding: "8px 16px",
            border: "1px solid var(--line-2)",
            background: "rgba(11,12,16,0.6)",
          }}
        >
          <div
            className="pulse"
            style={{ width: 6, height: 6, background: "var(--acid)" }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              fontWeight: 600,
              color: "var(--acid)",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
            }}
          >
            2026 Cohort · Application Open
          </span>
        </div>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: 52,
            lineHeight: 1.02,
            letterSpacing: "-0.04em",
            color: "var(--bone)",
            margin: "0 auto 16px",
            maxWidth: 1080,
          }}
        >
          How My Students Are Compounding 7 Figures Trading{" "}
          <em
            style={{
              color: "var(--acid)",
              textShadow: "0 0 32px rgba(191,250,70,0.4)",
            }}
          >
            90 Minutes A Week.
          </em>
        </h1>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 17,
            lineHeight: 1.5,
            color: "var(--ash)",
            margin: "0 auto 28px",
            maxWidth: 720,
            fontWeight: 400,
          }}
        >
          No day trading. No signal groups. No ICT/SMC. Just one weekly plan, a
          nine-phase cycle, and 21 years of live trading.
        </p>

        <VideoThumbnail onClick={openModal} />

        <button
          onClick={openModal}
          className="btn btn-lg"
          style={{ marginTop: 28 }}
        >
          Join Quantum Cipher →
        </button>
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: "1px solid var(--line)",
          padding: "20px 48px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          color: "var(--muted)",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
        }}
      >
        <span>© 2026 · Quantum Cipher</span>
        <span>· Not Financial Advice · Trading Involves Real Risk Of Loss ·</span>
      </div>

      {open && (
        <LeadModal onClose={() => setOpen(false)} onSubmit={handleSubmit} />
      )}
    </div>
  );
}
