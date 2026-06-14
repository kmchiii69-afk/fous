"use client";

import { useState } from "react";
import CycleScrubber, { CYCLE_PHASES } from "./CycleScrubber";
import { Section } from "@/components/shared/H";

export default function CycleSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = CYCLE_PHASES[activeIdx];
  const activeColor = active.v === "long" ? "var(--acid)" : "var(--pink)";
  const sideLabel = active.v === "long" ? "Long" : "Short";

  return (
    <Section py={140} style={{ borderBottom: "1px solid var(--line)" }}>
      <div style={{ marginBottom: 48, maxWidth: 1180 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--acid)", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 14 }}>
          · The Krypton 2.0 method ·
        </div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: 72,
            lineHeight: 0.97,
            letterSpacing: "-0.04em",
            color: "var(--bone)",
            margin: 0,
          }}
        >
          One full cycle.{" "}
          <em style={{ color: "var(--acid)" }}>Nine distinct phases.</em>
          <br />
          The same playbook every time.
        </h2>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 19,
            lineHeight: 1.55,
            color: "var(--ash)",
            margin: "24px 0 0",
            maxWidth: 920,
            fontWeight: 400,
          }}
        >
          Every cycle moves through the same nine phases. Drag the dot below to walk through them — long bias, short bias, what each one looks like on the chart, and where retail gets washed out.
        </p>
      </div>

      <div
        style={{
          background: "var(--bg-1)",
          border: "1px solid var(--line)",
          padding: "44px 48px 36px",
          marginBottom: 24,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: "radial-gradient(900px 400px at 50% 50%, rgba(191,250,70,0.06), transparent 60%)",
          }}
        />
        <div style={{ position: "relative" }}>
          <CycleScrubber activeIdx={activeIdx} setActiveIdx={setActiveIdx} />

          <div
            style={{
              marginTop: 36,
              paddingTop: 28,
              borderTop: "1px solid var(--line)",
              display: "grid",
              gridTemplateColumns: "auto 1fr auto",
              gap: 28,
              alignItems: "start",
            }}
          >
            <div style={{ minWidth: 200 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: activeColor, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 14 }}>
                · PHASE {active.id} ·
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 56,
                  fontWeight: 600,
                  color: "var(--bone)",
                  letterSpacing: "-0.035em",
                  lineHeight: 0.95,
                  marginBottom: 14,
                }}
              >
                {active.name}
              </div>
              <span
                style={{
                  display: "inline-block",
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  fontWeight: 700,
                  color: activeColor,
                  letterSpacing: "0.22em",
                  border: `1px solid ${activeColor}`,
                  padding: "4px 10px",
                }}
              >
                {sideLabel.toUpperCase()} BIAS
              </span>
            </div>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 17,
                lineHeight: 1.55,
                color: "var(--ash)",
                margin: 0,
                fontWeight: 400,
                maxWidth: 720,
              }}
            >
              {active.desc}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={() => setActiveIdx(Math.max(0, activeIdx - 1))}
                disabled={activeIdx === 0}
                aria-label="Previous phase"
                style={{
                  width: 44,
                  height: 44,
                  background: "var(--bg-2)",
                  border: "1px solid var(--line-2)",
                  color: "var(--bone)",
                  cursor: activeIdx === 0 ? "default" : "pointer",
                  opacity: activeIdx === 0 ? 0.4 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="9,2 3,7 9,12" /></svg>
              </button>
              <button
                onClick={() => setActiveIdx(Math.min(CYCLE_PHASES.length - 1, activeIdx + 1))}
                disabled={activeIdx === CYCLE_PHASES.length - 1}
                aria-label="Next phase"
                style={{
                  width: 44,
                  height: 44,
                  background: "var(--bg-2)",
                  border: "1px solid var(--line-2)",
                  color: "var(--bone)",
                  cursor: activeIdx === CYCLE_PHASES.length - 1 ? "default" : "pointer",
                  opacity: activeIdx === CYCLE_PHASES.length - 1 ? 0.4 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="5,2 11,7 5,12" /></svg>
              </button>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 40, marginTop: 28, paddingTop: 24, borderTop: "1px solid var(--line)" }}>
            {[
              { c: "var(--acid)", l: "Long opportunity · 6 phases" },
              { c: "var(--pink)", l: "Short opportunity · 3 phases" },
            ].map((x, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 10, height: 10, background: x.c, display: "inline-block" }} />
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--ash)", letterSpacing: "0.22em", textTransform: "uppercase" }}>
                  · {x.l} ·
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 22,
          fontWeight: 500,
          fontStyle: "italic",
          color: "var(--ash)",
          textAlign: "center",
          margin: "40px auto 0",
          maxWidth: 920,
          letterSpacing: "-0.01em",
          lineHeight: 1.4,
        }}
      >
        Cameron walks through every phase live inside Quantum Cipher — with real, current examples from the crypto market.
      </p>
    </Section>
  );
}
