"use client";

import { useEffect, useSyncExternalStore } from "react";
import posthog from "posthog-js";

/* ─── data ─── */
const HYDRA_URL = "https://bit.ly/3Svauv4";
const BLOFIN_URL = "https://bit.ly/4ayHl8r";

/* broker accent colors — scoped to this page only */
const HYDRA = "#C6F56B";
const BLOFIN = "#FF7A1A";

/* ─── Logo ─── */
function Logo({ href }: { href: string }) {
  return (
    <a href={href} style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
      <svg width="22" height="22" viewBox="0 0 22 22" style={{ flexShrink: 0 }}>
        <rect x="1" y="1" width="20" height="20" fill="none" stroke="var(--acid)" strokeWidth="1.4" />
        <rect x="6" y="6" width="10" height="10" fill="var(--acid)" />
        <rect x="9" y="9" width="4" height="4" fill="var(--bg)" />
      </svg>
      <span style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, color: "var(--bone)", letterSpacing: "-0.02em", whiteSpace: "nowrap" as const }}>
        Quantum Cipher
      </span>
    </a>
  );
}

/* ─── Mono label ─── */
function Mono({ children, color = "var(--acid)", style }: { children: React.ReactNode; color?: string; style?: React.CSSProperties }) {
  return (
    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase" as const, color, ...style }}>
      {children}
    </div>
  );
}

/* ─── Feature bullet ─── */
function Feat({ accent, children }: { accent: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 13 }}>
      <span style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, lineHeight: 1.25, minWidth: 16, color: accent }}>+</span>
      <span style={{ fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.45, color: "var(--bone)", fontWeight: 400, flex: "1 1 auto", minWidth: 0 }}>{children}</span>
    </div>
  );
}

