"use client";

import { useState, useEffect } from "react";
import posthog from "posthog-js";

// REGIONAL EDITION — duplicate of app/wolfpack/page.tsx with PPP pricing
// ($297, Apple-style: it's just the price, no discount framing) for low-PPP
// geos. Budget-tier survey leads from those countries land here via
// /qualified; proxy.ts fences the route — non-listed countries bounce to
// /wolfpack, and the page stays dormant until the checkout link exists.
// When you edit the main Wolfpack page, mirror the change here.
//
// Checkout: set NEXT_PUBLIC_WHOP_GLOBAL_URL in Vercel to the $297 Whop
// plan link, then redeploy. Until then proxy.ts redirects this page away.
const JOIN_URL = (process.env.NEXT_PUBLIC_WHOP_GLOBAL_URL || "https://whop.com/iknkfx/iknkfx/").trim();
const ALT_URL  = JOIN_URL;

// ─── Shared Utility Components ───────────────────────────────────────────────

function Wrap({ children, max = 1320, style }: { children: React.ReactNode; max?: number; style?: React.CSSProperties }) {
  return <div style={{ maxWidth: max, margin: "0 auto", padding: "0 48px", ...style }}>{children}</div>;
}

function Section({ id, children, py = 120, style }: { id?: string; children: React.ReactNode; py?: number; style?: React.CSSProperties }) {
  return <section id={id} style={{ padding: `${py}px 0`, ...style }}><Wrap>{children}</Wrap></section>;
}

function H({ num, label, title, sub }: { num: string; label: string; title: React.ReactNode; sub?: string }) {
  return (
    <div style={{ marginBottom: 60 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, color: "var(--acid)", letterSpacing: "0.22em", padding: "6px 12px", border: "1px solid var(--acid)" }}>§ {num}</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, letterSpacing: "0.24em", color: "var(--acid)", textTransform: "uppercase" }}>{label}</span>
      </div>
      <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 76, lineHeight: 0.98, letterSpacing: "-0.04em", color: "var(--bone)", margin: "0 0 24px", maxWidth: 1100 }}>{title}</h2>
      {sub && <p style={{ fontFamily: "var(--font-body)", fontSize: 19, lineHeight: 1.6, color: "var(--ash)", margin: 0, maxWidth: 820, fontWeight: 400 }}>{sub}</p>}
    </div>
  );
}

function ML({ children, color = "var(--acid)", style }: { children: React.ReactNode; color?: string; style?: React.CSSProperties }) {
  return <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color, letterSpacing: "0.22em", textTransform: "uppercase", whiteSpace: "nowrap", ...style }}>{children}</div>;
}

function WolfMark({ size = 28, color = "var(--acid)", style }: { size?: number; color?: string; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "inline-block", flexShrink: 0, verticalAlign: "middle", ...style }} aria-hidden="true">
      <path d="M 30 38 L 36 28 L 40 36 L 50 32 L 60 36 L 64 28 L 70 38 L 70 60 L 60 70 L 40 70 L 30 60 Z" fill={color} />
      <circle cx="44" cy="50" r="2.5" fill="var(--bg)" />
      <circle cx="56" cy="50" r="2.5" fill="var(--bg)" />
    </svg>
  );
}

function WolfLogo({ size = 26 }: { size?: number }) {
  return (
    <a href="/" style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <WolfMark size={size} color="var(--acid)" />
      <span style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: "var(--bone)", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
        The Wolfpack <span style={{ color: "var(--ash)", fontWeight: 400 }}>· QCL</span>
      </span>
    </a>
  );
}

function StarRow({ count = 5, color = "var(--acid)", size = 12 }: { count?: number; color?: string; size?: number }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 14 14" style={{ display: "block" }}>
          <polygon points="7,1 8.85,5.1 13.3,5.5 9.9,8.4 11,12.8 7,10.4 3,12.8 4.1,8.4 0.7,5.5 5.15,5.1" fill={color} />
        </svg>
      ))}
    </div>
  );
}

// ─── WolfStickyBar ────────────────────────────────────────────────────────────

function WolfStickyBar({ joinHref }: { joinHref: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 999,
      background: "rgba(6,7,10,0.88)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderBottom: "1px solid var(--acid)",
      transform: visible ? "translateY(0)" : "translateY(-100%)",
      transition: "transform 260ms ease",
    }}>
      <Wrap style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 48px" }}>
        <WolfLogo size={22} />
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <ML style={{ whiteSpace: "nowrap" }}>
            <span className="pulse" style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "var(--acid)", marginRight: 8 }} />
            · Krypton + Alerts · $297 · One Payment ·
          </ML>
          <a href={joinHref} className="btn" style={{ padding: "10px 20px", fontSize: 11 }}>Buy Now</a>
        </div>
      </Wrap>
    </div>
  );
}

// ─── DownsellBar ─────────────────────────────────────────────────────────────

function DownsellBar() {
  return (
    <div style={{
      background: "var(--bg-1)",
      borderBottom: "1px solid var(--line)",
      padding: "11px 0",
    }}>
      <Wrap style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="pulse" style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--ash)", flexShrink: 0 }} />
          <ML color="var(--ash)">· You came from the Mentorship application · This is the operator&apos;s self-serve lane ·</ML>
        </div>
        <ML color="var(--acid)">· WOLFPACK · KRYPTON COURSE + WEEKLY ALERTS ·</ML>
      </Wrap>
    </div>
  );
}

// ─── WolfTicker ──────────────────────────────────────────────────────────────

const TICKER_BASE: { color: string; text: string }[] = [
  { color: "var(--acid)", text: "· 7,000+ TRADERS · 63 COUNTRIES ·" },
  { color: "var(--bone)", text: "· 21 YEARS LIVE ·" },
  { color: "var(--acid)", text: "· $20K → $1.7M · 420 DAYS ·" },
  { color: "var(--bone)", text: "· QUANTUM CIPHER REPORT · EVERY MONDAY ·" },
  { color: "#9B5CFF", text: "· COPY · MIRROR · LEARN ·" },
  { color: "var(--acid)", text: "· $1.2M IN 30 DAYS · KRYPTON 2.0 ·" },
  { color: "#FF2DAB", text: "· STAY A SHEEP · GET EATEN BY WOLVES ·" },
  { color: "var(--acid)", text: "· OR BECOME ONE ·" },
];
const TICKER_ITEMS = [...TICKER_BASE, ...TICKER_BASE, ...TICKER_BASE];

