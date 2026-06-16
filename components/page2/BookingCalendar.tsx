"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import posthog from "posthog-js";

type Slot = { time: string; schedulingUrl: string };
type SlotsMap = Record<string, Slot[]>;

// Calendly iframe theme — matches QC brand, hides all branding + avatar
const CALENDLY_THEME = {
  background_color: "06070A",
  text_color: "F2F0E6",
  primary_color: "BFFA46",
  hide_event_type_details: "1",
  hide_landing_page_details: "1",
};

function buildConfirmUrl(schedulingUrl: string, name: string, email: string): string {
  const url = new URL(schedulingUrl);
  if (name) url.searchParams.set("name", name);
  if (email) url.searchParams.set("email", email);
  Object.entries(CALENDLY_THEME).forEach(([k, v]) => url.searchParams.set(k, v));
  return url.toString().replace(/\+/g, "%20");
}

function formatTime(iso: string, tz: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getLocalTimezone(): string {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return "America/New_York"; }
}

function getNextDays(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toLocaleDateString("en-CA"); // YYYY-MM-DD
  });
}

const POPULAR_TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Vancouver",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export default function BookingCalendar({
  firstName,
  lastName,
  email,
  phone: _phone,
}: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}) {
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

  const [timezone, setTimezone] = useState(getLocalTimezone);
  const [slotsMap, setSlotsMap] = useState<SlotsMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [confirmSlot, setConfirmSlot] = useState<Slot | null>(null);

  const days = useMemo(() => getNextDays(14), []);
  const visibleDays = days.slice(0, 7);

  const fetchSlots = useCallback(async (tz: string) => {
    setLoading(true);
    setError(null);
    try {
      const start = new Date().toISOString().slice(0, 10);
      const res = await fetch(
        `/api/calendly/slots?start=${start}&days=14&timezone=${encodeURIComponent(tz)}`,
      );
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      const map: SlotsMap = data.slots || {};
      setSlotsMap(map);
      // Auto-select the first day that has availability
      const first = days.find((d) => (map[d] || []).length > 0);
      if (first) setSelectedDate((prev) => prev ?? first);
    } catch {
      setError("Could not load availability. Please refresh to try again.");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { fetchSlots(timezone); }, [timezone, fetchSlots]);

  const todaySlots = selectedDate ? (slotsMap[selectedDate] || []) : [];

  // ── Confirmation iframe view ──────────────────────────────────────
  if (confirmSlot) {
    const confirmUrl = buildConfirmUrl(confirmSlot.schedulingUrl, fullName, email);
    return (
      <div>
        <button
          onClick={() => setConfirmSlot(null)}
          style={{
            background: "transparent", border: 0, color: "var(--ash)", cursor: "pointer",
            fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
            letterSpacing: "0.18em", textTransform: "uppercase",
            display: "flex", alignItems: "center", gap: 6, marginBottom: 16, padding: 0,
          }}
        >
          ← Change time
        </button>
        <div style={{ border: "1px solid var(--line)", overflow: "hidden" }}>
          <iframe
            key={confirmUrl}
            src={confirmUrl}
            title="Confirm booking"
            style={{ width: "100%", height: 640, border: 0, display: "block", background: "transparent" }}
            allow="camera; microphone; autoplay; encrypted-media"
          />
        </div>
      </div>
    );
  }

  // ── Calendar + slots view ─────────────────────────────────────────
  return (
    <div>
      {/* Header label */}
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
        color: "var(--acid)", letterSpacing: "0.22em", textTransform: "uppercase",
        textAlign: "center", marginBottom: 24,
      }}>
        · Select a time · 30 min ·
      </div>

      {loading && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          height: 260, color: "var(--ash)", fontFamily: "var(--font-mono)",
          fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", gap: 10,
        }}>
          <span className="pulse" style={{ width: 6, height: 6, background: "var(--acid)", display: "inline-block" }} />
          Loading availability…
        </div>
      )}

      {error && !loading && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "var(--drop)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.12em" }}>
          {error}
          <br />
          <button
            onClick={() => fetchSlots(timezone)}
            style={{ marginTop: 14, background: "transparent", border: "1px solid var(--line-2)", color: "var(--bone)", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", padding: "10px 16px", cursor: "pointer" }}
          >
            Retry →
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Day strip */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, marginBottom: 20 }}>
            {visibleDays.map((date) => {
              const d = new Date(date + "T12:00:00");
              const hasSlots = (slotsMap[date] || []).length > 0;
              const sel = date === selectedDate;
              return (
                <button
                  key={date}
                  onClick={() => hasSlots && setSelectedDate(date)}
                  disabled={!hasSlots}
                  style={{
                    padding: "14px 4px",
                    background: sel ? "rgba(191,250,70,0.08)" : "var(--bg-1)",
                    border: `1px solid ${sel ? "var(--acid)" : "var(--line)"}`,
                    color: hasSlots ? (sel ? "var(--acid)" : "var(--bone)") : "var(--muted)",
                    cursor: hasSlots ? "pointer" : "default",
                    borderRadius: 6,
                    textAlign: "center",
                    transition: "all 150ms ease",
                    boxShadow: sel ? "0 0 0 1px var(--acid), 0 0 18px rgba(191,250,70,0.10)" : "none",
                    opacity: hasSlots ? 1 : 0.35,
                  }}
                >
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4, color: sel ? "var(--acid)" : "var(--ash)" }}>
                    {d.toLocaleDateString("en-US", { weekday: "short" })}
                  </div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.02em" }}>
                    {d.getDate()}
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 4, color: "var(--ash)" }}>
                    {d.toLocaleDateString("en-US", { month: "short" })}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Duration + timezone row */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 18, gap: 12, flexWrap: "wrap",
          }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ash)", letterSpacing: "0.12em", display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              30 min call
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--ash)" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                style={{
                  background: "var(--bg-1)", border: "1px solid var(--line)",
                  color: "var(--bone)", fontFamily: "var(--font-mono)", fontSize: 10,
                  padding: "5px 8px", cursor: "pointer", outline: "none", letterSpacing: "0.08em",
                }}
              >
                {POPULAR_TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>
                ))}
                {!POPULAR_TIMEZONES.includes(timezone) && (
                  <option value={timezone}>{timezone.replace(/_/g, " ")}</option>
                )}
              </select>
            </div>
          </div>

          {/* Time slot grid */}
          {selectedDate && (
            todaySlots.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "32px 0",
                color: "var(--ash)", fontFamily: "var(--font-mono)",
                fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
              }}>
                No availability — pick another day
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                gap: 8,
              }}>
                {todaySlots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => {
                      setConfirmSlot(slot);
                      posthog.capture("book_slot_selected", { start_time: slot.time, timezone });
                    }}
                    style={{
                      padding: "16px 10px",
                      background: "var(--bg-1)",
                      border: "1px solid var(--line)",
                      color: "var(--bone)",
                      fontFamily: "var(--font-display)",
                      fontSize: 15,
                      fontWeight: 700,
                      letterSpacing: "-0.01em",
                      cursor: "pointer",
                      borderRadius: 5,
                      transition: "all 140ms ease",
                      textAlign: "center",
                    }}
                    onMouseEnter={(e) => {
                      const b = e.currentTarget as HTMLButtonElement;
                      b.style.borderColor = "var(--acid)";
                      b.style.color = "var(--acid)";
                      b.style.background = "rgba(191,250,70,0.06)";
                    }}
                    onMouseLeave={(e) => {
                      const b = e.currentTarget as HTMLButtonElement;
                      b.style.borderColor = "var(--line)";
                      b.style.color = "var(--bone)";
                      b.style.background = "var(--bg-1)";
                    }}
                  >
                    {formatTime(slot.time, timezone)}
                  </button>
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}
