"use client";

import { useEffect, useState } from "react";
import { Section } from "@/components/shared/H";

const RR_SLIDES = [
  { src: "uploads/proof/rr-07.jpg", date: "Jul 11, 2025", amount: "+$1.59M", note: "One month into studying with Cameron" },
  { src: "uploads/proof/rr-05.jpg", date: "Aug 03, 2025", amount: "+$201K",  note: "UNI short · single trade" },
  { src: "uploads/proof/rr-06.jpg", date: "Aug 03, 2025", amount: "Mindset", note: "\"Losing money in the markets is a choice.\"" },
  { src: "uploads/proof/rr-04.jpg", date: "Aug 09, 2025", amount: "+$61K",   note: "INJ long · 4-day swing" },
  { src: "uploads/proof/rr-03.jpg", date: "Aug 17, 2025", amount: "+$1.8M",  note: "Mid-May → August total" },
  { src: "uploads/proof/rr-02.jpg", date: "Oct 14, 2025", amount: "+$2.92M", note: "$50K start · one month in" },
  { src: "uploads/proof/rr-01.jpg", date: "Oct 15, 2025", amount: "+$3.16M", note: "All-time P&L" },
];

const btnStyle: React.CSSProperties = {
  width: 44,
  height: 44,
  background: "var(--bg-2)",
  border: "1px solid var(--line-2)",
  color: "var(--bone)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 160ms ease",
};

export default function RickRossSpotlight() {
  const [i, setI] = useState(RR_SLIDES.length - 1);
  const slide = RR_SLIDES[i];

  function go(delta: number) {
    setI((prev) => (prev + delta + RR_SLIDES.length) % RR_SLIDES.length);
  }

  function openLightbox() {
    window.dispatchEvent(
      new CustomEvent("qc:lightbox", { detail: { src: `/${slide.src}`, alt: `Rick Ross ${slide.date}` } })
    );
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <Section py={120} style={{ borderBottom: "1px solid var(--line)" }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--acid)", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 14 }}>
          · Student spotlight · 7 receipts ·
        </div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: 72,
            lineHeight: 0.98,
            letterSpacing: "-0.04em",
            color: "var(--bone)",
            margin: 0,
            maxWidth: 1100,
          }}
        >
          One student. $50K start.{" "}
          <em style={{ color: "var(--acid)" }}>$3.16M out.</em>
        </h2>
      </div>

      <div
        style={{
          background: "var(--bg-1)",
          border: "1px solid var(--line)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 700,
            height: "100%",
            background: "radial-gradient(circle at 80% 50%, rgba(191,250,70,0.12), transparent 60%)",
            pointerEvents: "none",
          }}
        />

        {/* CAROUSEL */}
        <div style={{ padding: 28, borderRight: "1px solid var(--line)", position: "relative" }}>
          <div
            onClick={openLightbox}
            style={{
              position: "relative",
              aspectRatio: "16/10",
              background: "var(--bg-2)",
              border: "1px solid var(--line)",
              overflow: "hidden",
              cursor: "zoom-in",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={i}
              src={`/${slide.src}`}
              alt={`Rick Ross · ${slide.date}`}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "left top",
                animation: "rrFade 360ms ease",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 12,
                left: 12,
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 10px",
                background: "rgba(6,7,10,0.88)",
                border: "1px solid var(--acid)",
              }}
            >
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, color: "var(--acid)", letterSpacing: "0.22em", textTransform: "uppercase" }}>
                · {slide.date}
              </span>
            </div>
            <div
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                padding: "6px 10px",
                background: "rgba(6,7,10,0.88)",
                border: "1px solid var(--line-2)",
                display: "flex",
                alignItems: "center",
                gap: 6,
                pointerEvents: "none",
              }}
            >
              <svg width="9" height="9" viewBox="0 0 14 14" fill="none" stroke="var(--bone)" strokeWidth="1.6">
                <circle cx="6" cy="6" r="4.5" />
                <line x1="9.5" y1="9.5" x2="13" y2="13" />
                <line x1="4" y1="6" x2="8" y2="6" />
                <line x1="6" y1="4" x2="6" y2="8" />
              </svg>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, color: "var(--bone)", letterSpacing: "0.20em" }}>ENLARGE</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginTop: 16,
              paddingBottom: 14,
              borderBottom: "1px solid var(--line)",
            }}
          >
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--acid)", letterSpacing: "-0.025em", lineHeight: 1 }}>
                {slide.amount}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, color: "var(--ash)", letterSpacing: "0.22em", textTransform: "uppercase", marginTop: 8 }}>
                · {slide.note} ·
              </div>
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--bone)", letterSpacing: "0.22em" }}>
              {String(i + 1).padStart(2, "0")} / {String(RR_SLIDES.length).padStart(2, "0")}
            </span>
          </div>

          <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
            <button
              onClick={() => go(-1)}
              aria-label="Previous"
              style={btnStyle}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--acid)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--acid)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--line-2)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--bone)"; }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="9,2 3,7 9,12" /></svg>
            </button>

            <div style={{ display: "flex", gap: 8, flex: 1, justifyContent: "center" }}>
              {RR_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setI(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  style={{
                    width: idx === i ? 28 : 8,
                    height: 8,
                    background: idx === i ? "var(--acid)" : "var(--line-2)",
                    border: 0,
                    padding: 0,
                    cursor: "pointer",
                    transition: "all 200ms ease",
                  }}
                />
              ))}
            </div>

            <button
              onClick={() => go(1)}
              aria-label="Next"
              style={btnStyle}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--acid)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--acid)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--line-2)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--bone)"; }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="5,2 11,7 5,12" /></svg>
            </button>
          </div>

          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, color: "var(--ash)", letterSpacing: "0.22em", textTransform: "uppercase", marginTop: 14, textAlign: "center" }}>
            · Use ← → arrows · click to enlarge ·
          </div>
        </div>

        {/* QUOTE */}
        <div
          style={{
            padding: "52px 56px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--acid)", letterSpacing: "0.22em", textTransform: "uppercase" }}>
              · @rick_ross · Bybit · Verified ·
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, color: "var(--acid)", letterSpacing: "0.22em", border: "1px solid var(--acid)", padding: "3px 7px" }}>
              VERIFIED
            </span>
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 104,
              fontWeight: 700,
              color: "var(--acid)",
              letterSpacing: "-0.05em",
              lineHeight: 0.88,
              textShadow: "0 0 48px rgba(191,250,70,0.4)",
              marginBottom: 14,
            }}
          >
            $3.16M
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--ash)", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 28 }}>
            · Profit · Started with $50K · All-time P&amp;L ·
          </div>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 24,
              fontWeight: 500,
              fontStyle: "italic",
              color: "var(--bone)",
              lineHeight: 1.35,
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            &ldquo;$3,160,296.84 profit from $50K. This isn&rsquo;t just a number — it&rsquo;s the result of discipline, execution, and following the Quantum Cipher strategy to the letter. Every setup, every trade, every lesson — it all added up. All hail @cameron.fous. Let the results speak for themselves.&rdquo;
          </p>
        </div>
      </div>
    </Section>
  );
}