function WolfTicker() {
  return (
    <div style={{
      borderTop: "1px solid var(--line)",
      borderBottom: "1px solid var(--line)",
      background: "var(--bg-1)",
      padding: "14px 0",
      overflow: "hidden",
    }}>
      <div style={{
        display: "flex",
        gap: 48,
        whiteSpace: "nowrap",
        animation: "ticker 60s linear infinite",
        width: "max-content",
      }}>
        {TICKER_ITEMS.map((item, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 10, color: item.color }}>
            <WolfMark size={14} color={item.color} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em" }}>{item.text}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── WolfVSL ─────────────────────────────────────────────────────────────────

function WolfVSL({ vimeoId }: { vimeoId: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div
      onClick={() => !playing && setPlaying(true)}
      style={{
        position: "relative",
        aspectRatio: "16/9",
        border: "1px solid var(--acid)",
        boxShadow: "0 0 0 1px var(--acid), 0 8px 64px rgba(191,250,70,0.12)",
        background: "var(--bg-2)",
        cursor: playing ? "default" : "pointer",
        overflow: "hidden",
      }}
    >
      {playing ? (
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1`}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
        />
      ) : (
        <>
          {/* Photo backdrop */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/uploads/cam/at-the-charts.jpg"
            alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center right" }}
          />

          {/* Dark gradient overlay — heavier on left so text stays legible */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(6,7,10,0.82) 0%, rgba(6,7,10,0.55) 50%, rgba(6,7,10,0.30) 100%)" }} />
          {/* Bottom fade for badges */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(6,7,10,0.70) 0%, transparent 40%)" }} />

          {/* Top-left badge */}
          <div style={{ position: "absolute", top: 20, left: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <span className="pulse" style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "var(--acid)" }} />
            <ML>· WOLFPACK · WALKTHROUGH</ML>
          </div>

          {/* Top-right badge */}
          <div style={{ position: "absolute", top: 20, right: 20 }}>
            <ML color="var(--bone)">VIMEO · HD</ML>
          </div>

          {/* Center content */}
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
            <div style={{ width: 110, height: 110, background: "var(--acid)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--bg)">
                <polygon points="6,3 20,12 6,21" />
              </svg>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "var(--bone)", marginBottom: 10 }}>
                Watch How I Read the Market Before It Moves
              </div>
              <ML color="var(--ash)">· SOUND ON · FULL SCREEN ·</ML>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── ReceiptStrip ─────────────────────────────────────────────────────────────

const RECEIPT_STATS = [
  { v: "7,000+", k: "Traders in the pack", color: "var(--acid)" },
  { v: "63", k: "Countries represented", color: "var(--bone)" },
  { v: "21 yrs", k: "Live on the screens", color: "var(--acid)" },
  { v: "4.95★", k: "Across 135 Whop reviews", color: "var(--acid)" },
];

function ReceiptStrip() {
  return (
    <div style={{
      borderTop: "1px solid var(--line)",
      borderBottom: "1px solid var(--line)",
      background: "var(--bg-1)",
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
    }}>
      {RECEIPT_STATS.map((s, i) => (
        <div key={i} style={{
          padding: "36px 28px",
          borderLeft: i > 0 ? "1px solid var(--line)" : "none",
        }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 52, fontWeight: 600, color: s.color, lineHeight: 1, marginBottom: 8 }}>{s.v}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ash)", letterSpacing: "0.18em", textTransform: "uppercase" }}>{s.k}</div>
        </div>
      ))}
    </div>
  );
}

// ─── KryptonCase ─────────────────────────────────────────────────────────────

interface KryptonCaseProps {
  tag: string;
  big: string;
  from: string;
  span: string;
  note: string;
  accent?: string;
}

function KryptonCase({ tag, big, from, span, note, accent = "var(--acid)" }: KryptonCaseProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderTop: `2px solid ${accent}`,
        background: "var(--bg-1)",
        padding: "28px 28px 32px",
        position: "relative",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "transform 180ms ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <ML color={accent}>{tag}</ML>
        <ML color="var(--muted)">{span}</ML>
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 56, fontWeight: 600, color: accent, lineHeight: 1, marginBottom: 6 }}>{big}</div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ash)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 16 }}>{from}</div>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.65, color: "var(--ash)", margin: 0 }}>{note}</p>
    </div>
  );
}

// ─── PackageTile ─────────────────────────────────────────────────────────────

interface PackageTileProps {
  idx: number;
  kicker: string;
  title: string;
  body: string;
  items: string[];
  accent: string;
  wide?: boolean;
}

function PackageTile({ idx, kicker, title, body, items, accent }: PackageTileProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 0,
        background: "var(--bg-1)",
        border: "1px solid var(--line)",
        borderLeft: `3px solid ${accent}`,
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "transform 180ms ease, border-color 180ms ease",
      }}
    >
      {/* Left: number + title */}
      <div style={{ padding: "28px 32px", borderRight: "1px solid var(--line)" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 14 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 32, fontWeight: 700, color: accent, letterSpacing: "-0.02em", lineHeight: 1 }}>
            {String(idx).padStart(2, "0")}
          </span>
          <ML color={accent} style={{ fontSize: 9 }}>{kicker}</ML>
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 600, color: "var(--bone)", lineHeight: 1.1, marginBottom: 10 }}>{title}</div>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.65, color: "var(--ash)", margin: 0 }}>{body}</p>
      </div>
      {/* Right: bullet items */}
      <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 10 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <span style={{ color: accent, fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.6, flexShrink: 0 }}>·</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--bone)", letterSpacing: "0.08em", lineHeight: 1.6 }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── FuruRow ─────────────────────────────────────────────────────────────────

interface FuruRowProps {
  furu: string;
  wolf: string;
}

function FuruRow({ furu, wolf }: FuruRowProps) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 64px 1fr",
      borderTop: "1px solid var(--line)",
    }}>
      <div style={{ padding: "24px 28px", display: "flex", gap: 14, background: "rgba(255,45,171,0.04)" }}>
        <span style={{ color: "var(--pink)", fontFamily: "var(--font-mono)", fontSize: 14, flexShrink: 0, marginTop: 2 }}>✕</span>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.6, color: "var(--ash)", margin: 0 }}>{furu}</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", borderLeft: "1px solid var(--line)", borderRight: "1px solid var(--line)" }}>
        <ML color="var(--muted)">VS</ML>
      </div>
      <div style={{ padding: "24px 28px", display: "flex", gap: 14, background: "rgba(191,250,70,0.04)" }}>
        <span style={{ color: "var(--acid)", fontFamily: "var(--font-mono)", fontSize: 14, flexShrink: 0, marginTop: 2 }}>✓</span>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.6, color: "var(--bone)", margin: 0 }}>{wolf}</p>
      </div>
    </div>
  );
}

// ─── ResultBanner ────────────────────────────────────────────────────────────

interface ResultBannerProps {
  kicker: string;
  big: string;
  sub: string;
  period: string;
  image: string;
  accent?: string;
  flipped?: boolean;
}

function ResultBanner({ kicker, big, sub, period, image, accent = "var(--acid)", flipped }: ResultBannerProps) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: flipped ? "1.1fr 1fr" : "1fr 1.1fr",
      borderTop: "1px solid var(--line)",
    }}>
      {flipped ? (
        <>
          <div style={{ padding: "44px 48px", borderRight: `2px solid ${accent}` }}>
            <ML color={accent} style={{ marginBottom: 20 }}>{kicker}</ML>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 132, fontWeight: 600, color: accent, lineHeight: 0.9, marginBottom: 20, textShadow: `0 0 60px ${accent}55` }}>{big}</div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 18, lineHeight: 1.6, color: "var(--ash)", margin: "0 0 16px" }}>{sub}</p>
            <ML color="var(--muted)">{period}</ML>
          </div>
          <div style={{ position: "relative", aspectRatio: "5/3", background: "var(--bg-2)" }} className="grid-bg">
            <div style={{ position: "absolute", top: 12, left: 12 }}>
              <ML color="var(--muted)">· VERIFIED P&L</ML>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt={kicker} style={{ position: "absolute", inset: 22, width: "calc(100% - 44px)", height: "calc(100% - 44px)", objectFit: "contain" }} />
          </div>
        </>
      ) : (
        <>
          <div style={{ position: "relative", aspectRatio: "5/3", background: "var(--bg-2)" }} className="grid-bg">
            <div style={{ position: "absolute", top: 12, left: 12 }}>
              <ML color="var(--muted)">· VERIFIED P&L</ML>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt={kicker} style={{ position: "absolute", inset: 22, width: "calc(100% - 44px)", height: "calc(100% - 44px)", objectFit: "contain" }} />
          </div>
          <div style={{ padding: "44px 48px", borderLeft: `2px solid ${accent}` }}>
            <ML color={accent} style={{ marginBottom: 20 }}>{kicker}</ML>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 132, fontWeight: 600, color: accent, lineHeight: 0.9, marginBottom: 20, textShadow: `0 0 60px ${accent}55` }}>{big}</div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 18, lineHeight: 1.6, color: "var(--ash)", margin: "0 0 16px" }}>{sub}</p>
            <ML color="var(--muted)">{period}</ML>
          </div>
        </>
      )}
    </div>
  );
}

// ─── TopCallTile ─────────────────────────────────────────────────────────────

interface TopCallTileProps {
  src: string;
  ticker: string;
  amount: string;
  note: string;
  accent?: string;
}

function TopCallTile({ src, ticker, amount, note, accent = "var(--acid)" }: TopCallTileProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `1px solid ${hovered ? accent : "var(--line)"}`,
        background: "var(--bg-1)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "transform 180ms ease, border-color 180ms ease",
      }}
    >
      <div style={{ position: "relative", aspectRatio: "4/3", background: "var(--bg-2)" }} className="grid-bg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={ticker} style={{ position: "absolute", inset: 12, width: "calc(100% - 24px)", height: "calc(100% - 24px)", objectFit: "contain" }} />
        <div style={{ position: "absolute", top: 8, left: 8 }}>
          <ML color="var(--muted)">{ticker}</ML>
        </div>
        <div style={{ position: "absolute", bottom: 8, right: 8, background: accent, padding: "4px 8px" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--bg)", letterSpacing: "0.12em" }}>{amount}</span>
        </div>
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", letterSpacing: "0.16em" }}>{note}</div>
      </div>
    </div>
  );
}

// ─── WolfWinTile ─────────────────────────────────────────────────────────────

interface WolfWinTileProps {
  src: string;
  handle: string;
  caption: string;
  dollars: string;
  platform: string;
  accent?: string;
}

function WolfWinTile({ src, handle, caption, dollars, platform, accent = "var(--acid)" }: WolfWinTileProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `1px solid ${hovered ? accent : "var(--line)"}`,
        background: "var(--bg-1)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "transform 180ms ease, border-color 180ms ease",
      }}
    >
      <div style={{ position: "relative", aspectRatio: "16/10", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={handle} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", top: 8, left: 8 }}>
          <ML color={accent}>· REAL · {platform.toUpperCase()}</ML>
        </div>
        <div style={{ position: "absolute", bottom: 8, right: 8, background: accent, padding: "4px 8px" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--bg)", letterSpacing: "0.12em" }}>{dollars}</span>
        </div>
      </div>
      <div style={{ padding: "16px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, color: "var(--bone)" }}>{handle}</span>
          <ML color="var(--muted)">{platform}</ML>
        </div>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, lineHeight: 1.6, color: "var(--ash)", margin: 0 }}>{caption}</p>
      </div>
    </div>
  );
}

// ─── TradeRow ─────────────────────────────────────────────────────────────────

interface Callout {
  v: string;
  k: string;
}

interface TradeRowProps {
  kicker: string;
  title: React.ReactNode;
  body: string;
  img: string;
  callouts: Callout[];
  accent: string;
  flip?: boolean;
  ratio?: string;
}

function TradeRow({ kicker, title, body, img, callouts, accent, flip, ratio = "4/5" }: TradeRowProps) {
  const imageBlock = (
    <div style={{ position: "relative", aspectRatio: ratio, background: "var(--bg-2)" }} className="grid-bg">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img} alt={kicker} style={{ position: "absolute", inset: 18, width: "calc(100% - 36px)", height: "calc(100% - 36px)", objectFit: "contain" }} />
      <div style={{ position: "absolute", top: 12, left: 12 }}>
        <ML color="var(--muted)">· VERIFIED · PHEMEX</ML>
      </div>
    </div>
  );

  const textBlock = (
    <div style={{ padding: "52px 56px" }}>
      <ML color={accent} style={{ marginBottom: 20 }}>{kicker}</ML>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 56, fontWeight: 600, color: "var(--bone)", lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: 20 }}>{title}</div>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 17, lineHeight: 1.65, color: "var(--ash)", margin: "0 0 28px" }}>{body}</p>
      <div style={{ borderTop: "1px solid var(--line)", paddingTop: 24, display: "grid", gridTemplateColumns: `repeat(${callouts.length}, 1fr)`, gap: 20 }}>
        {callouts.map((c, i) => (
          <div key={i}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 600, color: accent, marginBottom: 4 }}>{c.v}</div>
            <ML color="var(--muted)">{c.k}</ML>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: flip ? "1.1fr 0.9fr" : "0.9fr 1.1fr",
      borderTop: `2px solid ${accent}`,
    }}>
      {flip ? (
        <>
          {textBlock}
          {imageBlock}
        </>
      ) : (
        <>
          {imageBlock}
          {textBlock}
        </>
      )}
    </div>
  );
}

// ─── VideoTestimonialCard ─────────────────────────────────────────────────────

interface VideoTestimonialCardProps {
  videoId: string;
  headline: string;
  body: string;
}

function VideoTestimonialCard({ videoId, headline, body }: VideoTestimonialCardProps) {
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `1px solid ${hovered ? "var(--acid)" : "var(--line)"}`,
        background: "var(--bg-1)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "transform 180ms ease, border-color 180ms ease",
      }}
    >
      <div
        onClick={() => !loaded && setLoaded(true)}
        style={{ position: "relative", aspectRatio: "16/9", cursor: loaded ? "default" : "pointer", overflow: "hidden", background: "var(--bg-2)" }}
      >
        {loaded ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
          />
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
              alt={headline}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(6,7,10,0.7) 0%, transparent 50%)" }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 64, height: 64, background: "var(--acid)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--bg)">
                  <polygon points="6,3 20,12 6,21" />
                </svg>
              </div>
            </div>
            <div style={{ position: "absolute", top: 8, left: 8 }}>
              <ML>· LIVE · TESTIMONIAL</ML>
            </div>
            <div style={{ position: "absolute", bottom: 8, right: 8 }}>
              <ML color="var(--bone)">YOUTUBE</ML>
            </div>
          </>
        )}
      </div>
      <div style={{ padding: "16px 18px" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: "var(--bone)", marginBottom: 6, lineHeight: 1.3 }}>{headline}</div>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, lineHeight: 1.6, color: "var(--ash)", margin: 0 }}>{body}</p>
      </div>
    </div>
  );
}

// ─── ReviewCard ──────────────────────────────────────────────────────────────

interface ReviewCardProps {
  name: string;
  quote: string;
  date: string;
}

function ReviewCard({ name, quote, date }: ReviewCardProps) {
  const [hovered, setHovered] = useState(false);
  const colorIndex = name.charCodeAt(0) % 3;
  const avatarColor = colorIndex === 0 ? "var(--acid)" : colorIndex === 1 ? "var(--pink)" : "#6FE9FF";
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `1px solid ${hovered ? "var(--acid)" : "var(--line)"}`,
        background: "var(--bg-1)",
        padding: "20px",
        marginBottom: 14,
        breakInside: "avoid",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "transform 180ms ease, border-color 180ms ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <StarRow count={5} color="var(--acid)" size={12} />
        <ML color="var(--muted)">VERIFIED · WHOP</ML>
      </div>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.65, color: "var(--bone)", margin: "0 0 16px" }}>&ldquo;{quote}&rdquo;</p>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          border: `1.5px solid ${avatarColor}`,
          background: "var(--bg-2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: avatarColor,
          flexShrink: 0,
        }}>{initials}</div>
        <div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "var(--bone)" }}>{name}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", letterSpacing: "0.14em" }}>{date}</div>
        </div>
      </div>
    </div>
  );
}

// ─── RatingHeader ────────────────────────────────────────────────────────────

function RatingHeader() {
  return (
    <div style={{ marginBottom: 56 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 48, alignItems: "start" }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 88, fontWeight: 600, color: "var(--acid)", lineHeight: 1, marginBottom: 12 }}>4.95 <span style={{ fontSize: 40, color: "var(--ash)" }}>/ 5.00</span></div>
          <div style={{ marginBottom: 20 }}><StarRow count={5} color="var(--acid)" size={16} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, auto)", gap: "12px 32px", justifyContent: "start" }}>
            <ML color="var(--ash)">135 reviews</ML>
            <ML color="var(--ash)">100% 5-star</ML>
            <ML color="var(--ash)">Whop platform</ML>
          </div>
        </div>
        <a href={JOIN_URL} className="btn btn-lg">Join Them →</a>
      </div>
    </div>
  );
}

// ─── Reviews Data ─────────────────────────────────────────────────────────────

const REVIEWS = [
  { name: "Nikolay Stoev", date: "Oct 2024 · 1 month after purchase", quote: "As a member of his groups since 2021, I'm giving him a rate 10 out of 10! He's dominating every market — Crypto, Forex, Futures, CFDs, you name it. The only LEGIT trader I've stumbled across in this world of scammers." },
  { name: "Ronny Roehrig", date: "Dec 2024 · 2 months after purchase", quote: "Cameron is a fin genius. If you don't make money here, you will not make it anywhere. His trading strategies and his results are unique. If you want to make 'wife-changing money,' this is definitively the fastest way." },
  { name: "Renars Bzezinskis", date: "Nov 2024 · 4 days after purchase", quote: "This is the only person you need to follow or learn from to learn trading and not make mistakes like the rest of the 99% of the market." },
  { name: "Mario Fanto", date: "Oct 2024 · 21 days after purchase", quote: "The best decision I've ever made. You'll learn the best trading strategies and earn a lot of money at the same time. And with the Quantum Cipher Report you are prepared for the whole week and know what to do. Simply brilliant." },
  { name: "ShaunNZ", date: "Oct 2024 · 1 month after purchase", quote: "Look no further! This guy is the OG. Have been part of the Discord and now here for a while — best decision I've made in this space. Super engaging, unbeatable alpha, and top customer service. Money to be made $$$" },
  { name: "George G.", date: "Dec 2024 · 1 month after purchase", quote: "Number one pack, imo. 10 out of 10. Lots of the most useful info you may find. Sometimes I think he has some kind of inside info, but nope — it's just an undeniable skill. Keep running, man." },
  { name: "supremeshot00", date: "Feb 2025 · 2 days after purchase", quote: "I have been following Cameron for 5 years. Great leader, good principles, and he respects the art of trading. Everything you've said has checked out — and I've changed my life because of this." },
  { name: "Filip Rodeš", date: "Dec 2024 · 8 days after purchase", quote: "It seems like he has a magic ball to predict the future, haha. I swear he gets at least 7 out of 10 trades right. Highly recommend." },
  { name: "NvrPullOut", date: "Nov 2024 · 4 days after purchase", quote: "Cameron Fous is the best at teaching technical analysis and keeping you informed every step of the way. I've followed him for years on YouTube — I wish I had joined his course sooner. He is the real deal. Hands down 10 out of 10." },
  { name: "Shay McCusker", date: "Jan 2025 · 14 days after purchase", quote: "THE place to go for trading education. All the info you need and nothing you don't. Doesn't hold back with info other traders would never share. 10 stars out of 5." },
  { name: "Kalaveti Mekemeke", date: "Nov 2024 · 16 days after purchase", quote: "Just joined last week. Subscribed to his strategy and the Quantum Cipher Report, plus the learning videos — it's been a game-changer. 10/10 compared to other sites I've tried before." },
  { name: "Andre Freire", date: "Dec 2024 · 1 month after purchase", quote: "Best trading program. Clean analysis, simplistic, and straightforward. Fantastic insights, great community. If you are considering entering crypto or trading in general, I highly recommend signing up." },
  { name: "djordje radulovic", date: "Dec 2024 · 12 days after purchase", quote: "Cameron's approach to trading and his approach to teaching is second to none. Such a straightforward dude — tells it how it is, always. Transparent about everything. Not some bullshit influencer posting Lambo bullshit and multi-zillion trades." },
  { name: "Jack Deth", date: "Dec 2024 · 3 months after purchase", quote: "Excellent course, well worth the price — and a lot more if you're willing to put in the time and effort. The QCR and the glimpse into Cameron's process alone makes this an easy investment. NOTE: this is not a trade-alert group. It's a professional sharing his system." },
  { name: "Simeon Rückert", date: "Dec 2024 · 1 month after purchase", quote: "The best overall package in the industry. For everyone who wants to start trading or further internalize the fundamentals. Fous has a simple but very effective trading style. The QCR is the real gold." },
  { name: "Mauricio Bento", date: "Dec 2024 · 13 days after purchase", quote: "I've been following his YouTube channel for a long time, and finally decided to join the Wolfpack. I love the courses and the analysis. Cameron rocks. I really enjoy how he's straightforward and far from a used-car salesman." },
  { name: "gary mills", date: "Nov 2024 · 17 days after purchase", quote: "Fantastic course and very informative. Best decision I've made since buying crypto. Should have joined years ago. Great community with loads of advice. Cameron has a no-BS approach — tells you how it is. Best guy in my opinion on YouTube." },
  { name: "HF", date: "Oct 2024 · 15 days after purchase", quote: "Quantum Cipher Report + video gives you clear buy and sell points for crypto, forex, and futures — so you don't have to guess. Super easy to follow. The Krypton Legacy Course is a huge bonus. 30+ hours of trading education." },
  { name: "Assadour Zomjian", date: "Dec 2024 · 24 days after purchase", quote: "Fous doesn't fool you around. One of the best crypto and forex channels ever. Great community, strong signals, even trading courses — all in one subscription." },
  { name: "Mykola Hnatyuk", date: "Dec 2024 · 2 months after purchase", quote: "Best one out there. Cameron's Krypton course is great — boosted my knowledge and confidence. The community is great as well, affordable price. Would definitely recommend." },
  { name: "J Mitch TX", date: "Dec 2025 · 6 days after purchase", quote: "If you take all classes and do not double your investment, I will pay you myself for your entrance. No one is perfect — however the weekly win ratio is outstanding. It's better to try and succeed than not try." },
  { name: "Branwill Storm", date: "Feb 2026 · 1 year after purchase", quote: "Crazy knowledge and value. This guy can flip your whole life around in all areas." },
  { name: "Gábor Földesi", date: "Oct 2024 · 1 month after purchase", quote: "This guy is LEGIT. You can learn a lot from his Krypton Legacy Course. You can also check, copy, and study his trades. All the things I searched for." },
  { name: "Crypto85", date: "Mar 2025 · 5 months after purchase", quote: "Great trader, great content. He is very active and helps his community. Very happy to be part of it. His trades are very accurate and easy to follow. Highly recommend." },
];

// ─── Video Testimonials Data ──────────────────────────────────────────────────

const VIDEO_TESTIMONIALS = [
  { videoId: "dUIipa1vxAs", headline: "I'm Up $3 Million Following Cam Since 2013", body: "Federal government insider reveals over a decade of profits trading Cam's methods." },
  { videoId: "kLxd_D9J7so", headline: "I Almost Tripled My Money In 7 Days", body: "Joined the Wolfpack one week ago. Walked out with nearly 3x his bag." },
  { videoId: "BLWlP9AjnEU", headline: "Wolfpack Gains Paid For My Trip To Tokyo", body: "Was losing before finding Cam — now funding international trips from Wolfpack profits." },
  { videoId: "EGzswQffvVE", headline: "Paid For Itself 10x Over — Just Bought A New Boat", body: "Long-time crypto holder who switched to active trading with Cam and never looked back." },
  { videoId: "PsFXUIHN1d0", headline: "Doubled My Trading Bag In The First 30 Days", body: "Signed up, doubled his account in a month, done." },
  { videoId: "7n3fCXL8Mjc", headline: "67% Win Rate After Just 2 Months", body: "Two months later: 67% win rate. No BS, no hand-holding." },
  { videoId: "wyj2ZsyWh8k", headline: "19 Years Old — Made $500 In My First Week", body: "Young trader, $500 profit in 7 days. By far the best crypto community." },
  { videoId: "EhY-AlMdbjk", headline: "13 Months Ago, Cam Changed My Life", body: "4-year Cam follower who finally joined the Wolfpack 13 months ago." },
  { videoId: "97eZEmI8qGY", headline: "Busy Dad, 2 Kids — Still Crushing Trades", body: "Full-time entrepreneur with two kids and zero free time." },
  { videoId: "V6C8JFw7ORw", headline: "All The Way From Africa — Growing My Capital With Cam", body: "Global member crushing it from Africa." },
  { videoId: "Xa56tineH0A", headline: "Owned Cam's Courses For Years — Just Rejoined", body: "Multi-year Krypton student who just rejoined the Wolfpack." },
  { videoId: "WYI-CU3PZfs", headline: "+10% On My Account In My First Month As A Beginner", body: "Started trading one month ago. Grew her account 10% as a complete beginner." },
  { videoId: "OD5uCL96EsQ", headline: "7 Months In And I'll Stay Forever", body: "Plans to renew year after year — the community is that good." },
  { videoId: "J1KuhYlTzy0", headline: "Multiple Discords — Cam Is The Only Real One", body: "Veteran crypto trader who's been burned by every fake guru." },
  { videoId: "OqhncwmHVhc", headline: "One Alert Paid For Months Of My Subscription", body: "Just one Wolfpack alert covered multiple months of membership." },
  { videoId: "KdqrqQb5VHg", headline: "Cam Will Double, Triple, Or More Your Portfolio", body: "Nobody else in crypto is this honest about wins AND losses." },
  { videoId: "NxdqQCEO2rc", headline: "Best Investment I've Ever Made In My Life", body: "Three-point breakdown: crypto signals, 30+ hours of training, brilliant community." },
  { videoId: "WDqtoIOIx8M", headline: "3 Years Trading Crypto — Should've Joined Cam Sooner", body: "Brazilian trader, 3 years in markets." },
  { videoId: "fL1F49uN6Jc", headline: "Following Cam Since 2019 — He Teaches You To Fish", body: "Used to follow YouTube shills and lose money. Found Cam in 2019." },
  { videoId: "iQOEVY3iEUQ", headline: "Blew Up My Bag Multiple Times — Then I Found Cam", body: "Multiple blowups. Cam's training turned everything around." },
];

// ─── Page Sections ────────────────────────────────────────────────────────────

function Hero() {
  return (
    <div
      className="grid-bg"
      style={{
        position: "relative",
        padding: "20px 0 88px",
        borderBottom: "1px solid var(--line)",
        overflow: "hidden",
      }}
    >
      {/* Acid radial gradient wash */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse 60% 50% at 50% -10%, rgba(191,250,70,0.10) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      {/* Watermark */}
      <WolfMark
        size={620}
        color="var(--acid)"
        style={{ position: "absolute", right: -120, top: 80, opacity: 0.05, pointerEvents: "none" }}
      />

      <Wrap>
        {/* Nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingTop: 16 }}>
          <WolfLogo />
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <a href="#package" style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--ash)", letterSpacing: "0.2em", textTransform: "uppercase" }}>Package</a>
            <a href="#results" style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--ash)", letterSpacing: "0.2em", textTransform: "uppercase" }}>Results</a>
            <a href="#reviews" style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--ash)", letterSpacing: "0.2em", textTransform: "uppercase" }}>Reviews</a>
            <a href={JOIN_URL} className="btn">Buy Now</a>
          </div>
        </div>

        {/* Headline block */}
        <div style={{ maxWidth: 980, margin: "0 auto", textAlign: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 10 }}>
            <span className="pulse" style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "var(--acid)" }} />
            <ML>You qualified for the Wolfpack</ML>
          </div>
          <div style={{ marginBottom: 14 }}>
            <ML color="var(--ash)">Best crypto trading program on Whop</ML>
          </div>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: 60,
            lineHeight: 0.97,
            letterSpacing: "-0.04em",
            color: "var(--bone)",
            margin: "0 0 16px",
          }}>
            Finally, see into the market<br />
            <em style={{ color: "var(--acid)" }}>like the matrix</em><br />
            <em>with Fous at the helm.</em>
          </h1>
        </div>

        {/* CTA row — above the fold */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 18 }}>
          <a href={JOIN_URL} className="btn btn-lg">Buy Now · $297 →</a>
          <a href="#package" className="btn btn-ghost btn-lg">See What&apos;s Inside ↓</a>
        </div>

        {/* VSL — fits above fold at 1440×900 */}
        <div style={{ maxWidth: 800, margin: "0 auto 48px" }}>
          <WolfVSL vimeoId="1090298635" />
        </div>

        {/* Pitch text */}
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: 19,
          lineHeight: 1.7,
          color: "var(--ash)",
          textAlign: "center",
          maxWidth: 820,
          margin: "0 auto 48px",
          fontWeight: 400,
        }}>
          I&apos;ll tell you exactly where the market is going — the entries, the exits, the level at which I stop out — and you can copy it, study it, or just let it run. No guessing. No noise. One system, repeated every week, for 21 years.
        </p>

        {/* 4-col mini badges */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 1,
          maxWidth: 820,
          margin: "0 auto",
          background: "var(--line)",
          border: "1px solid var(--line)",
        }}>
          {[
            { k: "ONE PAYMENT", v: "$297" },
            { k: "INCLUDED", v: "Krypton + QCR" },
            { k: "DELIVERY", v: "Instant · Whop" },
            { k: "GUARANTEE", v: "Receipts on file" },
          ].map((b, i) => (
            <div key={i} style={{ background: "var(--bg-1)", padding: "18px 16px", textAlign: "center" }}>
              <ML color="var(--muted)" style={{ marginBottom: 6, whiteSpace: "normal" }}>{b.k}</ML>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, color: "var(--bone)" }}>{b.v}</div>
            </div>
          ))}
        </div>
      </Wrap>
    </div>
  );
}

function Receipts() {
  return <ReceiptStrip />;
}

function MatrixBand() {
  return (
    <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden", borderBottom: "1px solid var(--line)" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/uploads/cam/at-the-charts.jpg"
        alt="At the charts"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(6,7,10,0.92) 0%, rgba(6,7,10,0.55) 50%, transparent 100%)" }} />
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, display: "flex", alignItems: "center" }}>
        <Wrap style={{ padding: "0 48px" }}>
          <div style={{ maxWidth: 620 }}>
            <ML style={{ marginBottom: 24 }}>· Set · Forget · Let it play out ·</ML>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 84, lineHeight: 0.98, letterSpacing: "-0.04em", color: "var(--bone)", margin: "0 0 24px" }}>
              Stop chasing alerts.<br />
              <em className="glow-acid" style={{ color: "var(--acid)" }}>Place the trap. Walk away.</em>
            </h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 18, lineHeight: 1.65, color: "var(--ash)", margin: 0, maxWidth: 520 }}>
              Pre-positioned before the move, orders bracketed on Sunday, then off the screens. The plan runs itself while you live.
            </p>
          </div>
        </Wrap>
      </div>
    </div>
  );
}

function KryptonCaseGrid() {
  return (
    <Section py={140}>
      <H
        num="02"
        label="Krypton · Case studies"
        title="Real money. Real screenshots. Real trades."
        sub="Four documented case studies from the Krypton playbook — each one a different cycle, a different market, the same system."
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--line)" }}>
        <KryptonCase
          tag="Case · 01"
          big="$1.75M"
          from="Up from $20K · 100×"
          span="420 days"
          note="The 100× crypto strategy documented from start to finish. One account, one system, four hundred and twenty days of execution."
          accent="var(--acid)"
        />
        <KryptonCase
          tag="Case · 02"
          big="$1.2M"
          from="30-day swing window"
          span="Krypton 2.0"
          note="The exact playbook used through the November 2024 cycle — entries, scale-outs, and the final close. All on screen."
          accent="var(--acid)"
        />
        <KryptonCase
          tag="Case · 03"
          big="$302K"
          from="Single XRP cycle"
          span="Day in the life"
          note="Filmed on the road with a 7-figure trader. One position. One chart. One decision. Done from a phone at Mt. Fuji."
          accent="var(--acid)"
        />
        <KryptonCase
          tag="Case · 04"
          big="+176%"
          from="Inside 7 minutes"
          span="The premise"
          note="The one-sit walkthrough that breaks down WHY this works — the market structure, the cycle logic, the edge."
          accent="var(--acid)"
        />
      </div>
    </Section>
  );
}

function Results() {
  return (
    <Section id="results" py={140}>
      <H
        num="03"
        label="Verified results"
        title="Documented. Timestamped. On the record."
        sub="Three of the most notable documented results from the Krypton framework — each with a verifiable P&L."
      />
      <div style={{ border: "1px solid var(--line)", marginBottom: 1 }}>
        <ResultBanner
          kicker="Krypton 2.0 · 30 Days"
          big="$1.2M"
          sub="Profit in a single 30-day swing window through the November 2024 cycle. Pre-positioned before the move, held through the breakout, closed at structure."
          period="November 2024 · 30-day window"
          image="/uploads/cam/nov-2024-01.jpg"
          accent="var(--acid)"
        />
        <ResultBanner
          kicker="From $20K · Last Bull Run"
          big="$1.7M"
          sub="420 days. The framework times entries across cycle phases — accumulation, expansion, distribution — and sizes accordingly."
          period="2020–2021 · 420 days"
          image="/uploads/cam/2020-bull-1-7m.jpg"
          accent="var(--acid)"
          flipped
        />
        <ResultBanner
          kicker="Quantum Cipher Report · Monday Drop"
          big="QCR"
          sub="The framework that helps you enter the week with a complete plan — majors, alts, forex pairs, all bracketed before Sunday is out."
          period="Every Monday morning"
          image="/uploads/cam/qcreport.jpg"
          accent="#9B5CFF"
        />
      </div>
      {/* Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", background: "var(--bg-1)", padding: "20px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="pulse" style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "var(--acid)" }} />
          <ML>Krypton Course + Weekly Trade Alerts · $297 one-time</ML>
        </div>
        <a href={JOIN_URL} className="btn">Buy Now</a>
      </div>
    </Section>
  );
}

function TopCallStory() {
  return (
    <Section py={140}>
      <div style={{ marginBottom: 40 }}>
        <ML color="var(--pink)" style={{ marginBottom: 24 }}>· October 9, 2025 · short side · public alert ·</ML>
        <h2 style={{
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: 84,
          lineHeight: 0.98,
          letterSpacing: "-0.04em",
          color: "var(--bone)",
          margin: "0 0 24px",
          maxWidth: 1100,
        }}>
          Called the 2025 bull-market top.<br />
          <em style={{ color: "var(--acid)" }}>$237K banked in a single day on the biggest crypto liquidation event on record.</em>
        </h2>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 19, lineHeight: 1.65, color: "var(--ash)", margin: 0, maxWidth: 820 }}>
          The alert went out publicly before the move. Six shorts. One day. Every position documented with entry and close.
        </p>
      </div>

      {/* Alert image */}
      <div style={{ position: "relative", aspectRatio: "16/9", background: "var(--bg-2)", marginBottom: 36, border: "1px solid var(--line)" }} className="grid-bg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/uploads/cam/btc-2025-top-01.jpg" alt="BTC 2025 Top Call" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", top: 16, left: 16 }}>
          <ML color="var(--pink)">· THE PUBLIC ALERT</ML>
        </div>
      </div>

      {/* 3-col receipts grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "var(--line)", marginBottom: 36 }}>
        <TopCallTile src="/uploads/top-call/btc-2.jpg" ticker="BTC short" amount="+$54,176" note="Open 122,823 · Close 115,981" />
        <TopCallTile src="/uploads/top-call/eth.jpg" ticker="ETH short" amount="+$67,902" note="Open 4,674 · Close 3,994" />
        <TopCallTile src="/uploads/top-call/sui.jpg" ticker="SUI short" amount="+$63,326" note="Open 3.50 · Close 2.87" />
        <TopCallTile src="/uploads/top-call/spx.jpg" ticker="SPX short" amount="+$34,160" note="Open 1.51 · Close 1.19" />
        <TopCallTile src="/uploads/top-call/deep.jpg" ticker="DEEP short" amount="+$9,671" note="Open 0.14 · Close 0.10" />
        <TopCallTile src="/uploads/top-call/btc-1.jpg" ticker="BTC short" amount="+$8,547" note="Open 124,978 · Close 123,261" />
      </div>

      {/* Day total banner */}
      <div style={{ display: "grid", gridTemplateColumns: "auto 1px 1fr", gap: 0, border: "1px solid var(--line)", background: "var(--bg-1)" }}>
        <div style={{ padding: "36px 48px 36px 36px" }}>
          <ML color="var(--muted)" style={{ marginBottom: 12 }}>DAY TOTAL</ML>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 88, fontWeight: 600, color: "var(--acid)", lineHeight: 1 }}>$237K+</div>
        </div>
        <div style={{ background: "var(--line)" }} />
        <div style={{ padding: "36px 48px", display: "flex", alignItems: "center" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 600, color: "var(--pink)", lineHeight: 1.1, margin: 0 }}>
            Biggest crypto liquidation event<br />on record.
          </h3>
        </div>
      </div>
    </Section>
  );
}

function BankedTrades() {
  return (
    <Section py={140}>
      <H
        num="05"
        label="Banked trades · case studies"
        title="Inside the trades."
        sub="Two documented positions from the Krypton playbook — entered, managed, and closed on screen."
      />
      <div style={{ border: "1px solid var(--line)" }}>
        <TradeRow
          kicker="XRP · Phemex · Cross 10×"
          title={<><em style={{ color: "var(--acid)" }}>$302K</em> single trade — while golfing at Mt. Fuji.</>}
          img="/uploads/cam/xrp-302k-01.jpg"
          body="One position. Entered $2.65, closed $3.47. The whole thing ran while I was off the screens. That's the point of the system."
          callouts={[{ v: "$302K", k: "Realized profit" }, { v: "+31%", k: "Price move" }, { v: "10×", k: "Cross leverage" }]}
          accent="var(--acid)"
        />
        <TradeRow
          kicker="AVAX · Phemex · Cross 10×"
          title={<><em style={{ color: "var(--acid)" }}>$210K</em> on AVAX — pre-positioned, walked.</>}
          img="/uploads/cam/avax-210k-scene.jpg"
          body="Long entry $25.41. Closed $29.30. Position set Sunday. Closed mid-week. Zero screen time during the move."
          callouts={[{ v: "$210K", k: "Realized profit" }, { v: "+15.3%", k: "Price move" }, { v: "10×", k: "Cross leverage" }]}
          accent="var(--acid)"
          flip
        />
      </div>
    </Section>
  );
}

function Lifestyle() {
  const LIFESTYLE_TILES = [
    { src: "/uploads/lifestyle/porsche-walk-back.jpg", tag: "The Porsche", line: "911 Targa GTS · paid in cash" },
    { src: "/uploads/lifestyle/bentley-wide.jpg", tag: "The Bentley", line: "Bentayga · family rig" },
    { src: "/uploads/lifestyle/deck-trading.jpg", tag: "Sunset deck", line: "Sunday plan · paradise office" },
    { src: "/uploads/lifestyle/alpine-1.jpg", tag: "French Alps", line: "Trip planned a week ago" },
  ];

  return (
    <>
      {/* Cinematic Porsche divider */}
      <div style={{ position: "relative", aspectRatio: "21/9", overflow: "hidden", borderBottom: "1px solid var(--line)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/uploads/lifestyle/porsche-side-tall.jpg" alt="Porsche 911 Targa GTS" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to left, rgba(6,7,10,0.0) 0%, rgba(6,7,10,0.7) 100%)" }} />
        <div style={{ position: "absolute", right: 72, top: 0, bottom: 0, display: "flex", alignItems: "center", maxWidth: 560 }}>
          <div style={{ textAlign: "right" }}>
            <ML style={{ marginBottom: 20 }}>· Closed out the top call · Same week ·</ML>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 76, fontWeight: 600, lineHeight: 0.98, letterSpacing: "-0.04em", color: "var(--bone)", margin: "0 0 20px" }}>
              Picked up in cash.<br />
              <em className="glow-acid" style={{ color: "var(--acid)" }}>End of cycle.</em>
            </h2>
            <ML color="var(--ash)">· Porsche 911 Targa GTS · Bought outright · Profit-paid ·</ML>
          </div>
        </div>
      </div>

      {/* Lifestyle grid */}
      <Section py={120}>
        <ML style={{ marginBottom: 20 }}>What the work funds</ML>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 60, fontWeight: 600, lineHeight: 1.05, letterSpacing: "-0.03em", color: "var(--bone)", margin: "0 0 48px" }}>
          Plan once a week. <em style={{ color: "var(--acid)" }}>Live everywhere else.</em>
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--line)" }}>
          {LIFESTYLE_TILES.map((tile, i) => {
            const [hovered, setHovered] = useState(false);
            return (
              <div
                key={i}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{
                  background: "var(--bg-1)",
                  border: `1px solid ${hovered ? "var(--acid)" : "var(--line)"}`,
                  position: "relative",
                  aspectRatio: "4/5",
                  overflow: "hidden",
                  transform: hovered ? "translateY(-3px)" : "translateY(0)",
                  transition: "transform 180ms ease, border-color 180ms ease",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={tile.src} alt={tile.tag} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(6,7,10,0.85) 0%, transparent 60%)" }} />
                <div style={{ position: "absolute", bottom: 20, left: 20 }}>
                  <ML color="var(--acid)" style={{ marginBottom: 6 }}>{tile.tag}</ML>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: "var(--bone)" }}>{tile.line}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>
    </>
  );
}

// ─── RickRossSpotlight ────────────────────────────────────────────────────────

const RR_SLIDES = [
  { src: "/uploads/proof/rr-07.jpg", date: "Jul 11, 2025", amount: "+$1.59M", note: "One month into studying with Cameron" },
  { src: "/uploads/proof/rr-05.jpg", date: "Aug 03, 2025", amount: "+$201K", note: "UNI short · single trade" },
  { src: "/uploads/proof/rr-06.jpg", date: "Aug 03, 2025", amount: "Mindset", note: "\"Losing money in the markets is a choice.\"" },
  { src: "/uploads/proof/rr-04.jpg", date: "Aug 09, 2025", amount: "+$61K", note: "INJ long · 4-day swing" },
  { src: "/uploads/proof/rr-03.jpg", date: "Aug 17, 2025", amount: "+$1.8M", note: "Mid-May → August total" },
  { src: "/uploads/proof/rr-02.jpg", date: "Oct 14, 2025", amount: "+$2.92M", note: "$50K start · one month in" },
  { src: "/uploads/proof/rr-01.jpg", date: "Oct 15, 2025", amount: "+$3.16M", note: "All-time P&L · five months in" },
];

function RickRossSpotlight() {
  const [current, setCurrent] = useState(6);
  const [key, setKey] = useState(0);

  const go = (dir: number) => {
    setCurrent((c) => (c + dir + RR_SLIDES.length) % RR_SLIDES.length);
    setKey((k) => k + 1);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const slide = RR_SLIDES[current];

  return (
    <div style={{ background: "var(--bg-1)", border: "1px solid var(--acid)", margin: "0 0 0 0" }}>
      <Wrap style={{ padding: "0 48px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", minHeight: 560 }}>
          {/* Left */}
          <div style={{ padding: "48px 48px 48px 0", borderRight: "1px solid var(--line)", display: "flex", flexDirection: "column" }}>
            {/* Image */}
            <div
              key={key}
              style={{
                position: "relative",
                aspectRatio: "16/10",
                background: "var(--bg-2)",
                overflow: "hidden",
                marginBottom: 20,
                animation: "rrFade 0.35s ease",
              }}
              className="grid-bg"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={slide.src} alt={slide.date} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }} />
              <div style={{ position: "absolute", top: 10, left: 10 }}>
                <ML color="var(--muted)">{slide.date}</ML>
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 600, color: "var(--acid)", lineHeight: 1 }}>{slide.amount}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ash)", letterSpacing: "0.16em", marginTop: 6 }}>{slide.note}</div>
            </div>
            {/* Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: "auto" }}>
              <ML color="var(--muted)">{String(current + 1).padStart(2, "0")}/{String(RR_SLIDES.length).padStart(2, "0")}</ML>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => go(-1)}
                  style={{ width: 40, height: 40, background: "var(--bg-2)", border: "1px solid var(--line)", color: "var(--ash)", fontFamily: "var(--font-mono)", fontSize: 16, cursor: "pointer" }}
                  aria-label="Previous"
                >←</button>
                <button
                  onClick={() => go(1)}
                  style={{ width: 40, height: 40, background: "var(--bg-2)", border: "1px solid var(--line)", color: "var(--ash)", fontFamily: "var(--font-mono)", fontSize: 16, cursor: "pointer" }}
                  aria-label="Next"
                >→</button>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {RR_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setCurrent(i); setKey((k) => k + 1); }}
                    style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: i === current ? "var(--acid)" : "var(--line)",
                      border: "none", cursor: "pointer", padding: 0,
                    }}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
              <ML color="var(--muted)">· Use ← → to step through the receipts ·</ML>
            </div>
          </div>

          {/* Right */}
          <div style={{ padding: "48px 0 48px 48px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
              <ML>@rick_ross · Bybit</ML>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", color: "var(--bg)", background: "var(--acid)", padding: "3px 8px" }}>VERIFIED</span>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 108, fontWeight: 600, color: "var(--acid)", lineHeight: 0.9, marginBottom: 12 }}>$3.16M</div>
            <ML color="var(--ash)" style={{ marginBottom: 32 }}>All-time P&L · five months in</ML>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 18, lineHeight: 1.65, color: "var(--ash)", fontStyle: "italic", margin: "0 0 36px", borderLeft: "2px solid var(--acid)", paddingLeft: 20 }}>
              &ldquo;Losing money in the markets is a choice.&rdquo;
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, color: "var(--bone)", marginBottom: 4 }}>$50K</div>
                <ML color="var(--muted)">Started with</ML>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, color: "var(--bone)", marginBottom: 4 }}>5 months</div>
                <ML color="var(--muted)">Timeframe</ML>
              </div>
            </div>
          </div>
        </div>
      </Wrap>
    </div>
  );
}

function ProofGrid() {
  const WINS = [
    { src: "/uploads/proof/win-01.jpg", handle: "@aulzon", dollars: "+147%", platform: "Gate.io", caption: "Two Gate.io shares in 24 hours. Followed the QCR plan exactly." },
    { src: "/uploads/proof/win-02.jpg", handle: "@rick_ross", dollars: "+$2.02M", platform: "Bybit", caption: "Hit the $2M goal in 2 months after starting with $50K." },
    { src: "/uploads/proof/win-03.jpg", handle: "@nate_smith", dollars: "+$21,257", platform: "Apex", caption: "10k → 100k individual challenge funded and running." },
    { src: "/uploads/proof/win-04.jpg", handle: "@yevrah1989", dollars: "+111%", platform: "Gate.io", caption: "XRPUSDT long — clean cycle play. In and out." },
    { src: "/uploads/proof/win-05.jpg", handle: "@j_mitch_tx", dollars: "+36.5%", platform: "Blofin", caption: "ETHUSDT short at 150x. Managed risk, banked clean." },
    { src: "/uploads/proof/win-06.jpg", handle: "@aljaz_qc", dollars: "+44.9%", platform: "Bybit", caption: "DEEPUSDT 3x long — clean swing, clean exit." },
    { src: "/uploads/proof/win-07.jpg", handle: "@nate_smith", dollars: "+52.7%", platform: "Bitget VIP", caption: "FOLKSUSDT short at 10x. Followed the plan." },
    { src: "/uploads/proof/win-08.jpg", handle: "@ametis_qc", dollars: "+330%", platform: "Bybit", caption: "AIOZUSDT long at 10x. Held through the expansion." },
    { src: "/uploads/proof/win-09.jpg", handle: "@shaunnz", dollars: "+131%", platform: "MEXC", caption: "AIOZUSDT close-long at 5x. QCR entry." },
    { src: "/uploads/proof/win-10.jpg", handle: "@servio_qc", dollars: "+$14,398", platform: "Bybit", caption: "SUPERUSDT long — held 11 days." },
    { src: "/uploads/proof/win-11.jpg", handle: "@nick_qc", dollars: "+199%", platform: "Bitget VIP", caption: "ORCAUSDT short at 10x. Textbook Krypton short setup." },
    { src: "/uploads/proof/win-12.jpg", handle: "@tm_qc", dollars: "+351%", platform: "Blofin", caption: "AIOZUSDT long at 10x. Held the position." },
  ];

  return (
    <Section id="proof" py={140}>
      <H num="05" label="Student wins" title="The pack ships receipts." sub="Twelve of hundreds posted in the live chat. Real trades, real accounts, real money." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "var(--line)", marginBottom: 1 }}>
        {WINS.map((w, i) => (
          <WolfWinTile key={i} src={w.src} handle={w.handle} caption={w.caption} dollars={w.dollars} platform={w.platform} />
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", background: "var(--bg-1)", padding: "20px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="pulse" style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "var(--acid)" }} />
          <ML>12 of hundreds · Posted in the live chat every week</ML>
        </div>
        <a href={JOIN_URL} className="btn">Buy Now</a>
      </div>
    </Section>
  );
}

function FuruVs() {
  return (
    <Section id="vs" py={140}>
      <H num="03" label="The Pack vs. The Furus" title="Why most gurus lose you money." sub="The difference between the Wolfpack and the rest of the industry isn't just results — it's the model." />
      <div style={{ background: "var(--bg-1)", border: "1px solid var(--line)" }}>
        {/* Header row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 64px 1fr", borderBottom: "1px solid var(--line)" }}>
          <div style={{ padding: "20px 28px", background: "rgba(255,45,171,0.04)" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, color: "var(--bone)", marginBottom: 6 }}>The Lambo guy</div>
            <ML color="var(--pink)">· Typical furu ·</ML>
          </div>
          <div style={{ borderLeft: "1px solid var(--line)", borderRight: "1px solid var(--line)" }} />
          <div style={{ padding: "20px 28px", background: "rgba(191,250,70,0.04)" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, color: "var(--bone)", marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}>
              Fous + the pack <WolfMark size={20} />
            </div>
            <ML color="var(--acid)">· The Wolfpack ·</ML>
          </div>
        </div>
        <FuruRow
          furu="Started in 2021 with meme coins, after watching TikTok."
          wolf="21 years live on the screens — every crash, every melt-up, since 2005."
        />
        <FuruRow
          furu="Screenshot testimonials 'borrowed' from Google Images."
          wolf="7,000+ traders across 63 countries · 4.95★ on Whop with verifiable receipts."
        />
        <FuruRow
          furu="One-trick pony. '100× leverage or bust.'"
          wolf="Same playbook across Crypto, Forex, Stocks, and Futures."
        />
        <FuruRow
          furu="Didn't see the last market crash coming."
          wolf="Capital protection sized into every single trade — through every cycle phase."
        />
        <FuruRow
          furu="'All-in, or you're not a real degen.'"
          wolf="Transparent with weekly reporting · wins and losses on the record."
        />
      </div>
    </Section>
  );
}

function VideoTestimonialsWall() {
  return (
    <Section id="videos" py={140}>
      <H num="04c" label="Video testimonials" title="Hear it from the pack." sub="20 of 50+ video testimonials from traders in the Wolfpack — different backgrounds, same results." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--line)", marginBottom: 1 }}>
        {VIDEO_TESTIMONIALS.map((v, i) => (
          <VideoTestimonialCard key={i} videoId={v.videoId} headline={v.headline} body={v.body} />
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", background: "var(--bg-1)", padding: "20px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="pulse" style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "var(--acid)" }} />
          <ML>20 of 50+ video testimonials · The Wolfpack speaks</ML>
        </div>
        <a href={JOIN_URL} style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", color: "var(--acid)", textTransform: "uppercase" }}>Apply For Your Seat →</a>
      </div>
    </Section>
  );
}

function ReviewsWall() {
  return (
    <Section id="reviews" py={140}>
      <H num="04b" label="Verified reviews · Whop" title="4.95 stars. 135 verified reviews." />
      <RatingHeader />
      <div style={{ columnCount: 3, columnGap: 14 }}>
        {REVIEWS.map((r, i) => (
          <ReviewCard key={i} name={r.name} quote={r.quote} date={r.date} />
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", background: "var(--bg-1)", padding: "20px 28px", marginTop: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="pulse" style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "var(--acid)" }} />
          <ML>Showing 24 of 135 · See all on Whop →</ML>
        </div>
        <a href="https://whop.com/iknk-fx/" style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", color: "var(--acid)", textTransform: "uppercase" }}>View All Reviews →</a>
      </div>
    </Section>
  );
}

function Package() {
  const TILES: PackageTileProps[] = [
    {
      idx: 1,
      kicker: "· Weekly Plan · The Backbone ·",
      accent: "var(--acid)",
      title: "Quantum Cipher Report",
      body: "Copy trading plans in Crypto & Forex sent every Monday with all the setups.",
      items: ["Crypto & Forex setups", "Sent every Monday", "All the setups included", "Copy and execute"],
      wide: true,
    },
    {
      idx: 2,
      kicker: "· Course · Alt-Coin Profit Model ·",
      accent: "var(--acid)",
      title: "Krypton Course",
      body: "The ultimate alt-coin course built around a 7-figure profit model. 30+ hours of content.",
      items: ["Ultimate alt-coin course", "7 Figure Profit Model", "30+ hours of content", "Beginner to advanced"],
    },
    {
      idx: 3,
      kicker: "· Curriculum · Beginner to Pro ·",
      accent: "#9B5CFF",
      title: "Pro Level Courses",
      body: "The beginner to pro starter course getting you ready to tackle trading.",
      items: ["Beginner to pro", "Ready to tackle trading", "Foundation curriculum", "Starter framework"],
    },
    {
      idx: 4,
      kicker: "· Indicators · TradingView Pack ·",
      accent: "#6FE9FF",
      title: "DEGENR8 Suite",
      body: "The full DEGENR8 TradingView indicator suite giving you the edge needed to start profiting.",
      items: ["Full indicator suite", "TradingView integration", "The edge to start profiting", "Private to members"],
    },
    {
      idx: 5,
      kicker: "· Community · The Room ·",
      accent: "var(--pink)",
      title: "LIVE Chat",
      body: "Real-time updates on current trades plus the best trading community on the planet.",
      items: ["Real-time trade updates", "Best trading community on the planet", "7,000+ traders", "63 countries"],
      wide: true,
    },
    {
      idx: 6,
      kicker: "· Framework · The Long Game ·",
      accent: "var(--acid)",
      title: "Krypton Millionaire Framework",
      body: "The Krypton Millionaire Framework — the full system for building long-term wealth as a trader.",
      items: ["Full millionaire framework", "Built on the Krypton system", "Long-term wealth building", "Included at no extra cost"],
      wide: true,
    },
  ];

  return (
    <Section id="package" py={140}>
      <H num="01" label="The Wolf Package" title="Everything. One payment." sub="Six deliverables, unlocked instantly. No upsells inside. No drip. No gatekeeping." />
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {TILES.map((tile) => (
          <PackageTile key={tile.idx} {...tile} />
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid var(--acid)", background: "var(--bg-1)", padding: "20px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <WolfMark size={22} />
          <ML>All six unlocked · One payment · $297</ML>
        </div>
        <a href={JOIN_URL} className="btn">Buy Now →</a>
      </div>
    </Section>
  );
}

function PriceBlock() {
  return (
    <Section id="join" py={120}>
      <div style={{
        border: "1px solid var(--acid)",
        position: "relative",
        overflow: "hidden",
        background: "radial-gradient(ellipse 80% 60% at 50% -20%, rgba(191,250,70,0.08) 0%, transparent 70%)",
      }}>
        <WolfMark
          size={500}
          color="var(--acid)"
          style={{ position: "absolute", right: -80, top: "50%", transform: "translateY(-50%)", opacity: 0.04, pointerEvents: "none" }}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", position: "relative" }}>
          {/* Left */}
          <div style={{ padding: "64px 56px", borderRight: "1px solid var(--line)" }}>
            <ML style={{ marginBottom: 24 }}>· Take your seat · One payment ·</ML>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 76, lineHeight: 0.98, letterSpacing: "-0.04em", color: "var(--bone)", margin: "0 0 24px" }}>
              Join the pack.<br />
              <em className="glow-acid" style={{ color: "var(--acid)" }}>Get the entire system.</em>
            </h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 17, lineHeight: 1.65, color: "var(--ash)", margin: "0 0 32px", maxWidth: 480 }}>
              One payment unlocks everything. No recurring fees. No upsells inside the room. The full Krypton system plus a weekly plan every Monday.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "All six deliverables · unlocked instantly",
                "Quantum Cipher Report · every Monday morning",
                "Live chat with 7,000+ traders · 63 countries",
                "Direct line to the operator team",
                "No upsells inside · everything included",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ color: "var(--acid)", fontFamily: "var(--font-mono)", fontSize: 14 }}>✓</span>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--ash)" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Right: price card */}
          <div style={{ padding: "64px 56px", display: "flex", flexDirection: "column" }}>
            <div style={{ background: "var(--bg-2)", borderTop: "4px solid var(--acid)", padding: "36px 32px", flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
                <ML>· The Wolfpack ·</ML>
                <ML color="var(--ash)">· VIA WHOP ·</ML>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 20 }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 88, fontWeight: 600, color: "var(--acid)", lineHeight: 1 }}>$297</span>
                <ML>· ONE PAYMENT</ML>
              </div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.65, color: "var(--ash)", margin: "0 0 28px" }}>
                Krypton Course + Weekly Trade Alerts. Lifetime access to the course.
              </p>
              <a href={JOIN_URL} className="btn" style={{ width: "100%", justifyContent: "center", display: "flex", marginBottom: 20 }}>Buy Now → Join the Wolfpack</a>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <ML color="var(--muted)">· SECURE · WHOP CHECKOUT ·</ML>
                <a href={ALT_URL} style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--acid)", letterSpacing: "0.16em", textTransform: "uppercase" }}>Browse all plans →</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

function FAQ() {
  const [openIdx, setOpenIdx] = useState(-1);

  const QS = [
    {
      q: "What exactly do I get for $297?",
      a: "Everything listed in the package section — Krypton course (30+ hours), weekly QCR, Pro Level curriculum, DEGENR8 suite, live chat, Millionaire Framework. One payment, instant access.",
    },
    {
      q: "Is this the same as the Mentorship application?",
      a: "No. Mentorship is application-only capped cohort with 1:1 access and live calls. Wolfpack is the operator's self-serve lane — same playbook, asynchronous.",
    },
    {
      q: "Do I need to be experienced to follow along?",
      a: "No. Pro Level courses built for someone who's never opened a chart. About half the pack started as complete beginners.",
    },
    {
      q: "Can I do this while working a full-time job?",
      a: "Yes — by design. QCR drops Monday morning. Read it once, place orders, walk away. One weekly planning session sets up the next five days.",
    },
    {
      q: "How is this different from ICT, SMC, or signal services?",
      a: "ICT/SMC leave you making live decisions all day. Signal services hand you trades but never teach why. Wolfpack gives pre-planned weekly framework.",
    },
    {
      q: "What markets do you cover?",
      a: "Primarily crypto majors and forex. Krypton framework forged in stocks for 16 years. Same methodology applies to indices, gold, any liquid asset.",
    },
    {
      q: "Is there a refund?",
      a: "Refund terms run through Whop's standard policy. The cleaner answer: most people who sign up stay. 4.95★ from 135 reviews isn't an accident.",
    },
    {
      q: "Is this financial advice?",
      a: "Absolutely not. This is education. Trade your own size, own capital, own risk parameters.",
    },
  ];

  return (
    <Section id="faq" py={140}>
      <H num="05" label="Frequently asked" title="Questions answered." />
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {QS.map((item, i) => {
          const isOpen = openIdx === i;
          return (
            <div
              key={i}
              style={{
                background: "var(--bg-1)",
                borderLeft: isOpen ? "2px solid var(--acid)" : "1px solid var(--line)",
                borderTop: "1px solid var(--line)",
                borderRight: "1px solid var(--line)",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <button
                onClick={() => setOpenIdx(isOpen ? -1 : i)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "22px 28px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  gap: 16,
                }}
              >
                <span style={{ fontFamily: "var(--font-body)", fontSize: 16, fontWeight: 600, color: "var(--bone)", lineHeight: 1.4 }}>{item.q}</span>
                <span style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 20,
                  color: "var(--acid)",
                  transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                  transition: "transform 200ms ease",
                  flexShrink: 0,
                }}>+</span>
              </button>
              {isOpen && (
                <div style={{ padding: "0 28px 24px" }}>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.7, color: "var(--ash)", margin: 0 }}>{item.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function FinalCTA() {
  return (
    <Section py={120}>
      <div style={{
        border: "1px solid var(--acid)",
        position: "relative",
        overflow: "hidden",
        background: "radial-gradient(ellipse 80% 60% at 50% -20%, rgba(191,250,70,0.08) 0%, transparent 70%)",
        padding: "80px 48px",
      }}>
        <WolfMark
          size={500}
          color="var(--acid)"
          style={{ position: "absolute", bottom: -100, left: -80, opacity: 0.04, pointerEvents: "none" }}
        />
        <div style={{ maxWidth: 940, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
            <WolfMark size={56} color="var(--acid)" />
          </div>
          <ML style={{ marginBottom: 20, justifyContent: "center", display: "flex" }}>· Stay a sheep · get eaten by the wolves ·</ML>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 96, lineHeight: 0.98, letterSpacing: "-0.04em", margin: "0 0 32px" }}>
            <span style={{ color: "var(--bone)" }}>Or </span>
            <em className="glow-acid" style={{ color: "var(--acid)" }}>become one.</em>
          </h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 19, lineHeight: 1.7, color: "var(--ash)", margin: "0 auto 40px", maxWidth: 680 }}>
            The system is built. The receipts are on the wall. The only question is whether you&apos;re in the pack or watching from the outside.
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 32 }}>
            <a href={JOIN_URL} className="btn btn-lg">Buy Now · $297 →</a>
            <a href="#package" className="btn btn-ghost btn-lg">See What&apos;s Inside</a>
          </div>
          <ML color="var(--ash)" style={{ justifyContent: "center", display: "flex" }}>· 4.95★ across 135 verified Whop reviews · Receipts on the wall ·</ML>
        </div>
      </div>
    </Section>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--line)", background: "var(--bg-1)", padding: "56px 0 0" }}>
      <Wrap>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: 48, marginBottom: 56 }}>
          <div>
            <div style={{ marginBottom: 20 }}>
              <WolfLogo />
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.7, color: "var(--ash)", margin: 0, maxWidth: 320 }}>
              The Wolfpack is a trading education program — not a financial advisory service. All results shown are documented, verifiable, and not typical.
            </p>
          </div>
          <div>
            <ML style={{ marginBottom: 20 }}>· The pack ·</ML>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Package", href: "#package" },
                { label: "Results", href: "#results" },
                { label: "Furu vs Pack", href: "#vs" },
                { label: "Reviews", href: "#reviews" },
                { label: "FAQ", href: "#faq" },
              ].map((l) => (
                <a key={l.href} href={l.href} style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--ash)", letterSpacing: "0.18em", textTransform: "uppercase" }}>{l.label}</a>
              ))}
            </div>
          </div>
          <div>
            <ML style={{ marginBottom: 20 }}>· Other lanes ·</ML>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Free Course", href: "/free-course" },
                { label: "The Mentorship", href: "#" },
                { label: "Brand Codex", href: "#" },
              ].map((l) => (
                <a key={l.href} href={l.href} style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--ash)", letterSpacing: "0.18em", textTransform: "uppercase" }}>{l.label}</a>
              ))}
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid var(--line)", padding: "24px 0 36px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <ML color="var(--muted)">© 2026 Cameron Fous · All rights reserved · Not financial advice ·</ML>
          <div style={{ display: "flex", gap: 24 }}>
            <a href="/privacy" style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.18em", textTransform: "uppercase" }}>Privacy</a>
            <a href="/terms" style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.18em", textTransform: "uppercase" }}>Terms</a>
          </div>
        </div>
      </Wrap>
    </footer>
  );
}

// ─── Default Export ───────────────────────────────────────────────────────────

export default function WolfpackGlobalPage() {
  useEffect(() => {
    posthog.capture("wolfpack_page_viewed");
  }, []);

  return (
    <>
      <WolfStickyBar joinHref={JOIN_URL} />
      <DownsellBar />
      <Hero />
      <WolfTicker />
      <Receipts />
      <MatrixBand />
      <KryptonCaseGrid />
      <Results />
      <TopCallStory />
      <BankedTrades />
      <Lifestyle />
      <RickRossSpotlight />
      <ProofGrid />
      <FuruVs />
      <VideoTestimonialsWall />
      <ReviewsWall />
      <Package />
      <PriceBlock />
      <FAQ />
      <FinalCTA />
      <Footer />
    </>
  );
}
