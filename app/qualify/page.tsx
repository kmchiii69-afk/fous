"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import QualifyForm from "@/components/page2/QualifyForm";

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

function Greeting() {
  const sp = useSearchParams();
  const fn = (sp.get("first_name") || "").replace(/[^A-Za-z\s'-]/g, "").slice(0, 24).trim();
  if (!fn) return null;
  return (
    <>
      ,&nbsp;<em style={{ color: "var(--acid)" }}>{fn}</em>
    </>
  );
}

export default function QualifyPage() {
  return (
    <div className="grid-bg" style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--bone)" }}>
      {/* HEADER */}
      <header style={{ borderBottom: "1px solid var(--line)", padding: "20px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Logo />
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span className="pulse" style={{ width: 6, height: 6, background: "var(--acid)", display: "inline-block" }} />
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--acid)", letterSpacing: "0.22em", textTransform: "uppercase" }}>
            · Application · Step 2 of 3 ·
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "64px 48px 24px", textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(800px 360px at 50% 0%, rgba(191,250,70,0.10), transparent 60%)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--acid)", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 18 }}>
            · Quantum Cipher · Operator Application ·
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 60, lineHeight: 0.98, letterSpacing: "-0.045em", color: "var(--bone)", margin: "0 0 18px" }}>
            Let&rsquo;s see if you&rsquo;re a fit<Suspense fallback={null}><Greeting /></Suspense>.
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 17, lineHeight: 1.55, color: "var(--ash)", margin: "0 auto", maxWidth: 680, fontWeight: 400 }}>
            10 quick questions. Takes 2 minutes. <strong style={{ color: "var(--bone)" }}>Be honest</strong> — the more truthful your answers, the better we can help (or tell you we can&rsquo;t).
          </p>
        </div>
      </section>

      {/* FORM */}
      <section style={{ maxWidth: 760, margin: "0 auto", padding: "0 48px 100px" }}>
        <div style={{ background: "var(--bg-1)", border: "1px solid var(--line)", padding: "40px 44px", position: "relative" }}>
          <Suspense fallback={
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 360, color: "var(--ash)", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase" }}>
              <span className="pulse" style={{ width: 8, height: 8, background: "var(--acid)", marginRight: 12, display: "inline-block" }} />
              · Loading application ·
            </div>
          }>
            <QualifyForm />
          </Suspense>
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
