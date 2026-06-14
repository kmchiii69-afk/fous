import Link from "next/link";
import type { ReactNode } from "react";

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/refund", label: "Refund" },
  { href: "/disclaimer", label: "Disclaimer" },
];

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

export default function LegalShell({
  title,
  kicker,
  effectiveDate,
  children,
}: {
  title: string;
  kicker: string;
  effectiveDate: string;
  children: ReactNode;
}) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--bone)" }}>
      {/* HEADER */}
      <header style={{ borderBottom: "1px solid var(--line)", padding: "20px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Logo />
        <nav style={{ display: "flex", gap: 24, alignItems: "center" }}>
          {LEGAL_LINKS.map((l) => (
            <Link key={l.href} href={l.href}
              style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--ash)", letterSpacing: "0.22em", textTransform: "uppercase", textDecoration: "none" }}>
              · {l.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* TITLE BLOCK */}
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "96px 48px 48px" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--acid)", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 18 }}>
          · {kicker} ·
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 72, lineHeight: 0.96, letterSpacing: "-0.045em", color: "var(--bone)", margin: "0 0 32px" }}>
          {title}
        </h1>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--ash)", letterSpacing: "0.22em", textTransform: "uppercase", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", padding: "16px 0" }}>
          · Effective {effectiveDate} · iknkfx inc · DBA Quantum Cipher Lab ·
        </div>
      </div>

      {/* CONTENT */}
      <main style={{ maxWidth: 880, margin: "0 auto", padding: "0 48px 120px", fontFamily: "var(--font-body)", fontSize: 16, lineHeight: 1.7, color: "var(--ash)", fontWeight: 400 }}>
        {children}
      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid var(--line)", padding: "32px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.22em", textTransform: "uppercase" }}>
        <span>© 2026 · iknkfx inc · All Rights Reserved</span>
        <span>· Not financial advice · Trading involves real risk of loss ·</span>
      </footer>
    </div>
  );
}

export function H2({ children }: { children: ReactNode }) {
  return (
    <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 32, lineHeight: 1.05, letterSpacing: "-0.025em", color: "var(--bone)", margin: "56px 0 18px" }}>
      {children}
    </h2>
  );
}

export function H3({ children }: { children: ReactNode }) {
  return (
    <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 20, lineHeight: 1.2, letterSpacing: "-0.015em", color: "var(--bone)", margin: "32px 0 12px" }}>
      {children}
    </h3>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <p style={{ margin: "0 0 18px" }}>{children}</p>;
}

export function UL({ children }: { children: ReactNode }) {
  return <ul style={{ margin: "0 0 18px", paddingLeft: 22 }}>{children}</ul>;
}

export function LI({ children }: { children: ReactNode }) {
  return <li style={{ margin: "0 0 8px" }}>{children}</li>;
}

export function Callout({ children }: { children: ReactNode }) {
  return (
    <div style={{ background: "var(--bg-1)", border: "1px solid var(--acid)", borderLeft: "2px solid var(--acid)", padding: "20px 24px", margin: "24px 0", fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.6, color: "var(--bone)", fontWeight: 500 }}>
      {children}
    </div>
  );
}