/* ─── Broker card ─── */
function BrokerCard({
  accent, glowSide, eyebrow, title, desc, logo, features, chip, cta,
}: {
  accent: string;
  glowSide: "left" | "right";
  eyebrow: string;
  title: React.ReactNode;
  desc: string;
  logo: { src: string; alt: string; height: number; tag: string; tagTracking: string };
  features: string[];
  chip: { label: string; line: string; box: string; boxTracking: string };
  cta: { label: string; href: string; btnClass: string; footnote: string; broker: string };
}) {
  const glow = glowSide === "left"
    ? `radial-gradient(620px 300px at 0% 0%, ${accent === HYDRA ? "rgba(198,245,107,0.07)" : "rgba(255,122,26,0.09)"}, transparent 60%)`
    : `radial-gradient(620px 300px at 100% 0%, ${accent === HYDRA ? "rgba(198,245,107,0.07)" : "rgba(255,122,26,0.09)"}, transparent 60%)`;
  const tint = accent === HYDRA ? "rgba(198,245,107,0.04)" : "rgba(255,122,26,0.04)";
  const chipTint = accent === HYDRA ? "rgba(198,245,107,0.05)" : "rgba(255,122,26,0.05)";

  return (
    <div className="bk-card" style={{ position: "relative", background: "var(--bg-1)", border: "1px solid var(--line)", borderTop: `2px solid ${accent}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: glow }} />
      <div style={{ position: "relative", display: "flex", flexDirection: "column", height: "100%" }}>
        <Mono color={accent} style={{ marginBottom: 22, whiteSpace: "nowrap" as const }}>{eyebrow}</Mono>

        <h2 className="bk-card-title" style={{ fontFamily: "var(--font-display)", fontWeight: 600, lineHeight: 0.98, letterSpacing: "-0.035em", color: "var(--bone)", margin: "0 0 16px" }}>
          {title}
        </h2>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 16, lineHeight: 1.55, color: "var(--ash)", margin: "0 0 26px" }}>{desc}</p>

        {/* brand lockup */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 20px", border: "1px solid var(--line-2)", background: tint, marginBottom: 24 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo.src} alt={logo.alt} style={{ height: logo.height, width: "auto", display: "block" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, letterSpacing: logo.tagTracking, textTransform: "uppercase" as const, color: "var(--ash)" }}>{logo.tag}</span>
        </div>

        {/* features */}
        <div style={{ display: "flex", flexDirection: "column", gap: 13, marginBottom: 26 }}>
          {features.map((f, i) => <Feat key={i} accent={accent}>{f}</Feat>)}
        </div>

        {/* promo / reward chip */}
        <div style={{ border: `1px dashed ${accent}`, background: chipTint, padding: "16px 18px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" as const }}>
          <div>
            <Mono color="var(--ash)" style={{ fontSize: 9, letterSpacing: "0.2em", marginBottom: 6 }}>{chip.label}</Mono>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--bone)", fontWeight: 500 }}>{chip.line}</div>
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 19, fontWeight: 700, letterSpacing: chip.boxTracking, color: accent, padding: "8px 14px", border: `1px solid ${accent}`, background: "rgba(6,7,10,0.5)", whiteSpace: "nowrap" as const }}>
            {chip.box}
          </div>
        </div>

        {/* CTA — pinned to bottom for equal-height cards */}
        <div style={{ marginTop: "auto" }}>
          <a
            href={cta.href}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className={`bk-btn ${cta.btnClass}`}
            onClick={() => posthog.capture("broker_offer_clicked", { broker: cta.broker })}
          >
            {cta.label}
          </a>
          <Mono color="var(--muted)" style={{ fontSize: 9, marginTop: 12, textAlign: "center" as const, letterSpacing: "0.18em" }}>{cta.footnote}</Mono>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ─── */
const emptySubscribe = () => () => {};

export default function BrokerOffers() {
  // Host-aware in-funnel paths — on free.quantumcipherlab.com the proxy strips
  // the /free-course prefix, on the main domain it stays. Server snapshot is
  // false so SSR/hydration render the main-domain paths, then the real host
  // kicks in right after hydration.
  const onFreeHost = useSyncExternalStore(
    emptySubscribe,
    () => window.location.hostname.includes("free."),
    () => false,
  );
  const paths = onFreeHost
    ? { home: "/", confirm: "/confirm" }
    : { home: "/free-course", confirm: "/free-course/confirm" };

  useEffect(() => {
    posthog.capture("broker_offers_viewed");
  }, []);

  return (
    <>
      <style>{`
        .bk-wrap { max-width: 1320px; margin: 0 auto; padding: 0 48px; }
        .bk-h1 { font-size: 72px; }
        .bk-card-title { font-size: 40px; }
        .bk-card { padding: 40px 40px 36px; }
        .bk-split { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: stretch; }
        .bk-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .bk-skip { display: grid; grid-template-columns: 1fr auto; gap: 32px; align-items: center; }
        .bk-skip-btn { min-width: 280px; }

        .bk-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 12px;
          width: 100%;
          padding: 20px 28px;
          font-family: var(--font-mono); font-size: 13px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase; white-space: nowrap;
          border: 0; border-radius: 2px; cursor: pointer;
          transition: transform 160ms ease, box-shadow 160ms ease;
        }
        .bk-btn-hydra {
          background: ${HYDRA}; color: #1B2A06;
          box-shadow: 0 0 0 1px ${HYDRA}, 0 0 36px rgba(198,245,107,0.22);
        }
        .bk-btn-hydra:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 0 1px ${HYDRA}, 0 0 60px rgba(198,245,107,0.42);
        }
        .bk-btn-blofin {
          background: ${BLOFIN}; color: #2A1400;
          box-shadow: 0 0 0 1px ${BLOFIN}, 0 0 36px rgba(255,122,26,0.24);
        }
        .bk-btn-blofin:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 0 1px ${BLOFIN}, 0 0 60px rgba(255,122,26,0.44);
        }
        .bk-btn-ghost {
          background: transparent; color: var(--bone);
          box-shadow: 0 0 0 1px var(--line-2);
        }
        .bk-btn-ghost:hover { box-shadow: 0 0 0 1px var(--acid); color: var(--acid); }

        @media (max-width: 920px) {
          .bk-wrap { padding: 0 22px; }
          .bk-h1 { font-size: 42px; }
          .bk-card-title { font-size: 32px; }
          .bk-card { padding: 32px 26px 30px; }
          .bk-split { grid-template-columns: 1fr; gap: 18px; }
          .bk-stats { grid-template-columns: 1fr 1fr; }
          .bk-branch { display: none; }
          .bk-skip { grid-template-columns: 1fr; gap: 24px; }
          .bk-skip-btn { min-width: 0; width: 100%; }
          .bk-btn { white-space: normal; text-align: center; padding: 18px 20px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .bk-btn { transition: none; }
          .bk-btn:hover { transform: none; }
          .pulse { animation: none; }
        }
      `}</style>

      <main className="grid-bg" style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--bone)" }}>

        {/* ── HEADER ── */}
        <header style={{ borderBottom: "1px solid var(--line)" }}>
          <div className="bk-wrap" style={{ paddingTop: 22, paddingBottom: 22, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" as const }}>
            <Logo href={paths.home} />
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span className="pulse" style={{ width: 6, height: 6, background: "var(--acid)", display: "inline-block", flexShrink: 0 }} />
              <Mono color="var(--ash)" style={{ whiteSpace: "nowrap" as const }}>· Step 2 of 3 · Course access confirmed ·</Mono>
            </div>
          </div>
        </header>

        {/* ── HERO ── */}
        <section style={{ position: "relative", padding: "56px 0 8px", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(900px 520px at 50% -8%, rgba(191,250,70,0.08), transparent 62%)" }} />
          <div className="bk-wrap" style={{ position: "relative", textAlign: "center" }}>

            {/* confirmation chip */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "10px 18px", border: "1px solid var(--acid)", background: "rgba(191,250,70,0.04)", marginBottom: 30 }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--acid)", lineHeight: 1 }}>✓</span>
              <Mono>Lesson 01 is landing in your inbox now</Mono>
            </div>

            <Mono color="var(--ash)" style={{ marginBottom: 22, letterSpacing: "0.24em" }}>· You&rsquo;re in · one quick thing before you start ·</Mono>

            <h1 className="bk-h1" style={{ fontFamily: "var(--font-display)", fontWeight: 600, lineHeight: 0.98, letterSpacing: "-0.045em", color: "var(--bone)", margin: "0 auto 26px", maxWidth: 1040, textWrap: "balance" as const }}>
              You&rsquo;re in. Before lesson one &mdash;<br />
              <em style={{ color: "var(--acid)", textShadow: "0 0 38px rgba(191,250,70,0.34)" }}>set up where you&rsquo;ll actually trade.</em>
            </h1>

            <p style={{ fontFamily: "var(--font-body)", fontSize: 19, lineHeight: 1.6, color: "var(--ash)", margin: "0 auto", maxWidth: 720 }}>
              The course teaches the system. But a system needs a platform to run on. These are the two I personally use and trust &mdash; one funds you with real capital so you risk none of your own, the other is where I place my own trades. Course members get an exclusive deal on both.
            </p>

            {/* hero ministats */}
            <div className="bk-stats" style={{ marginTop: 44, paddingTop: 30, borderTop: "1px solid var(--line)", maxWidth: 760, marginLeft: "auto", marginRight: "auto" }}>
              {[
                { v: "$200K", k: "· Funded · no challenge ·" },
                { v: "$5,000", k: "· Bonus · where Fous trades ·" },
                { v: "2 ways", k: "· Pick one · or both ·" },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 700, color: "var(--bone)", letterSpacing: "-0.03em", lineHeight: 1 }}>{s.v}</div>
                  <Mono color="var(--ash)" style={{ fontSize: 10, marginTop: 9, letterSpacing: "0.18em" }}>{s.k}</Mono>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CHOOSE YOUR BROKER divider ── */}
        <section style={{ padding: "56px 0 0" }}>
          <div className="bk-wrap" style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 44, letterSpacing: "-0.035em", color: "var(--bone)", lineHeight: 1 }}>Choose your broker</div>
            <Mono color="var(--ash)" style={{ marginTop: 16 }}>· Two paths · both vetted by Cam ·</Mono>
            {/* branching connector */}
            {/* Tailwind preflight makes svg display:block, so text-align:center won't center it — use auto margins */}
            <svg className="bk-branch" viewBox="0 0 640 86" width="320" height="43" style={{ margin: "18px auto 0", overflow: "visible" }} aria-hidden="true">
              <path d="M320 4 L320 26" fill="none" stroke="var(--line-2)" strokeWidth="1.5" />
              <path d="M320 26 Q320 44 220 44 L150 44" fill="none" stroke={HYDRA} strokeWidth="1.5" />
              <path d="M320 26 Q320 44 420 44 L490 44" fill="none" stroke={BLOFIN} strokeWidth="1.5" />
              <path d="M150 44 L150 76" fill="none" stroke={HYDRA} strokeWidth="1.5" />
              <path d="M490 44 L490 76" fill="none" stroke={BLOFIN} strokeWidth="1.5" />
              <polygon points="150,82 144,70 156,70" fill={HYDRA} />
              <polygon points="490,82 484,70 496,70" fill={BLOFIN} />
            </svg>
          </div>
        </section>

        {/* ── BROKER SPLIT ── */}
        <section style={{ padding: "26px 0 40px" }}>
          <div className="bk-wrap">
            <div className="bk-split">

              <BrokerCard
                accent={HYDRA}
                glowSide="left"
                eyebrow="· Path 01 · Trade funded ·"
                title={<>Get funded <em style={{ color: HYDRA }}>up to $200K.</em></>}
                desc="No challenges. No phases. Instant funding from day one — for Futures, Crypto, and Forex. Trade real capital with none of your own on the line. Co-founded by Cameron Fous."
                logo={{ src: "/uploads/brokers/hydra-logo.png", alt: "Hydra Funding", height: 38, tag: "FUNDING", tagTracking: "0.3em" }}
                features={[
                  "Instant funding — no eval phase",
                  "Trade Futures, Crypto & Forex",
                  "Up to 90% split · paid on demand",
                  "Accounts from $5K to $200K",
                ]}
                chip={{ label: "· Course-member code ·", line: "20% OFF your first account, site-wide", box: "FOUS20", boxTracking: "0.12em" }}
                cta={{ label: "Get Funded at Hydra →", href: HYDRA_URL, btnClass: "bk-btn-hydra", footnote: "· Opens hydrafunding.io · affiliate offer ·", broker: "hydra" }}
              />

              <BrokerCard
                accent={BLOFIN}
                glowSide="right"
                eyebrow="· Path 02 · Where Fous actually trades ·"
                title={<>Where I place <em style={{ color: BLOFIN }}>my own trades.</em></>}
                desc="Claim up to a $5,000 sign-up bonus at BloFin — the exchange I actually use. Trade crypto and tokenized TradFi like Nasdaq, NVDA, and Gold, all from one account."
                logo={{ src: "/uploads/brokers/blofin-logo.png", alt: "BloFin", height: 26, tag: "CRYPTO EXCHANGE", tagTracking: "0.26em" }}
                features={[
                  "Up to $5,000 in new-user rewards",
                  "Crypto + tokenized stocks & gold",
                  "Spot, futures & copy trading",
                  "Deep, pro-grade liquidity",
                ]}
                chip={{ label: "· New-user reward ·", line: "Sign-up bonus credited on deposit", box: "$5,000", boxTracking: "0.04em" }}
                cta={{ label: "Claim $5K at BloFin →", href: BLOFIN_URL, btnClass: "bk-btn-blofin", footnote: "· Opens blofin.com · affiliate offer ·", broker: "blofin" }}
              />

            </div>
          </div>
        </section>

        {/* ── SKIP TO COURSE ── */}
        <section style={{ padding: "24px 0 80px" }}>
          <div className="bk-wrap">
            <div className="bk-skip" style={{ border: "1px solid var(--line)", background: "var(--bg-1)", padding: "44px 48px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(560px 220px at 0% 50%, rgba(191,250,70,0.06), transparent 62%)" }} />
              <div style={{ position: "relative" }}>
                <Mono style={{ marginBottom: 12 }}>· No pressure ·</Mono>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 600, letterSpacing: "-0.03em", color: "var(--bone)", lineHeight: 1.1, marginBottom: 16, maxWidth: 660, textWrap: "balance" as const }}>
                  Thanks for the info &mdash; take me straight to the course.
                </div>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--ash)", margin: 0, maxWidth: 620 }}>
                  You can always grab these offers later &mdash; they&rsquo;re waiting inside your member area. Lesson 01 is already in your inbox.
                </p>
              </div>
              <div className="bk-skip-btn" style={{ position: "relative" }}>
                <a
                  href={paths.confirm}
                  className="bk-btn bk-btn-ghost"
                  onClick={() => posthog.capture("broker_offers_skipped")}
                >
                  Send me to the free course →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER / DISCLAIMER ── */}
        <footer style={{ borderTop: "1px solid var(--line)", padding: "30px 0 48px" }}>
          <div className="bk-wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" as const }}>
            <Mono color="var(--muted)" style={{ fontSize: 9 }}>· Quantum Cipher Lab · Decode the markets ·</Mono>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 12, lineHeight: 1.55, color: "var(--muted)", margin: 0, maxWidth: 820 }}>
              Hydra Funding and BloFin are partners of Quantum Cipher Lab; we may earn a commission if you sign up through these links. Nothing here is financial advice. Trading involves substantial risk &mdash; trade your own size, risk your own capital.
            </p>
          </div>
        </footer>

      </main>
    </>
  );
}
