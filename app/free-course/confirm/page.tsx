"use client";

import { useState, useEffect } from "react";
import posthog from "posthog-js";

/* ─── data ─── */
const PLAYLIST_URL =
  "https://www.youtube.com/watch?v=yuTjmDL9GHw&list=PLboypRAkNT7YZIJZT2nfySZnvKLVjHUHK";

const LESSONS = [
  {
    n: "01", vid: "yuTjmDL9GHw", dur: "7 min",
    title: "Give Me 7 Minutes — I'll Improve Your Trading By 176%",
    tag: "The Premise", stat: "+176%",
    href: "https://www.youtube.com/watch?v=yuTjmDL9GHw&list=PLboypRAkNT7YZIJZT2nfySZnvKLVjHUHK",
    featured: true,
  },
  {
    n: "02", vid: "xWM-EgM36WI", dur: "37 min",
    title: "$20K to $1.75M in 420 Days · The 100× Crypto Strategy",
    tag: "Case Study", stat: "$1.75M",
    href: "https://www.youtube.com/watch?v=xWM-EgM36WI&list=PLboypRAkNT7YZIJZT2nfySZnvKLVjHUHK",
    featured: false,
  },
  {
    n: "03", vid: "1kthmhMf-mw", dur: "17 min",
    title: "How To Win Without Luck, Talent, Or Being A Genius",
    tag: "Mindset", stat: "No talent",
    href: "https://www.youtube.com/watch?v=1kthmhMf-mw&list=PLboypRAkNT7YZIJZT2nfySZnvKLVjHUHK",
    featured: false,
  },
  {
    n: "04", vid: "gQco5FCZJvE", dur: "37 min",
    title: "Day In The Life · 7-Figure Trader Banks $302K On XRP",
    tag: "Case Study", stat: "$302K",
    href: "https://www.youtube.com/watch?v=gQco5FCZJvE&list=PLboypRAkNT7YZIJZT2nfySZnvKLVjHUHK",
    featured: false,
  },
  {
    n: "05", vid: "R_EG8vscTGw", dur: "46 min",
    title: "How To Swing Trade Crypto · The Blueprint That Made Me $1.2M",
    tag: "The Blueprint", stat: "$1.2M",
    href: "https://www.youtube.com/watch?v=R_EG8vscTGw&list=PLboypRAkNT7YZIJZT2nfySZnvKLVjHUHK",
    featured: false,
  },
] as const;

/* ─── Logo ─── */
function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
      <svg width="26" height="26" viewBox="0 0 28 28" fill="none" style={{ flexShrink: 0 }}>
        <rect x="0.5" y="0.5" width="27" height="27" stroke="var(--acid)" strokeWidth="1" />
        <rect x="7" y="7" width="14" height="14" fill="var(--acid)" />
        <rect x="11" y="11" width="6" height="6" fill="var(--bg)" />
      </svg>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--bone)", letterSpacing: "0.18em", textTransform: "uppercase" as const }}>
        Quantum Cipher
      </span>
    </div>
  );
}

