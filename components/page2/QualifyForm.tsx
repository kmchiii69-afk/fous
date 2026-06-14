"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import posthog from "posthog-js";
import { useRouter, useSearchParams } from "next/navigation";

// ─── Question definitions ─────────────────────────────────────────

type ChoiceQuestion = {
  id: string;
  type: "choice";
  label: string;
  helper?: string;
  options: string[];
};

type MultiQuestion = {
  id: string;
  type: "multi";
  label: string;
  helper?: string;
  options: string[];
};

type ScaleQuestion = {
  id: string;
  type: "scale";
  label: string;
  helper?: string;
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
};

type TextQuestion = {
  id: string;
  type: "text";
  label: string;
  helper?: string;
  placeholder?: string;
  longform?: boolean;
  /** When true the user can hit Next without filling the field. */
  optional?: boolean;
};

type ConsentQuestion = {
  id: string;
  type: "consent";
  label: string;
  helper?: string;
  body: string;
};

type Question = ChoiceQuestion | MultiQuestion | ScaleQuestion | TextQuestion | ConsentQuestion;

const QUESTIONS: Question[] = [
  {
    id: "trading_length",
    type: "choice",
    label: "How long have you been trading?",
    options: ["Less than 6 months", "6–12 months", "1–2 years", "2+ years"],
  },
  {
    id: "profitable_month",
    type: "choice",
    label: "Have you ever had a profitable trading month?",
    options: ["No, not yet", "Yes, once", "Yes, a few times", "Yes, consistently for 6+ months"],
  },
  {
    id: "markets",
    type: "choice",
    label: "What markets have you traded?",
    options: ["Crypto", "Forex", "Stocks", "Futures", "Multi Asset Trader"],
  },
  {
    id: "current_style",
    type: "choice",
    label: "How are you currently trading?",
    options: [
      "I day-trade full-time (at the screen during sessions)",
      "I day-trade part-time and it's grinding me down",
      "I tried day trading and burned out / blew up",
      "I swing-trade already (multi-day holds)",
      "Mix of both",
      "Haven't started actively trading yet",
    ],
  },
  {
    id: "blocker",
    type: "multi",
    label: "What's actually holding you back?",
    helper: "Select all that apply",
    options: [
      "The time commitment — 8+ hrs glued to the screen",
      "Emotional toll · stress · FOMO · revenge trades",
      "Too many gurus / signals / ICT-SMC noise",
      "My day job conflicts with market hours",
      "I have no real system at all",
      "I keep blowing up accounts",
      "Not enough capital yet",
    ],
  },
  {
    id: "education_spend",
    type: "choice",
    label: "How much have you invested in trading education so far?",
    options: ["$0", "Less than $500", "$500 – $2k", "$2k – $5k", "$5k+"],
  },
  {
    id: "trading_plan",
    type: "choice",
    label: "Do you currently follow a written trading plan?",
    options: [
      "Yes, and I follow it on most trades",
      "I have one, but I rarely follow it",
      "No — I trade based on what I see / feel",
    ],
  },
  {
    id: "hours_per_week",
    type: "choice",
    label: "How many hours per week can you realistically dedicate to trading + study?",
    options: ["Less than 5", "5–10", "10–20", "20+"],
  },
  {
    id: "monthly_income_goal",
    type: "choice",
    label: "What monthly income from trading would meaningfully change your life?",
    options: ["$1k – $2k", "$2k – $5k", "$5k – $10k", "$10k+"],
  },
  {
    id: "investment_tier",
    type: "choice",
    label: "If this turns out to be exactly the right fit, what could you realistically invest in building this skill?",
    helper: "There are no right or wrong answers — be honest. We'll route you to the program that matches.",
    options: ["$7,500+", "$5,000 – $7,500", "$2,500 – $5,000", "$500 – $2,500"],
  },
  {
    id: "extra_income_dream",
    type: "text",
    label: "What would that extra income allow you to do that you can't do now?",
    helper: "One sentence is fine.",
    placeholder: "Take my family on the trips we've been putting off…",
    longform: true,
  },
];

// Contact questions — only shown when the visitor lands on /qualify without
// the email URL param (≈22% of traffic). Without these the submit endpoint
// rejects the application with "Missing email" after they've answered
// everything.
const CONTACT_QUESTIONS: Question[] = [
  {
    id: "contact_first_name",
    type: "text",
    label: "First, what should we call you?",
    placeholder: "Your first name",
  },
  {
    id: "contact_email",
    type: "text",
    label: "And your best email?",
    helper: "Your results + next step land here",
    placeholder: "you@example.com",
  },
];

