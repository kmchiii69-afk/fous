"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import posthog from "posthog-js";
import Lightbox from "@/components/page2/Lightbox";
import ProofTile from "@/components/page2/ProofTile";

/* ─── design tokens shorthand ─── */
const ML = ({ children, color = "var(--acid)", style }: { children: React.ReactNode; color?: string; style?: React.CSSProperties }) => (
  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color, letterSpacing: "0.22em", textTransform: "uppercase" as const, ...style }}>
    {children}
  </div>
);

const Wrap = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 48px", ...style }}>{children}</div>
);

const Section = ({ children, py = 120, id, style }: { children: React.ReactNode; py?: number; id?: string; style?: React.CSSProperties }) => (
  <section id={id} style={{ padding: `${py}px 0`, ...style }}>
    <Wrap>{children}</Wrap>
  </section>
);

function H({ num, label, title, sub }: { num: string; label: string; title: React.ReactNode; sub: string }) {
  return (
    <div style={{ marginBottom: 64 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--acid)", letterSpacing: "0.22em" }}>§ {num}</span>
        <div style={{ width: 24, height: 1, background: "var(--acid)" }} />
        <ML style={{ fontSize: 10 }}>· {label} ·</ML>
      </div>
      <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 76, lineHeight: 0.96, letterSpacing: "-0.045em", color: "var(--bone)", margin: "0 0 24px" }}>
        {title}
      </h2>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 18, lineHeight: 1.6, color: "var(--ash)", margin: 0, maxWidth: 820, fontWeight: 400 }}>{sub}</p>
    </div>
  );
}

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0, whiteSpace: "nowrap" }}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ flexShrink: 0 }}>
        <rect x="0.5" y="0.5" width="27" height="27" stroke="var(--acid)" strokeWidth="1" />
        <rect x="7" y="7" width="14" height="14" fill="var(--acid)" />
        <rect x="11" y="11" width="6" height="6" fill="var(--bg)" />
      </svg>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "var(--bone)", letterSpacing: "0.18em", textTransform: "uppercase" as const, whiteSpace: "nowrap" }}>
        Quantum Cipher
      </span>
    </div>
  );
}

/* ─── data ─── */
const LESSONS = [
  { vid: "yuTjmDL9GHw", dur: "07:00", title: "Give Me 7 Minutes — I'll Improve Your Trading By 176%", kicker: "Lesson 01 · The Premise", stat: { big: "+176%", tag: "In 7 Minutes" } },
  { vid: "xWM-EgM36WI", dur: "37:00", title: "$20K to $1.75M in 420 Days · The 100× Crypto Strategy", kicker: "Lesson 02 · Case Study", stat: { big: "$1.75M", tag: "From $20K · 420 days" } },
  { vid: "1kthmhMf-mw", dur: "17:22", title: "How To Win At Trading Without Luck, Talent, Or Being A Genius", kicker: "Lesson 03 · Mindset", stat: { big: "—", tag: "Without luck · without talent" } },
  { vid: "gQco5FCZJvE", dur: "37:14", title: "Day In The Life · 7-Figure Trader Banks $302K On XRP", kicker: "Lesson 04 · Case Study", stat: { big: "$302K", tag: "Single XRP cycle" } },
  { vid: "R_EG8vscTGw", dur: "45:48", title: "How To Swing Trade Crypto · The Blueprint That Made Me $1.2M In 30 Days", kicker: "Lesson 05 · The Blueprint", stat: { big: "$1.2M", tag: "30-day blueprint" } },
  { vid: null, dur: null, title: null, kicker: "Lesson 06", stat: null },
  { vid: null, dur: null, title: null, kicker: "Lesson 07", stat: null },
  { vid: null, dur: null, title: null, kicker: "Lesson 08", stat: null },
  { vid: null, dur: null, title: null, kicker: "Lesson 09", stat: null },
  { vid: null, dur: null, title: null, kicker: "Lesson 10", stat: null },
  { vid: null, dur: null, title: null, kicker: "Lesson 11", stat: null },
  { vid: null, dur: null, title: null, kicker: "Lesson 12", stat: null },
];

const PROOF_TILES = [
  { src: "uploads/proof/win-02.jpg", handle: "@rick_ross",  caption: "Hit the $2M goal in 2 months. 'Chillin' for now.' Bybit all-perps total.", dollars: "+$2.02M", platform: "Bybit" },
  { src: "uploads/proof/win-01.jpg", handle: "@aulzon",     caption: "Two Gate.io shares in 24 hours — IMX +147% and TAO +115%.",              dollars: "+147%",   platform: "Gate.io" },
  { src: "uploads/proof/win-08.jpg", handle: "@ametis_qc",  caption: "AIOZUSDT long at 10x. 'Great call, you're a legend bro.'",               dollars: "+330%",   platform: "Bybit" },
  { src: "uploads/proof/win-04.jpg", handle: "@yevrah1989", caption: "XRPUSDT long — clean cycle play, F1 receipt to prove it.",               dollars: "+111%",   platform: "Gate.io" },
  { src: "uploads/proof/win-11.jpg", handle: "@nick_qc",    caption: "ORCAUSDT short at 10x. Perfect Sucker Punch 1D setup.",                  dollars: "+199%",   platform: "Bitget" },
  { src: "uploads/proof/win-05.jpg", handle: "@j_mitch_tx", caption: "ETHUSDT short at 150x — locked gains right into the daily flush.",       dollars: "+36%",    platform: "Blofin" },
];