/* ─── LessonCard ─── */
function LessonCard({ lesson }: { lesson: typeof LESSONS[number] }) {
  const [hovered, setHovered] = useState(false);
  const thumb = `https://img.youtube.com/vi/${lesson.vid}/maxresdefault.jpg`;

  return (
    <a
      href={lesson.href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "block",
        position: "relative",
        overflow: "hidden",
        border: lesson.featured
          ? `1px solid var(--acid)`
          : `1px solid ${hovered ? "var(--line-2)" : "var(--line)"}`,
        textDecoration: "none",
        transition: "border-color 200ms ease",
        boxShadow: lesson.featured
          ? "0 0 80px rgba(191,250,70,0.12), 0 0 0 1px rgba(191,250,70,0.08)"
          : "none",
      }}
    >
      {/* Thumbnail area */}
      <div style={{ position: "relative", overflow: "hidden", aspectRatio: "16/9" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumb}
          alt={lesson.title}
          style={{
            width: "100%", height: "100%", objectFit: "cover", display: "block",
            transition: "transform 500ms cubic-bezier(0.2,0.8,0.2,1)",
            transform: hovered ? "scale(1.05)" : "scale(1)",
          }}
        />
        {/* Gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(6,7,10,0.92) 0%, rgba(6,7,10,0.35) 55%, rgba(6,7,10,0.08) 100%)",
          transition: "opacity 200ms ease",
          opacity: hovered ? 0.85 : 1,
        }} />

        {/* Play button */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: `translate(-50%, -50%) scale(${hovered ? 1.12 : 1})`,
          transition: "transform 240ms cubic-bezier(0.2,0.8,0.2,1), opacity 240ms ease",
          opacity: hovered ? 1 : 0.75,
          width: lesson.featured ? 68 : 52,
          height: lesson.featured ? 68 : 52,
          background: lesson.featured ? "var(--acid)" : "rgba(0,0,0,0.55)",
          border: `1px solid ${lesson.featured ? "var(--acid)" : "rgba(191,250,70,0.5)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(6px)",
          flexShrink: 0,
        }}>
          <svg
            width={lesson.featured ? 22 : 16}
            height={lesson.featured ? 22 : 16}
            viewBox="0 0 20 20"
            fill="none"
          >
            <polygon
              points="5,3 17,10 5,17"
              fill={lesson.featured ? "var(--bg)" : "var(--acid)"}
            />
          </svg>
        </div>

        {/* Stat badge (top-left) */}
        <div style={{
          position: "absolute", top: 12, left: 12,
          fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
          color: "var(--acid)",
          background: "rgba(6,7,10,0.82)",
          padding: "4px 10px",
          letterSpacing: "0.12em",
          border: "1px solid rgba(191,250,70,0.25)",
          backdropFilter: "blur(4px)",
        }}>
          {lesson.stat}
        </div>

        {/* Duration badge (bottom-right) */}
        <div style={{
          position: "absolute", bottom: 12, right: 12,
          fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
          color: lesson.featured ? "var(--bg)" : "var(--bone)",
          background: lesson.featured ? "var(--acid)" : "rgba(6,7,10,0.82)",
          padding: "4px 9px",
          letterSpacing: "0.1em",
          backdropFilter: "blur(4px)",
        }}>
          {lesson.dur}
        </div>

        {/* Featured START HERE badge */}
        {lesson.featured && (
          <div style={{
            position: "absolute", top: 12, right: 12,
            fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700,
            color: "var(--bg)",
            background: "var(--acid)",
            padding: "4px 10px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}>
            START HERE
          </div>
        )}
      </div>

      {/* Card footer */}
      <div style={{
        padding: lesson.featured ? "20px 24px 22px" : "16px 18px 18px",
        background: lesson.featured ? "rgba(191,250,70,0.035)" : "var(--bg-1)",
        borderTop: lesson.featured ? "1px solid rgba(191,250,70,0.18)" : "1px solid var(--line)",
      }}>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700,
          color: lesson.featured ? "var(--acid)" : "var(--muted)",
          letterSpacing: "0.22em", textTransform: "uppercase" as const,
          marginBottom: lesson.featured ? 10 : 8,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span>LESSON {lesson.n}</span>
          <span style={{ width: 12, height: 1, background: lesson.featured ? "var(--acid)" : "var(--line-2)", display: "inline-block" }} />
          <span>{lesson.tag}</span>
        </div>
        <div style={{
          fontFamily: "var(--font-display)",
          fontSize: lesson.featured ? 24 : 17,
          fontWeight: 600,
          color: "var(--bone)",
          letterSpacing: "-0.028em",
          lineHeight: 1.2,
          transition: "color 160ms ease",
        }}>
          {lesson.title}
        </div>
      </div>
    </a>
  );
}

/* ─── Page ─── */
export default function FreeCourseConfirm() {
  useEffect(() => {
    posthog.capture("free_course_confirm_viewed");
  }, []);

  return (
    <>
      <style>{`
        .confirm-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }
        @media (max-width: 720px) {
          .confirm-grid { grid-template-columns: 1fr; }
          .confirm-hero-h1 { font-size: 64px !important; }
          .confirm-wrap { padding: 0 24px !important; }
          .confirm-cta-row { flex-direction: column !important; align-items: flex-start !important; }
        }
        @media (max-width: 480px) {
          .confirm-hero-h1 { font-size: 48px !important; }
        }
        .lesson-link:hover .lesson-title { color: var(--acid) !important; }
        .confirm-playlist-link:hover { color: var(--acid) !important; }
      `}</style>

      <main style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--bone)" }}>

        {/* ── HEADER ── */}
        <header style={{ borderBottom: "1px solid var(--line)", padding: "18px 0" }}>
          <div className="confirm-wrap" style={{ maxWidth: 1240, margin: "0 auto", padding: "0 48px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Logo />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="pulse" style={{ display: "inline-block", width: 6, height: 6, background: "var(--acid)", flexShrink: 0 }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--acid)", letterSpacing: "0.22em", textTransform: "uppercase" as const }}>
                · Access Granted ·
              </span>
            </div>
          </div>
        </header>

        {/* ── HERO ── */}
        <section style={{ padding: "72px 0 64px", borderBottom: "1px solid var(--line)", position: "relative", overflow: "hidden" }}>
          {/* Background glow */}
          <div style={{
            position: "absolute", top: -120, left: "50%", transform: "translateX(-50%)",
            width: 900, height: 500,
            background: "radial-gradient(ellipse at center, rgba(191,250,70,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          <div className="confirm-wrap" style={{ maxWidth: 1240, margin: "0 auto", padding: "0 48px", position: "relative" }}>
            {/* Confirmed badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
              <div style={{
                width: 34, height: 34, background: "var(--acid)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--bg)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="13 4 6 11 3 8" />
                </svg>
              </div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", color: "var(--acid)", textTransform: "uppercase" as const }}>
                · Registration Confirmed ·
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 48, alignItems: "start" }}>
              <div>
                {/* H1 */}
                <h1
                  className="confirm-hero-h1"
                  style={{
                    fontFamily: "var(--font-display)", fontWeight: 600,
                    fontSize: 88, lineHeight: 0.92, letterSpacing: "-0.055em",
                    color: "var(--bone)", margin: "0 0 28px",
                  }}
                >
                  Your free<br />
                  <em style={{ color: "var(--acid)", fontStyle: "italic" }}>course</em>
                  <br />is ready.
                </h1>

                {/* Sub */}
                <p style={{
                  fontFamily: "var(--font-body)", fontSize: 18, lineHeight: 1.65,
                  color: "var(--ash)", margin: "0 0 32px", maxWidth: 560,
                }}>
                  5 free lessons. The exact framework behind 7-figure trades. Watch in order — each lesson builds on the last.
                </p>

                {/* Email note */}
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 12,
                  padding: "10px 16px",
                  background: "var(--bg-1)",
                  border: "1px solid var(--line-2)",
                  marginBottom: 36,
                }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="14" height="10" rx="1" />
                    <polyline points="1,3 8,9 15,3" />
                  </svg>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ash)", letterSpacing: "0.08em" }}>
                    You&apos;re registered. A confirmation is on its way to your email.
                  </span>
                </div>

                {/* CTA row */}
                <div className="confirm-cta-row" style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                  <a
                    href={LESSONS[0].href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                    style={{ fontSize: 13, padding: "15px 32px", letterSpacing: "0.14em" }}
                  >
                    WATCH LESSON 01 →
                  </a>
                  <a
                    href={PLAYLIST_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="confirm-playlist-link"
                    style={{
                      fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
                      color: "var(--muted)", letterSpacing: "0.18em",
                      textDecoration: "none", textTransform: "uppercase" as const,
                      transition: "color 160ms ease",
                    }}
                  >
                    VIEW FULL PLAYLIST ↗
                  </a>
                </div>
              </div>

              {/* Stats panel (desktop only) */}
              <div style={{
                background: "var(--bg-1)", border: "1px solid var(--line)",
                padding: "28px 32px", minWidth: 260,
              }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, color: "var(--acid)", letterSpacing: "0.22em", textTransform: "uppercase" as const, marginBottom: 20 }}>
                  · What&apos;s inside ·
                </div>
                {[
                  { label: "Total lessons",    val: "5 unlocked" },
                  { label: "Total runtime",    val: "~2.5 hours" },
                  { label: "Paid or trial",    val: "Zero. Free." },
                  { label: "More dropping",    val: "Lessons 6–12" },
                ].map((row, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "baseline",
                    padding: "10px 0",
                    borderBottom: i < 3 ? "1px solid var(--line)" : "none",
                    gap: 16,
                  }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", letterSpacing: "0.1em" }}>{row.label}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--bone)", letterSpacing: "0.08em", whiteSpace: "nowrap" as const }}>{row.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── LESSON LIBRARY ── */}
        <section style={{ padding: "72px 0 80px" }}>
          <div className="confirm-wrap" style={{ maxWidth: 1240, margin: "0 auto", padding: "0 48px" }}>

            {/* Section header */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 36 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", color: "var(--acid)", textTransform: "uppercase" as const, whiteSpace: "nowrap" as const }}>
                · The Cipher · Free Course ·
              </span>
              <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.18em", color: "var(--muted)", textTransform: "uppercase" as const, whiteSpace: "nowrap" as const }}>
                5 lessons · unlocked
              </span>
            </div>

            {/* Featured lesson 01 */}
            <div style={{ marginBottom: 14 }}>
              <LessonCard lesson={LESSONS[0]} />
            </div>

            {/* 2×2 grid for lessons 02–05 */}
            <div className="confirm-grid" style={{ marginBottom: 14 }}>
              {LESSONS.slice(1).map((l) => (
                <LessonCard key={l.n} lesson={l} />
              ))}
            </div>

            {/* Locked teaser bar */}
            <div style={{
              padding: "20px 24px",
              border: "1px solid var(--line)",
              background: "var(--bg-1)",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
              flexWrap: "wrap" as const,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" as const }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: "var(--muted)", textTransform: "uppercase" as const }}>
                  Lessons 06 – 12
                </span>
                <div style={{ width: 1, height: 14, background: "var(--line)" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.12em", color: "var(--muted)", textTransform: "uppercase" as const }}>
                  · Dropping soon · Stay subscribed ·
                </span>
              </div>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700,
                letterSpacing: "0.18em", color: "var(--muted)", textTransform: "uppercase" as const,
                padding: "5px 12px", border: "1px solid var(--line)", flexShrink: 0,
              }}>
                LOCKED
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop: "1px solid var(--line)", padding: "28px 0" }}>
          <div className="confirm-wrap" style={{ maxWidth: 1240, margin: "0 auto", padding: "0 48px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" as const }}>
            <Logo />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", letterSpacing: "0.18em", textTransform: "uppercase" as const }}>
              © 2026 · Quantum Cipher Lab · All Rights Reserved
            </span>
          </div>
        </footer>

      </main>
    </>
  );
}