// ─── Component ────────────────────────────────────────────────────

type Answer = string | number | boolean | string[] | null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isComplete(q: Question, value: Answer): boolean {
  // Optional text questions are always "complete" so the user can skip
  // them with the Next button even when blank.
  if (q.type === "text" && q.optional) return true;
  if (value === null || value === undefined || value === "") return false;
  if (q.id === "contact_email") return EMAIL_RE.test(String(value).trim());
  if (q.type === "consent") return value === true;
  if (q.type === "multi") return Array.isArray(value) && value.length > 0;
  return true;
}

function buildTierForRouting(value: Answer): string {
  if (typeof value === "string" && value.trim().startsWith("$500")) return value;
  return typeof value === "string" ? value : "";
}

export default function QualifyForm() {
  const router = useRouter();
  const sp = useSearchParams();

  // Prefill from URL params (carried from Page 1 → /training → here)
  const firstName = useMemo(() => sp.get("first_name") || "", [sp]);
  const lastName = useMemo(() => sp.get("last_name") || "", [sp]);
  const email = useMemo(() => sp.get("email") || "", [sp]);
  const phone = useMemo(() => sp.get("phone") || "", [sp]);

  const [rawStep, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const startedRef = useRef(false);

  // Live question list. Two dynamic pieces:
  //  - Contact questions are prepended when the visitor arrived without an
  //    email URL param — otherwise the API rejects their submission after
  //    they've answered everything.
  //  - The income-dream essay is only asked of call-routed (non-Wolfpack)
  //    tiers. Wolfpack signups never get a call, so nobody reads their
  //    essay — and it was the survey's #2 drop-off point.
  const tierAnswer = answers["investment_tier"];
  const questions = useMemo(() => {
    const list: Question[] = [];
    if (!email) list.push(...CONTACT_QUESTIONS);
    for (const qd of QUESTIONS) {
      if (
        qd.id === "extra_income_dream" &&
        (typeof tierAnswer !== "string" || tierAnswer.trim().startsWith("$500"))
      ) continue;
      list.push(qd);
    }
    return list;
  }, [email, tierAnswer]);

  const total = questions.length;
  // Clamp: the list shrinks if the user backtracks and switches to the
  // Wolfpack tier while sitting on the (now removed) essay step.
  const step = Math.min(rawStep, total - 1);
  const q = questions[step];
  const value = answers[q.id] ?? null;
  const filled = isComplete(q, value);
  const progress = ((step + (filled ? 1 : 0.4)) / total) * 100;

  const setAnswer = useCallback((id: string, v: Answer) => {
    if (!startedRef.current) {
      startedRef.current = true;
      posthog.capture("qualify_form_started");
    }
    setAnswers((prev) => ({ ...prev, [id]: v }));
  }, []);

  const submit = useCallback(async () => {
    setSubmitting(true);
    setError(null);
    try {
      // Contact details come from the URL params when present, otherwise
      // from the prepended contact questions.
      const effFirstName = firstName || String(answers["contact_first_name"] ?? "").trim();
      const effEmail = (email || String(answers["contact_email"] ?? "")).trim().toLowerCase();
      const payloadAnswers: Record<string, Answer> = { consent: true };
      for (const [k, v] of Object.entries(answers)) {
        if (!k.startsWith("contact_")) payloadAnswers[k] = v;
      }

      const res = await fetch("/api/qualify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: effFirstName,
          last_name: lastName,
          email: effEmail,
          phone,
          // Submitting the form IS the TCPA consent — the disclosure shown
          // under the Submit button makes this an explicit affirmative act.
          answers: payloadAnswers,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || `Request failed (${res.status})`);
      }

      const tier = buildTierForRouting(answers["investment_tier"] ?? null);
      // Tier decides routing; the server adds whether this lead should see
      // the regional (low-PPP) Wolfpack offer.
      const routedWolfpack = data?.tier_routed
        ? data.tier_routed === "wolfpack"
        : tier.startsWith("$500");
      if (effEmail) posthog.identify(effEmail, { email: effEmail, first_name: effFirstName });
      posthog.capture("qualify_form_submitted", {
        investment_tier: answers["investment_tier"] ?? null,
        trading_length: answers["trading_length"] ?? null,
        routing: routedWolfpack ? "wolfpack" : "book",
        intl_offer: data?.intl_offer === true,
      });
      const params = new URLSearchParams();
      params.set("route", routedWolfpack ? "wolfpack" : "book");
      if (data?.intl_offer === true) params.set("intl", "1");
      if (tier) params.set("tier", tier);
      if (effFirstName) params.set("first_name", effFirstName);
      if (lastName) params.set("last_name", lastName);
      if (effEmail) params.set("email", effEmail);
      if (phone) params.set("phone", phone);
      router.push(`/qualified?${params.toString()}`);
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    }
  }, [answers, firstName, lastName, email, phone, router]);

  const goNext = useCallback(() => {
    if (!filled) return;
    if (step < total - 1) {
      setDirection("forward");
      setStep(step + 1);
    } else {
      submit();
    }
  }, [filled, step, total, submit]);

  const goBack = useCallback(() => {
    if (step === 0) return;
    setDirection("back");
    setStep(step - 1);
  }, [step]);

  // Auto-advance for single-choice questions (small delay so user sees selection).
  // Multi-choice questions require the user to click Next so they can pick more
  // than one option.
  useEffect(() => {
    if (q.type !== "choice" || !filled) return;
    const id = window.setTimeout(() => {
      if (step < total - 1) {
        setDirection("forward");
        setStep((s) => (s === step ? s + 1 : s));
      }
    }, 320);
    return () => window.clearTimeout(id);
    // intentionally only on answer change of the active question
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, q.type, step]);

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      if (e.key === "Enter") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft" || (e.key === "Backspace" && tag !== "input" && tag !== "textarea")) {
        e.preventDefault();
        goBack();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goBack]);

  const isFinal = step === total - 1;
  const slideOffset = direction === "forward" ? 14 : -14;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Progress + step counter */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--ash)", letterSpacing: "0.22em", textTransform: "uppercase" }}>
            · Question {step + 1} of {total} ·
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--acid)", letterSpacing: "0.22em", textTransform: "uppercase" }}>
            {Math.round(progress)}%
          </div>
        </div>
        <div style={{ width: "100%", height: 3, background: "var(--line)", overflow: "hidden" }}>
          <div style={{ width: `${progress}%`, height: "100%", background: "var(--acid)", transition: "width 280ms cubic-bezier(0.2,0.8,0.2,1)", boxShadow: "0 0 18px rgba(191,250,70,0.5)" }} />
        </div>
      </div>

      {/* Question */}
      <div
        key={q.id}
        style={{
          animation: `qcSlideIn 320ms cubic-bezier(0.2,0.8,0.2,1) both`,
          transform: `translateY(${slideOffset}px)`,
        }}
      >
        <style>{`@keyframes qcSlideIn { from { opacity: 0; transform: translateY(${slideOffset}px); } to { opacity: 1; transform: translateY(0); } }`}</style>

        {q.helper && (
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--ash)", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 12 }}>
            · {q.helper}
          </div>
        )}

        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 36, lineHeight: 1.1, letterSpacing: "-0.025em", color: "var(--bone)", margin: "0 0 28px" }}>
          {q.label}
        </h2>

        {q.type === "choice" && <ChoiceView question={q} value={value as string | null} onSelect={(v) => setAnswer(q.id, v)} />}
        {q.type === "multi" && <MultiChoiceView question={q} value={(value as string[]) ?? []} onToggle={(v) => setAnswer(q.id, v)} />}
        {q.type === "scale" && <ScaleView question={q} value={value as number | null} onSelect={(v) => setAnswer(q.id, v)} />}
        {q.type === "text" && <TextView question={q} value={(value as string) ?? ""} onChange={(v) => setAnswer(q.id, v)} />}
        {q.type === "consent" && <ConsentView question={q} value={value === true} onToggle={(v) => setAnswer(q.id, v)} />}
      </div>

      {/* Error */}
      {error && (
        <div role="alert" style={{ padding: "12px 16px", background: "rgba(255,45,171,0.10)", border: "1px solid var(--pink)", color: "var(--bone)", fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.5 }}>
          {error}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 28, borderTop: "1px solid var(--line)" }}>
        <button
          onClick={goBack}
          disabled={step === 0 || submitting}
          style={{
            padding: "12px 18px",
            background: "transparent",
            border: "1px solid var(--line-2)",
            color: step === 0 ? "var(--muted)" : "var(--bone)",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            cursor: step === 0 ? "default" : "pointer",
            opacity: step === 0 ? 0.4 : 1,
          }}
        >
          ← Back
        </button>

        <button
          onClick={goNext}
          disabled={!filled || submitting}
          style={{
            padding: isFinal ? "16px 26px" : "14px 22px",
            background: filled ? "var(--acid)" : "var(--bg-2)",
            border: 0,
            color: filled ? "var(--bg)" : "var(--muted)",
            fontFamily: "var(--font-mono)",
            fontSize: isFinal ? 13 : 12,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            cursor: filled && !submitting ? "pointer" : "default",
            boxShadow: filled ? "0 0 0 1px var(--acid), 0 0 32px rgba(191,250,70,0.25)" : "none",
            transition: "all 200ms ease",
          }}
        >
          {submitting ? "Submitting..." : isFinal ? "Submit Application →" : "Next →"}
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 16, fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.22em", textTransform: "uppercase" }}>
        <span>· Enter to advance ·</span>
        <span>· ← back ·</span>
      </div>

      {/* Inline TCPA + privacy disclosure on the final screen only.
          Submitting the form IS the affirmative consent — this footnote
          tells the user what they're agreeing to without forcing them
          through a dedicated consent screen. */}
      {isFinal && (
        <p style={{ marginTop: 4, fontFamily: "var(--font-body)", fontSize: 11, lineHeight: 1.55, color: "var(--muted)", textAlign: "center", maxWidth: 580, marginLeft: "auto", marginRight: "auto" }}>
          By submitting, you agree to be contacted by Quantum Cipher Lab via
          email, SMS, or phone about our services. Message + data rates may
          apply. See our{" "}
          <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--ash)", textDecoration: "underline" }}>Privacy Policy</a>.
        </p>
      )}
    </div>
  );
}