const REVIEWS = [
  { stars: 5, name: "Bryan E.",    role: "5-year Wolfpack member",  body: "Came back after 5 years away from trading. $4K in 6 days just sticking to the framework. Works whether the market is bullish or bearish. Don't waste time anywhere else." },
  { stars: 5, name: "Servio R.",   role: "Bybit · QC operator",     body: "Held SUPERUSDT for 11 days. +$14,398. The patience the playbook teaches is what most courses skip entirely. This is the real thing." },
  { stars: 5, name: "Aljaž K.",    role: "Bybit · QC operator",     body: "Tried ICT, SMC, every guru on YouTube. Nothing clicked until Cam laid the cycle out. Now I just follow the plan. +44.96% on the last swing." },
];

const VIDEOS = [
  { id: "dUIipa1vxAs", h: "$3 Million Following Cam Since 2013",        b: "Federal government insider · over a decade of profit." },
  { id: "PsFXUIHN1d0", h: "Doubled My Bag In The First 30 Days",        b: "Cuts straight to the point. 30 days, account doubled." },
  { id: "WYI-CU3PZfs", h: "+10% In My First Month As A Beginner",       b: "Brand new to trading. Followed the system. Grew her account." },
];

/* ─── StickyBar ─── */
function StickyBar() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    function onScroll() { setShow(window.scrollY > 700); }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      background: "rgba(6,7,10,0.94)", backdropFilter: "blur(14px)",
      borderBottom: "1px solid var(--acid)",
      transform: show ? "translateY(0)" : "translateY(-100%)",
      transition: "transform 280ms cubic-bezier(0.2,0.8,0.2,1)",
      boxShadow: show ? "0 4px 32px rgba(0,0,0,0.6)" : "none",
    }}>
      <Wrap style={{ padding: "14px 48px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24 }}>
          <Logo />
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <ML color="var(--acid)">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                <span className="pulse" style={{ display: "inline-block", width: 7, height: 7, background: "var(--acid)" }} />
                · Free Course · 12 lessons · No charge
              </span>
            </ML>
            <a href="#unlock" className="btn">Get Access →</a>
          </div>
        </div>
      </Wrap>
    </div>
  );
}

/* ─── LockedPlaylist ─── */
function LockedPlaylist() {
  return (
    <div style={{ background: "var(--bg-1)", border: "1px solid var(--line)", position: "relative", overflow: "hidden" }}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <ML>· The Cipher · Free Course ·</ML>
        <ML color="var(--ash)" style={{ fontSize: 9 }}>· 12 LESSONS · LOCKED ·</ML>
      </div>
      <div style={{ position: "relative" }}>
        <div style={{ padding: "8px 0", maxHeight: 420, overflow: "hidden" }}>
          {LESSONS.slice(0, 6).map((l, i) => (
            <div key={i} style={{
              padding: "14px 24px",
              display: "grid", gridTemplateColumns: "32px 1fr auto",
              gap: 16, alignItems: "center",
              borderBottom: i < 5 ? "1px solid var(--line)" : "0",
            }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--ash)", letterSpacing: "0.16em" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div style={{ minWidth: 0 }}>
                {l.title ? (
                  <div style={{
                    fontFamily: "var(--font-display)", fontSize: 14.5, fontWeight: 500,
                    color: "var(--bone)", letterSpacing: "-0.005em", lineHeight: 1.3,
                    overflow: "hidden", textOverflow: "ellipsis",
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
                  }}>{l.title}</div>
                ) : (
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.22em" }}>
                    · Lesson title · locked
                  </div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {l.dur && <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, color: "var(--ash)", letterSpacing: "0.18em" }}>{l.dur}</span>}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--ash)" strokeWidth="1.5">
                  <rect x="2" y="6" width="10" height="7" />
                  <path d="M 4 6 V 4 a 3 3 0 0 1 6 0 V 6" />
                </svg>
              </div>
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 160, background: "linear-gradient(to bottom, transparent, var(--bg-1) 80%)", pointerEvents: "none" }} />
      </div>
      <div style={{ padding: "20px 24px", borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <ML color="var(--ash)" style={{ fontSize: 10 }}>· 6 more lessons inside ·</ML>
        <a href="#unlock" style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--acid)", letterSpacing: "0.22em", textTransform: "uppercase" }}>Unlock all →</a>
      </div>
    </div>
  );
}

/* ─── Hero ─── */
function Hero() {
  return (
    <section className="grid-bg" style={{ position: "relative", padding: "32px 0 80px", borderBottom: "1px solid var(--line)" }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(900px 600px at 50% 0%, rgba(191,250,70,0.08), transparent 60%)" }} />
      <Wrap style={{ position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 56 }}>
          <Logo />
          <div className="qc-hide-mobile" style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span className="pulse" style={{ width: 6, height: 6, background: "var(--acid)" }} />
            <ML>· Free Cipher Course · By application ·</ML>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 64, alignItems: "center" }}>
          <div>
            <ML color="var(--ash)" style={{ marginBottom: 22, letterSpacing: "0.24em" }}>· 12 lessons · members only · zero charge ·</ML>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 84, lineHeight: 0.96, letterSpacing: "-0.045em", color: "var(--bone)", margin: "0 0 24px" }}>
              I quit day trading.<br />
              Then started <em style={{ color: "var(--acid)", textShadow: "0 0 36px rgba(191,250,70,0.35)" }}>printing 7 figures.</em>
            </h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 19, lineHeight: 1.55, color: "var(--ash)", margin: "0 0 36px", maxWidth: 580, fontWeight: 400 }}>
              I&rsquo;ve traded for 21 years. I started as a swing trader, then chased day trading for five years. Profitable, but burnt out, depressed, always stressed, always emotional. When I went back to my roots — swing trading — <em style={{ color: "var(--bone)" }}>that&rsquo;s when I started printing 7 figures and got my life back.</em> The free course breaks the whole system down.
            </p>
            <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
              <a href="#unlock" className="btn btn-lg" style={{ fontSize: 14, padding: "22px 36px" }}>Get Free Access →</a>
              <a href="#preview" style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, color: "var(--bone)", letterSpacing: "0.16em", textTransform: "uppercase", borderBottom: "1px solid var(--line-2)", paddingBottom: 4 }}>
                · See what&rsquo;s inside ↓
              </a>
            </div>
          </div>
          <div>
            <LockedPlaylist />
          </div>
        </div>

        <div style={{ marginTop: 64, paddingTop: 32, borderTop: "1px solid var(--line)", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 28, textAlign: "left" }}>
          {[
            { v: "21 yrs", k: "Crypto · forex · stocks" },
            { v: "$3M+",   k: "Top student profit" },
            { v: "1 day",  k: "Of work · per week" },
            { v: "$0",     k: "What this costs you" },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, color: "var(--acid)", letterSpacing: "-0.03em", lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ash)", letterSpacing: "0.20em", textTransform: "uppercase", marginTop: 8 }}>· {s.k}</div>
            </div>
          ))}
        </div>
      </Wrap>
    </section>
  );
}

/* ─── MeetCameron ─── */
function MeetCameron() {
  return (
    <Section py={120} style={{ borderBottom: "1px solid var(--line)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "0.85fr 1.15fr", gap: 64, alignItems: "center" }}>
        <div style={{ position: "relative", background: "var(--bg-1)", border: "1px solid var(--line)", overflow: "hidden" }}>
          <div style={{ position: "relative", aspectRatio: "4/5", background: "var(--bg-2)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/uploads/cam/portrait-desk.jpg" alt="Cameron Fous — at the desk"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
            <div style={{ position: "absolute", top: 14, left: 14, display: "flex", alignItems: "center", gap: 10, padding: "6px 12px", background: "rgba(6,7,10,0.78)", border: "1px solid var(--acid)", backdropFilter: "blur(8px)" }}>
              <span className="pulse" style={{ width: 6, height: 6, background: "var(--acid)" }} />
              <ML style={{ fontSize: 9 }}>· Live operator · 21 yrs ·</ML>
            </div>
            <div style={{ position: "absolute", bottom: 14, left: 14, right: 14, padding: "10px 14px", background: "rgba(6,7,10,0.82)", border: "1px solid var(--line-2)", backdropFilter: "blur(8px)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <ML color="var(--bone)" style={{ fontSize: 10 }}>· Cameron Fous</ML>
              <ML color="var(--ash)" style={{ fontSize: 9 }}>· The Quantum Cipher ·</ML>
            </div>
          </div>
        </div>
        <div>
          <ML style={{ marginBottom: 16 }}>· Meet your mentor ·</ML>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 64, lineHeight: 0.97, letterSpacing: "-0.04em", color: "var(--bone)", margin: "0 0 22px" }}>
            21 years in the markets.<br /><em style={{ color: "var(--acid)" }}>One system that still works.</em>
          </h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 17, lineHeight: 1.6, color: "var(--ash)", margin: "0 0 28px", maxWidth: 580, fontWeight: 400 }}>
            I&rsquo;ve been trading crypto, forex, and stocks for 21 years &mdash; since 2005, through every bull, every bear, every blow-off top. Quantum Cipher is the system I built and refined across multiple full cycles. The same one I run today.
          </p>
          <div style={{ paddingTop: 26, borderTop: "1px solid var(--line)", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
            {[
              { v: "2005",     k: "First live trade" },
              { v: "$3M+",     k: "Top student profit" },
              { v: "3 assets", k: "Crypto · stocks · FX" },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--acid)", letterSpacing: "-0.03em", lineHeight: 1 }}>{s.v}</div>
                <ML color="var(--ash)" style={{ fontSize: 9, marginTop: 10, whiteSpace: "normal" }}>· {s.k} ·</ML>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ─── ApplyBand (free course variant — acid bg, links to #unlock) ─── */
function ApplyBand({ caption, subline }: { caption: string; subline?: string }) {
  return (
    <a href="#unlock" style={{
      display: "block", background: "var(--acid)", color: "var(--bg)",
      textDecoration: "none", borderTop: "1px solid var(--bg)", borderBottom: "1px solid var(--bg)",
      position: "relative", overflow: "hidden",
    }}>
      <Wrap style={{ padding: "40px 48px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 28, alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--bg)", letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.72 }}>· {caption} ·</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 64, fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 0.95, marginTop: 8, color: "var(--bg)" }}>
              Get Free Access →
            </div>
            {subline && <div style={{ fontFamily: "var(--font-body)", fontSize: 16, fontWeight: 500, color: "var(--bg)", opacity: 0.8, marginTop: 8, maxWidth: 720 }}>{subline}</div>}
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", padding: "20px 32px", background: "var(--bg)", color: "var(--acid)", whiteSpace: "nowrap" }}>
            Send Me The Course →
          </div>
        </div>
      </Wrap>
    </a>
  );
}

/* ─── CaseStudies ─── */
function CaseStudies() {
  const cases = [
    { tag: "Case · 01", big: "$1.75M", from: "Up from $20K",         span: "420 days",     note: "100× crypto strategy — full trade-by-trade breakdown.", dur: "37:00" },
    { tag: "Case · 02", big: "$1.2M",  from: "30-day swing blueprint", span: "Krypton 2.0", note: "The exact playbook used through the November 2024 cycle.", dur: "45:48" },
    { tag: "Case · 03", big: "$302K",  from: "Single XRP cycle",      span: "Day in the life", note: "Filmed on the road. Real position, real exit, real money.", dur: "37:14" },
  ];
  return (
    <Section py={120} style={{ borderBottom: "1px solid var(--line)" }}>
      <div style={{ marginBottom: 48, display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 64, alignItems: "end" }}>
        <div>
          <ML style={{ marginBottom: 14 }}>· Case studies ·</ML>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 52, lineHeight: 0.98, letterSpacing: "-0.035em", color: "var(--bone)", margin: 0 }}>
            Real results.<br /><em style={{ color: "var(--acid)" }}>Broken down inside.</em>
          </h2>
        </div>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 17, lineHeight: 1.6, color: "var(--ash)", margin: 0, maxWidth: 620, fontWeight: 400 }}>
          Three of the twelve lessons are full case-study videos — entries, exits, and what I was thinking the whole way. No charts pulled from random YouTubers. My capital, my P&amp;L.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {cases.map((c, i) => (
          <div key={i} style={{ background: "var(--bg-1)", border: "1px solid var(--line)", borderTop: "2px solid var(--acid)", padding: "28px 30px 26px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
              <ML style={{ fontSize: 10 }}>· {c.tag}</ML>
              <ML color="var(--ash)" style={{ fontSize: 9 }}>{c.dur}</ML>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 64, fontWeight: 700, color: "var(--acid)", letterSpacing: "-0.045em", lineHeight: 0.9, textShadow: "0 0 32px rgba(191,250,70,0.25)", marginBottom: 18 }}>
              {c.big}
            </div>
            <ML color="var(--ash)" style={{ fontSize: 9, marginBottom: 16, whiteSpace: "normal" }}>· {c.from} · {c.span} ·</ML>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.55, color: "var(--ash)", margin: 0, fontWeight: 400 }}>{c.note}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ─── Premise ─── */
function Premise() {
  const trap = [
    "8+ hours glued to the screen, every market open",
    "Live decisions driven by emotion, FOMO, and revenge trades",
    "ICT/SMC and other buzzword strategies repackaged on TikTok by 22-year-olds in Miami",
    "Sketchy offshore brokers that quietly profit when your account blows up",
    "Influencers flexing fake screenshots from accounts that were never live",
    "Stress, burnout, missed weddings, dead weekends",
  ];
  const cipher = [
    "Sunday morning, coffee, one planning session — your week is done",
    "Orders are set before market opens. The trade fills itself while you sleep",
    "Weekends back. Date nights back. Mornings without dread back",
    "Travel without ruining the trip checking your phone every 10 minutes",
    "Calm, clear, sleeping through the night — emotions never touch the position",
    "Watching your account compound while you live the life that capital is for",
  ];
  return (
    <Section py={140} style={{ borderBottom: "1px solid var(--line)" }}>
      <H
        num="01"
        label="The premise"
        title={<>Day trading wrecks your life. <em style={{ color: "var(--acid)" }}>Swing trading gives it back.</em></>}
        sub="Most retail traders are sold the same lie — sit at the screen all day, take dozens of trades, get rich fast. It doesn't work. The other way is the one nobody markets to you: plan once a week, place your orders, live your life."
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: "var(--bg-1)", border: "1px solid var(--line)", borderTop: "2px solid var(--pink)" }}>
          <div style={{ padding: "26px 30px 22px", borderBottom: "1px solid var(--line)" }}>
            <ML color="var(--pink)" style={{ marginBottom: 10 }}>· The trap ·</ML>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, color: "var(--bone)", letterSpacing: "-0.025em", lineHeight: 1.05 }}>The day-trading pitch</div>
          </div>
          {trap.map((t, i) => (
            <div key={i} style={{ padding: "18px 30px", display: "flex", gap: 16, alignItems: "flex-start", borderTop: i === 0 ? "0" : "1px solid var(--line)" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--pink)", lineHeight: 1, minWidth: 24, marginTop: 1 }}>×</span>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.5, color: "var(--ash)", fontWeight: 400 }}>{t}</span>
            </div>
          ))}
        </div>
        <div style={{ background: "var(--bg-1)", border: "1px solid var(--acid)", borderTop: "2px solid var(--acid)", boxShadow: "0 0 64px rgba(191,250,70,0.08)" }}>
          <div style={{ padding: "26px 30px 22px", borderBottom: "1px solid var(--line)" }}>
            <ML style={{ marginBottom: 10 }}>· The cipher ·</ML>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, color: "var(--bone)", letterSpacing: "-0.025em", lineHeight: 1.05 }}>Your new life as a swing trader</div>
          </div>
          {cipher.map((t, i) => (
            <div key={i} style={{ padding: "18px 30px", display: "flex", gap: 16, alignItems: "flex-start", borderTop: i === 0 ? "0" : "1px solid var(--line)" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--acid)", lineHeight: 1, minWidth: 24, marginTop: 1 }}>✓</span>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.5, color: "var(--bone)", fontWeight: 400 }}>{t}</span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ─── Proof ─── */
function Proof() {
  return (
    <Section id="proof" py={140} style={{ borderBottom: "1px solid var(--line)" }}>
      <H
        num="03"
        label="Receipts"
        title={<>It&rsquo;s not just me. <em style={{ color: "var(--acid)" }}>Students are eating.</em></>}
        sub="Real handles. Real platforms. Real dollar figures. Posted in the live room every week — six of hundreds."
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 64 }}>
        {PROOF_TILES.map((t, i) => <ProofTile key={i} {...t} />)}
      </div>

      <div style={{ marginBottom: 64 }}>
        <ML color="var(--ash)" style={{ marginBottom: 22, fontSize: 10 }}>· From inside the live community ·</ML>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {REVIEWS.map((r, i) => (
            <div key={i} style={{ background: "var(--bg-1)", border: "1px solid var(--line)", borderTop: "2px solid var(--acid)", padding: "26px 28px", display: "flex", flexDirection: "column" }}>
              <div style={{ color: "var(--acid)", fontSize: 14, letterSpacing: "2px", marginBottom: 16 }}>{"★".repeat(r.stars)}</div>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 500, fontStyle: "italic", color: "var(--bone)", lineHeight: 1.45, margin: "0 0 22px", letterSpacing: "-0.01em", flex: 1 }}>
                &ldquo;{r.body}&rdquo;
              </p>
              <div style={{ paddingTop: 16, borderTop: "1px solid var(--line)" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, color: "var(--bone)", letterSpacing: "-0.01em" }}>{r.name}</div>
                <ML color="var(--ash)" style={{ fontSize: 9, marginTop: 6 }}>· {r.role} ·</ML>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <ML color="var(--ash)" style={{ marginBottom: 22, fontSize: 10 }}>· Video testimonials · unscripted ·</ML>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {VIDEOS.map((v, i) => (
            <a key={i} href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer"
              style={{ background: "var(--bg-1)", border: "1px solid var(--line)", overflow: "hidden", textDecoration: "none", display: "flex", flexDirection: "column", transition: "border-color 200ms ease, transform 200ms ease" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--acid)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ position: "relative", aspectRatio: "16/9", background: "var(--bg-2)", overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt={v.h}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(6,7,10,0.0) 50%, rgba(6,7,10,0.75) 100%)" }} />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 56, height: 56, background: "var(--acid)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 32px rgba(191,250,70,0.45)" }}>
                    <svg width="18" height="18" viewBox="0 0 32 32"><polygon points="10,6 10,26 28,16" fill="var(--bg)" /></svg>
                  </div>
                </div>
                <div style={{ position: "absolute", top: 10, left: 10, padding: "4px 8px", background: "rgba(6,7,10,0.85)", border: "1px solid var(--line-2)" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, color: "var(--bone)", letterSpacing: "0.20em" }}>▶ VIDEO</span>
                </div>
              </div>
              <div style={{ padding: "16px 20px 18px" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: "var(--bone)", letterSpacing: "-0.015em", lineHeight: 1.25 }}>{v.h}</div>
                <ML color="var(--ash)" style={{ fontSize: 9, marginTop: 10, whiteSpace: "normal" }}>· {v.b}</ML>
              </div>
            </a>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ─── TheMethod ─── */
function TheMethod() {
  return (
    <Section py={140} style={{ borderBottom: "1px solid var(--line)" }}>
      <H
        num="02"
        label="The method"
        title={<>Herd the sheep. <em style={{ color: "var(--acid)" }}>Be the wolf.</em></>}
        sub="Every chart has two zones — where the crowd's stop-losses cluster, and where their FOMO buys hide. We don't fight the crowd. We pre-position above and below them, and let the next sweep walk our traps."
      />

      <div style={{ position: "relative", overflow: "hidden", border: "1px solid var(--line)", marginBottom: 24, aspectRatio: "21/9", background: "var(--bg-1)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/uploads/cam/at-the-charts.jpg" alt="Cameron Fous · planning the week at the charts"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 35%" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(270deg, rgba(6,7,10,0.92) 0%, rgba(6,7,10,0.55) 40%, rgba(6,7,10,0) 70%)" }} />
        <div style={{ position: "absolute", inset: 0, padding: "0 56px", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
          <div style={{ maxWidth: 480, textAlign: "right" }}>
            <ML style={{ marginBottom: 18, justifyContent: "flex-end", display: "flex" }}>· Sunday morning · the only session ·</ML>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 48, lineHeight: 0.98, letterSpacing: "-0.035em", color: "var(--bone)", marginBottom: 16 }}>
              1–2 hours.<br /><em style={{ color: "var(--acid)" }}>The whole week is planned.</em>
            </div>
            <ML color="var(--ash)" style={{ fontSize: 10, justifyContent: "flex-end", display: "flex" }}>· Entry · stop · target · placed in advance ·</ML>
          </div>
        </div>
      </div>

      <div style={{ background: "var(--bg-1)", border: "1px solid var(--line)", padding: "44px 48px 32px", marginBottom: 24, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(800px 400px at 50% 50%, rgba(191,250,70,0.05), transparent 60%)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
            <ML color="var(--ash)" style={{ fontSize: 9 }}>· One chart · two trap zones · pre-positioned ·</ML>
            <ML color="var(--ash)" style={{ fontSize: 9 }}>· Trade orders placed in advance ·</ML>
          </div>
          <svg viewBox="0 0 1600 360" style={{ width: "100%", display: "block", overflow: "visible" }}>
            <line x1="0" y1="180" x2="1600" y2="180" stroke="var(--line-2)" strokeWidth="1" strokeDasharray="4 6" />
            <rect x="0" y="40" width="1600" height="60" fill="rgba(255,45,171,0.06)" stroke="var(--pink)" strokeWidth="1" strokeDasharray="2 3" opacity="0.7" />
            <text x="24" y="70" fill="var(--pink)" style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.22em" }}>· UPPER TRAP · FOMO BUYS LIQUIDATE</text>
            <rect x="0" y="260" width="1600" height="60" fill="rgba(191,250,70,0.06)" stroke="var(--acid)" strokeWidth="1" strokeDasharray="2 3" opacity="0.7" />
            <text x="24" y="306" fill="var(--acid)" style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.22em" }}>· LOWER TRAP · STOPS GET HUNTED</text>
            <path d="M 40 200 Q 160 180, 240 220 Q 360 260, 460 240 Q 560 220, 620 180 Q 700 140, 800 90 Q 880 60, 940 110 Q 1020 150, 1100 130 Q 1180 110, 1260 180 Q 1340 250, 1440 290 Q 1500 305, 1560 220"
              fill="none" stroke="var(--bone)" strokeWidth="2" opacity="0.85" />
            <g>
              <line x1="800" y1="90" x2="800" y2="60" stroke="var(--pink)" strokeWidth="1.5" strokeDasharray="3 3" />
              <polygon points="800,60 794,72 806,72" fill="var(--pink)" />
              <text x="816" y="68" fill="var(--pink)" style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.16em" }}>SWEEP</text>
            </g>
            <g>
              <line x1="1440" y1="290" x2="1440" y2="310" stroke="var(--acid)" strokeWidth="1.5" strokeDasharray="3 3" />
              <polygon points="1440,310 1434,298 1446,298" fill="var(--acid)" />
              <text x="1456" y="306" fill="var(--acid)" style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.16em" }}>SWEEP</text>
            </g>
            <g>
              <line x1="0" y1="76" x2="1600" y2="76" stroke="var(--pink)" strokeWidth="1" strokeDasharray="6 6" opacity="0.55" />
              <text x="1200" y="68" fill="var(--pink)" textAnchor="end" style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.16em" }}>· SELL LIMIT · PRE-PLACED</text>
            </g>
            <g>
              <line x1="0" y1="288" x2="1600" y2="288" stroke="var(--acid)" strokeWidth="1" strokeDasharray="6 6" opacity="0.55" />
              <text x="1200" y="282" fill="var(--acid)" textAnchor="end" style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.16em" }}>· BUY LIMIT · PRE-PLACED</text>
            </g>
          </svg>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {[
          { n: "01", t: "Locate the pain",   d: "Identify where retail stops cluster — recent highs, recent lows, round-number magnets. That's the liquidity the market is hunting next." },
          { n: "02", t: "Set the trap",      d: "Place pre-planned entries on the wrong side of the sweep, sized to a fixed risk. Your decision is done before the candle prints." },
          { n: "03", t: "Walk away",         d: "Bracket the trade. Set the alert. Close the laptop. The market either fills you on its terms — or it doesn't. Either is fine." },
        ].map((s, i) => (
          <div key={i} style={{ background: "var(--bg-1)", border: "1px solid var(--line)", borderTop: "2px solid var(--acid)", padding: "32px 30px 30px", display: "flex", flexDirection: "column" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--acid)", letterSpacing: "0.22em", marginBottom: 18 }}>· STEP {s.n} ·</span>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 600, color: "var(--bone)", letterSpacing: "-0.03em", lineHeight: 1.0, marginBottom: 16 }}>{s.t}</div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.55, color: "var(--ash)", margin: 0, fontWeight: 400, flex: 1 }}>{s.d}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ─── LessonCard ─── */
function LessonCard({ idx, lesson }: { idx: number; lesson: typeof LESSONS[0] }) {
  const num = String(idx + 1).padStart(2, "0");
  return (
    <div
      style={{ background: "var(--bg-1)", border: "1px solid var(--line)", overflow: "hidden", transition: "border-color 200ms ease, transform 200ms ease", display: "flex", flexDirection: "column" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--acid)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{
        position: "relative", aspectRatio: "16/10",
        background: lesson.title
          ? "linear-gradient(135deg, #0B0C10 0%, #11131A 50%, #0B0C10 100%)"
          : "repeating-linear-gradient(45deg, var(--bg-2), var(--bg-2) 14px, var(--bg-1) 14px, var(--bg-1) 28px)",
        borderBottom: "1px solid var(--line)",
        display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: 12, left: 12, padding: "4px 8px", background: "rgba(6,7,10,0.85)", border: `1px solid ${lesson.title ? "var(--acid)" : "var(--line-2)"}`, fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, color: lesson.title ? "var(--acid)" : "var(--ash)", letterSpacing: "0.22em" }}>
          · LSN {num} ·
        </div>
        {lesson.dur && (
          <div style={{ position: "absolute", top: 12, right: 12, padding: "4px 8px", background: "rgba(6,7,10,0.85)", border: "1px solid var(--line-2)", fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, color: "var(--bone)", letterSpacing: "0.18em" }}>
            {lesson.dur}
          </div>
        )}
        {lesson.stat ? (
          <div style={{ textAlign: "center", padding: "24px 16px" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 44, fontWeight: 700, color: "var(--acid)", letterSpacing: "-0.045em", lineHeight: 0.9, textShadow: "0 0 24px rgba(191,250,70,0.3)" }}>
              {lesson.stat.big}
            </div>
            <ML color="var(--ash)" style={{ marginTop: 12, fontSize: 9, whiteSpace: "normal" }}>· {lesson.stat.tag} ·</ML>
          </div>
        ) : (
          <svg width="32" height="32" viewBox="0 0 14 14" fill="none" stroke="var(--muted)" strokeWidth="1.2">
            <rect x="2" y="6" width="10" height="7" />
            <path d="M 4 6 V 4 a 3 3 0 0 1 6 0 V 6" />
          </svg>
        )}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: lesson.title ? "linear-gradient(180deg, rgba(6,7,10,0.10) 0%, rgba(6,7,10,0.0) 30%, rgba(6,7,10,0.0) 70%, rgba(6,7,10,0.55) 100%)" : "rgba(6,7,10,0.5)" }} />
      </div>
      <div style={{ padding: "18px 20px 20px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        <ML color="var(--ash)" style={{ fontSize: 9 }}>· {lesson.kicker} ·</ML>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, color: lesson.title ? "var(--bone)" : "var(--muted)", letterSpacing: "-0.01em", lineHeight: 1.3, flex: 1 }}>
          {lesson.title || "Title locked · unlock at sign-up"}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="var(--ash)" strokeWidth="1.5">
            <rect x="2" y="6" width="10" height="7" />
            <path d="M 4 6 V 4 a 3 3 0 0 1 6 0 V 6" />
          </svg>
          <ML color="var(--ash)" style={{ fontSize: 9 }}>· Locked ·</ML>
        </div>
      </div>
    </div>
  );
}

/* ─── InsideTheCourse ─── */
function InsideTheCourse() {
  return (
    <Section id="preview" py={140} style={{ borderBottom: "1px solid var(--line)" }}>
      <H
        num="03"
        label="Inside the course"
        title={<>Twelve lessons. <em style={{ color: "var(--acid)" }}>All locked.</em></>}
        sub="Sign up and the entire curriculum unlocks — plus the one-page worksheet I use to plan my own trades every week. No charge. No upsell at the door."
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {LESSONS.map((l, i) => <LessonCard key={i} idx={i} lesson={l} />)}
      </div>
      <div style={{ marginTop: 28, padding: "20px 26px", border: "1px solid var(--acid)", background: "var(--bg-1)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, flexWrap: "wrap", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(600px 200px at 0% 50%, rgba(191,250,70,0.08), transparent 60%)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
          <span className="pulse" style={{ width: 8, height: 8, background: "var(--acid)" }} />
          <ML>· All 12 lessons unlock at sign-up · 100% free ·</ML>
        </div>
        <a href="#unlock" className="btn" style={{ position: "relative" }}>Get Free Access →</a>
      </div>
    </Section>
  );
}

/* ─── LifestyleBand ─── */
function LifestyleBand() {
  return (
    <section style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid var(--line)" }}>
      <div style={{ position: "relative", aspectRatio: "21/9", background: "var(--bg-1)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/uploads/cam/poolside-laptop.jpg" alt="Cameron Fous — working poolside"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(6,7,10,0.92) 0%, rgba(6,7,10,0.62) 40%, rgba(6,7,10,0) 70%)" }} />
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 48px", position: "absolute", inset: 0, display: "flex", alignItems: "center" }}>
          <div style={{ maxWidth: 720 }}>
            <ML style={{ marginBottom: 22 }}>· What 1 day per week looks like ·</ML>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 72, lineHeight: 0.96, letterSpacing: "-0.045em", color: "var(--bone)", marginBottom: 22 }}>
              The plan is set.<br />
              <em style={{ color: "var(--acid)", textShadow: "0 0 36px rgba(191,250,70,0.35)" }}>The trade runs without me.</em>
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 18, lineHeight: 1.55, color: "var(--bone)", opacity: 0.85, margin: 0, maxWidth: 560, fontWeight: 400 }}>
              Entries, stops, take-profits — all pre-placed Sunday morning. The market either fills the orders, or it doesn&rsquo;t. Either way, the week is mine.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── SignupModal ─── */
function SignupModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => { setForm({ first_name: "", last_name: "", email: "", phone: "" }); setStatus("idle"); setErrorMsg(""); }, 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/free-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
        }),
      });
      const data = await res.json().catch(() => ({ ok: false }));
      if (!res.ok || !data.ok) { setErrorMsg(data.error || "Something went wrong. Try again."); setStatus("error"); }
      else {
        posthog.identify(form.email.trim(), { first_name: form.first_name.trim(), email: form.email.trim() });
        posthog.capture("free_course_submitted", { first_name: form.first_name.trim(), email: form.email.trim() });
        // Redirect to broker offers (step 2 of 3) — works on both subdomain and direct domain
        const brokerPath =
          typeof window !== "undefined" && window.location.hostname.includes("free.")
            ? "/broker"
            : "/free-course/broker";
        window.location.href = brokerPath;
      }
    } catch {
      setErrorMsg("Network error. Check your connection and try again.");
      setStatus("error");
    }
  }

  if (!open) return null;

  const inputStyle: React.CSSProperties = { width: "100%", background: "var(--bg-2)", border: "1px solid var(--line-2)", color: "var(--bone)", padding: "16px 18px", fontFamily: "var(--font-mono)", fontSize: 14, letterSpacing: "0.04em", outline: "none", borderRadius: 0, transition: "border-color 160ms ease" };
  const labelStyle: React.CSSProperties = { display: "block", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", color: "var(--ash)", textTransform: "uppercase", marginBottom: 8 };
  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(v => ({ ...v, [k]: e.target.value }));
  const dis = status === "submitting";

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
    >
      <div style={{ position: "absolute", inset: 0, background: "rgba(6,7,10,0.88)", backdropFilter: "blur(16px)" }} onClick={onClose} />

      <div style={{ position: "relative", width: "100%", maxWidth: 540, background: "var(--bg-1)", border: "1px solid var(--acid)", boxShadow: "0 0 120px rgba(191,250,70,0.20)" }}>
        {/* header */}
        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <ML>· Get the free course ·</ML>
          <button onClick={onClose} style={{ background: "transparent", border: "1px solid var(--line-2)", color: "var(--ash)", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 14, flexShrink: 0 }}>✕</button>
        </div>

        {status === "success" ? (
          <div style={{ padding: "48px 40px", display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ width: 52, height: 52, background: "var(--acid)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 38, fontWeight: 600, color: "var(--bone)", letterSpacing: "-0.035em", lineHeight: 1.0 }}>
              You&apos;re in.
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 16, lineHeight: 1.6, color: "var(--ash)", margin: 0 }}>
              Access is being set up for <strong style={{ color: "var(--bone)" }}>{form.email}</strong>. You&apos;ll be redirected now.
            </p>
            <ML color="var(--acid)" style={{ fontSize: 10 }}>· 12 lessons · unlocked · zero charge ·</ML>
          </div>
        ) : (
          <form onSubmit={submit} style={{ padding: "32px 40px", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ marginBottom: 4 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 38, fontWeight: 600, color: "var(--bone)", letterSpacing: "-0.04em", lineHeight: 1.0, marginBottom: 8 }}>
                All 12 lessons.<br /><em style={{ color: "var(--acid)" }}>Unlock access now.</em>
              </div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--ash)", margin: 0, lineHeight: 1.55 }}>
                No credit card. No trial. Access unlocks the moment you register.
              </p>
            </div>
            {/* Row: First + Last */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>First Name</label>
                <input style={inputStyle} required value={form.first_name} onChange={f("first_name")} placeholder="Jane" disabled={dis} />
              </div>
              <div>
                <label style={labelStyle}>Last Name</label>
                <input style={inputStyle} value={form.last_name} onChange={f("last_name")} placeholder="Doe" disabled={dis} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Email Address</label>
              <input type="email" style={inputStyle} required value={form.email} onChange={f("email")} placeholder="you@operator.io" disabled={dis} />
            </div>
            <div>
              <label style={labelStyle}>Phone</label>
              <input type="tel" style={inputStyle} value={form.phone} onChange={f("phone")} placeholder="+1 (555) 000-0000" disabled={dis} />
            </div>
            <button type="submit" disabled={dis} className="btn btn-lg" style={{ fontSize: 14, padding: "20px 28px", border: 0, cursor: dis ? "wait" : "pointer", opacity: dis ? 0.6 : 1, width: "100%", justifyContent: "center", marginTop: 4 }}>
              {dis ? "Sending..." : "Send Me The Course →"}
            </button>
            {status === "error" && (
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--pink)", letterSpacing: "0.12em" }}>· {errorMsg} ·</div>
            )}
            <ML color="var(--muted)" style={{ fontSize: 9 }}>· Unsubscribe anytime · We don&rsquo;t sell your data ·</ML>
          </form>
        )}
      </div>
    </div>
  );
}

/* ─── SignupBlock ─── */
function SignupBlock() {
  return (
    <Section id="unlock" py={140}>
      <div style={{ background: "var(--bg-1)", border: "1px solid var(--acid)", position: "relative", overflow: "hidden", boxShadow: "0 0 80px rgba(191,250,70,0.12)", padding: "80px 64px" }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(900px 600px at 0% 50%, rgba(191,250,70,0.08), transparent 60%)" }} />
        <div style={{ position: "relative", maxWidth: 760 }}>
          <ML style={{ marginBottom: 22 }}>· Get the free course ·</ML>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 72, lineHeight: 0.96, letterSpacing: "-0.045em", color: "var(--bone)", margin: "0 0 28px" }}>
            All 12 lessons.<br /><em style={{ color: "var(--acid)" }}>Zero charge.</em>
          </h2>
          <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap", marginBottom: 32 }}>
            <a href="#unlock" className="btn btn-lg">Get Free Access →</a>
            <ML color="var(--ash)" style={{ fontSize: 10 }}>· No card · no trial · no upsell at the door ·</ML>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 28, borderTop: "1px solid var(--line)" }}>
            {["All 12 lessons · unlocked instantly", "The one-page weekly planning worksheet", "No credit card · no trial · no upsell at the door"].map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--acid)", lineHeight: 1, minWidth: 18 }}>✓</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--bone)", fontWeight: 500 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--line)", padding: "64px 0 40px" }}>
      <Wrap>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24, marginBottom: 40 }}>
          <Logo />
          <a href="#unlock" className="btn">Get Free Access →</a>
        </div>
        <div style={{ padding: "24px 0", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", marginBottom: 24 }}>
          <ML color="var(--pink)" style={{ marginBottom: 12 }}>· Reality check ·</ML>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 12, lineHeight: 1.65, color: "var(--muted)", margin: 0, maxWidth: 1100, fontWeight: 400 }}>
            Results shown reflect individual outcomes — their capital, their risk, their screen time, not yours. Trading involves real risk of loss; most who attempt it lose money. The Cipher is educational and teaches a system; it does not guarantee any outcome. Nothing on this page is financial advice. If you can&rsquo;t afford to lose the capital you trade, do not trade it.
          </p>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", letterSpacing: "0.22em", textTransform: "uppercase" }}>
          <span>© 2026 · Quantum Cipher Lab · All Rights Reserved</span>
          <span>· Decode · Trade · Compound ·</span>
        </div>
      </Wrap>
    </footer>
  );
}

/* ─── Page ─── */
export default function FreeCourse() {
  const [modalOpen, setModalOpen] = useState(false);
  const closeModal = useCallback(() => setModalOpen(false), []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const link = (e.target as Element).closest('a[href="#unlock"]');
      if (link) {
        e.preventDefault();
        posthog.capture("free_course_cta_clicked", {
          cta_text: (link as HTMLElement).innerText?.trim() ?? "",
        });
        setModalOpen(true);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <>
      <SignupModal open={modalOpen} onClose={closeModal} />
      <Lightbox />
      <StickyBar />
      <Hero />
      <MeetCameron />
      <ApplyBand caption="Free · No card · 12 lessons · Sent in order" subline="Plus the weekly worksheet I use to plan my own trades." />
      <CaseStudies />
      <Premise />
      <Proof />
      <ApplyBand caption="Stop chasing influencers · start operating" />
      <TheMethod />
      <InsideTheCourse />
      <LifestyleBand />
      <SignupBlock />
      <Footer />
    </>
  );
}