// ─── Question views ───────────────────────────────────────────────

function ChoiceView({ question, value, onSelect }: { question: ChoiceQuestion; value: string | null; onSelect: (v: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {question.options.map((opt, i) => {
        const selected = value === opt;
        const letter = String.fromCharCode(65 + i);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onSelect(opt)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "16px 20px",
              background: selected ? "rgba(191,250,70,0.08)" : "var(--bg-1)",
              border: `1px solid ${selected ? "var(--acid)" : "var(--line-2)"}`,
              color: "var(--bone)",
              textAlign: "left",
              fontFamily: "var(--font-body)",
              fontSize: 16,
              lineHeight: 1.4,
              cursor: "pointer",
              transition: "all 160ms ease",
              boxShadow: selected ? "0 0 0 1px var(--acid), 0 0 32px rgba(191,250,70,0.15)" : "none",
            }}
            onMouseEnter={(e) => {
              if (!selected) (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--acid)";
            }}
            onMouseLeave={(e) => {
              if (!selected) (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--line-2)";
            }}
          >
            <span
              aria-hidden
              style={{
                width: 28,
                height: 28,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: selected ? "var(--acid)" : "var(--bg-2)",
                border: `1px solid ${selected ? "var(--acid)" : "var(--line-2)"}`,
                color: selected ? "var(--bg)" : "var(--ash)",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.04em",
              }}
            >
              {letter}
            </span>
            <span style={{ flex: 1 }}>{opt}</span>
            {selected && (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--acid)" strokeWidth="2">
                <polyline points="3,7 6,10 11,4" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}

function MultiChoiceView({ question, value, onToggle }: { question: MultiQuestion; value: string[]; onToggle: (next: string[]) => void }) {
  function toggle(opt: string) {
    if (value.includes(opt)) onToggle(value.filter((v) => v !== opt));
    else onToggle([...value, opt]);
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {question.options.map((opt, i) => {
        const selected = value.includes(opt);
        const letter = String.fromCharCode(65 + i);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "16px 20px",
              background: selected ? "rgba(191,250,70,0.08)" : "var(--bg-1)",
              border: `1px solid ${selected ? "var(--acid)" : "var(--line-2)"}`,
              color: "var(--bone)",
              textAlign: "left",
              fontFamily: "var(--font-body)",
              fontSize: 16,
              lineHeight: 1.4,
              cursor: "pointer",
              transition: "all 160ms ease",
              boxShadow: selected ? "0 0 0 1px var(--acid), 0 0 32px rgba(191,250,70,0.15)" : "none",
            }}
            onMouseEnter={(e) => {
              if (!selected) (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--acid)";
            }}
            onMouseLeave={(e) => {
              if (!selected) (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--line-2)";
            }}
          >
            {/* Letter chip doubles as the checkbox indicator */}
            <span
              aria-hidden
              style={{
                width: 28,
                height: 28,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: selected ? "var(--acid)" : "var(--bg-2)",
                border: `1px solid ${selected ? "var(--acid)" : "var(--line-2)"}`,
                color: selected ? "var(--bg)" : "var(--ash)",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.04em",
              }}
            >
              {selected ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--bg)" strokeWidth="2.4">
                  <polyline points="3,7 6,10 11,4" />
                </svg>
              ) : (
                letter
              )}
            </span>
            <span style={{ flex: 1 }}>{opt}</span>
          </button>
        );
      })}
    </div>
  );
}

function ScaleView({ question, value, onSelect }: { question: ScaleQuestion; value: number | null; onSelect: (v: number) => void }) {
  const nums = Array.from({ length: question.max - question.min + 1 }, (_, i) => i + question.min);
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${nums.length}, 1fr)`, gap: 8, marginBottom: 14 }}>
        {nums.map((n) => {
          const selected = value === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onSelect(n)}
              style={{
                padding: "16px 0",
                background: selected ? "var(--acid)" : "var(--bg-1)",
                border: `1px solid ${selected ? "var(--acid)" : "var(--line-2)"}`,
                color: selected ? "var(--bg)" : "var(--bone)",
                fontFamily: "var(--font-display)",
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: "-0.01em",
                cursor: "pointer",
                transition: "all 160ms ease",
                boxShadow: selected ? "0 0 0 1px var(--acid), 0 0 32px rgba(191,250,70,0.25)" : "none",
              }}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--ash)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
        <span>{question.min} · {question.minLabel}</span>
        <span>{question.maxLabel} · {question.max}</span>
      </div>
    </div>
  );
}

function TextView({ question, value, onChange }: { question: TextQuestion; value: string; onChange: (v: string) => void }) {
  if (question.longform) {
    return (
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.placeholder || ""}
        autoFocus
        style={{
          width: "100%",
          background: "var(--bg-1)",
          border: "1px solid var(--line-2)",
          color: "var(--bone)",
          padding: "16px 20px",
          fontFamily: "var(--font-body)",
          fontSize: 16,
          lineHeight: 1.55,
          outline: "none",
          resize: "vertical",
          borderRadius: 0,
        }}
        maxLength={2000}
      />
    );
  }
  return (
    <input
      type={question.id === "contact_email" ? "email" : "text"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={question.placeholder || ""}
      autoFocus
      maxLength={500}
      style={{
        width: "100%",
        background: "var(--bg-1)",
        border: "1px solid var(--line-2)",
        color: "var(--bone)",
        padding: "16px 20px",
        fontFamily: "var(--font-body)",
        fontSize: 16,
        outline: "none",
        borderRadius: 0,
      }}
    />
  );
}

function ConsentView({ question, value, onToggle }: { question: ConsentQuestion; value: boolean; onToggle: (v: boolean) => void }) {
  return (
    <div>
      <div style={{ background: "var(--bg-1)", border: "1px solid var(--line)", padding: "20px 24px", marginBottom: 18, fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.6, color: "var(--ash)" }}>
        I confirm I received and agree to the following terms:{" "}
        <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--acid)" }}>Privacy Policy</a>,{" "}
        <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: "var(--acid)" }}>Terms of Service</a>,{" "}
        <a href="/refund" target="_blank" rel="noopener noreferrer" style={{ color: "var(--acid)" }}>Refund Policy</a>,{" "}
        and{" "}
        <a href="/disclaimer" target="_blank" rel="noopener noreferrer" style={{ color: "var(--acid)" }}>Disclaimer</a>{" "}
        — and I give consent to be contacted by Quantum Cipher Lab via email, SMS, or phone regarding its services.{" "}
        <span style={{ color: "var(--bone)" }}>I understand this consent is not a condition of purchase.</span>
      </div>

      <button
        type="button"
        onClick={() => onToggle(!value)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          width: "100%",
          padding: "16px 20px",
          background: value ? "rgba(191,250,70,0.10)" : "var(--bg-1)",
          border: `1px solid ${value ? "var(--acid)" : "var(--line-2)"}`,
          color: "var(--bone)",
          fontFamily: "var(--font-body)",
          fontSize: 16,
          fontWeight: 600,
          cursor: "pointer",
          textAlign: "left",
          transition: "all 160ms ease",
          boxShadow: value ? "0 0 0 1px var(--acid), 0 0 32px rgba(191,250,70,0.15)" : "none",
        }}
      >
        <span
          aria-hidden
          style={{
            width: 24,
            height: 24,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: value ? "var(--acid)" : "var(--bg-2)",
            border: `1px solid ${value ? "var(--acid)" : "var(--line-2)"}`,
            flexShrink: 0,
          }}
        >
          {value && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--bg)" strokeWidth="2.4">
              <polyline points="3,7 6,10 11,4" />
            </svg>
          )}
        </span>
        I Agree
      </button>
    </div>
  );
}
