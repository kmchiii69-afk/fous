"use client";

import { useRef, useState } from "react";

export const CYCLE_PHASES = [
  { id: "01", x: 140,  y: 255, name: "Revival",     v: "long",  desc: "The first breakout after a long bear market. An ascending triangle forms and breaks, signaling the bulls are back. Smart money begins accumulating." },
  { id: "02", x: 280,  y: 190, name: "Survival",    v: "long",  desc: "A bullish consolidation forms after the Revival pullback. Market pushes to new highs, proving the trend is real. FOMO starts creeping in." },
  { id: "03", x: 440,  y: 110, name: "Force",       v: "long",  desc: "A breakout near all-time highs triggers massive short squeezes. Bulls go full degen, price goes vertical. Peak euphoria — the final leg of the bull cycle." },
  { id: "04", x: 540,  y: 50,  name: "Armageddon",  v: "short", desc: "The top. Daily market structure breaks down and the 50MA fails. Bulls ignore the warning signs. The beginning of the end — the bear market has begun." },
  { id: "05", x: 720,  y: 140, name: "Suckerpunch", v: "short", desc: "Market rallies into supply after sharp drops, then gets slammed again. Fake rallies trap longs and create high-probability shorts. Happens multiple times in the bear." },
  { id: "06", x: 870,  y: 175, name: "Whiplash",    v: "long",  desc: "After Suckerpunches, price aggressively sweeps prior lows — stopping out early dip buyers — then rips back up hard. Catch the sweep at demand for quick gains." },
  { id: "07", x: 1070, y: 290, name: "Knockout",    v: "long",  desc: "A brutal drop, usually 60%+ from the top, into weekly or monthly demand. Triggers a major 50–100% bounce. Could be the bottom if BTC is also at long-term demand." },
  { id: "08", x: 1280, y: 235, name: "Cockblock",   v: "short", desc: "The Knockout rally rips into supply and forms the first peak of the Revival triangle. Bulls think we're back. The market says not yet. Excellent shorting zone." },
  { id: "09", x: 1500, y: 320, name: "Apex",        v: "long",  desc: "The final bottom. Only happens when BTC is in deep fear on the Quantum Tradingview Suite Fear & Greed Indicator (monthly). The entire market is maxed out in pain. Smart money goes all in." },
];

export const CYCLE_PHASE_PATH =
  "M 40 320 Q 100 305, 140 255 Q 220 175, 280 190 Q 360 130, 440 110 Q 510 70, 540 50 Q 620 80, 720 140 Q 800 105, 870 175 Q 950 240, 1070 290 Q 1180 250, 1280 235 Q 1380 290, 1500 320 L 1560 320";

export default function CycleScrubber({
  activeIdx,
  setActiveIdx,
}: {
  activeIdx: number;
  setActiveIdx: (i: number) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const active = CYCLE_PHASES[activeIdx];
  const activeColor = active.v === "long" ? "var(--acid)" : "var(--pink)";

  function pickClosestFromClientX(clientX: number) {
    if (!svgRef.current) return 0;
    const rect = svgRef.current.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    const svgX = 40 + ratio * (1560 - 40);
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < CYCLE_PHASES.length; i++) {
      const d = Math.abs(CYCLE_PHASES[i].x - svgX);
      if (d < bestDist) { bestDist = d; best = i; }
    }
    return best;
  }

  function onPointerDown(e: React.PointerEvent<SVGSVGElement>) {
    setDragging(true);
    setActiveIdx(pickClosestFromClientX(e.clientX));
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!dragging) return;
    setActiveIdx(pickClosestFromClientX(e.clientX));
  }
  function onPointerUp(e: React.PointerEvent<SVGSVGElement>) {
    setDragging(false);
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
  }
  function onKeyDown(e: React.KeyboardEvent<SVGSVGElement>) {
    if (e.key === "ArrowLeft") { e.preventDefault(); setActiveIdx(Math.max(0, activeIdx - 1)); }
    if (e.key === "ArrowRight") { e.preventDefault(); setActiveIdx(Math.min(CYCLE_PHASES.length - 1, activeIdx + 1)); }
  }

  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, color: "var(--ash)", letterSpacing: "0.22em", textTransform: "uppercase" }}>
          · A full market cycle · bottom to bottom ·
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, color: "var(--acid)", letterSpacing: "0.22em", textTransform: "uppercase" }}>
          · Drag the dot · ← → ·
        </div>
      </div>

      <svg
        ref={svgRef}
        viewBox="0 0 1600 380"
        tabIndex={0}
        role="slider"
        aria-valuemin={1}
        aria-valuemax={9}
        aria-valuenow={activeIdx + 1}
        aria-valuetext={`Phase ${active.id} ${active.name}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        style={{
          width: "100%",
          display: "block",
          overflow: "visible",
          touchAction: "none",
          cursor: dragging ? "grabbing" : "pointer",
          outline: "none",
        }}
      >
        <line x1="0" y1="320" x2="1600" y2="320" stroke="var(--line-2)" strokeWidth="1" strokeDasharray="4 6" />
        {[{ x: 40, label: "BULL CYCLE" }, { x: 520, label: "BEAR CYCLE" }].map((z, i) => (
          <g key={i} opacity="0.5">
            <line x1={z.x} x2={z.x} y1="0" y2="350" stroke="var(--line)" strokeWidth="1" strokeDasharray="2 4" />
            <text x={z.x + 12} y="22" fill="var(--muted)"
              style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.24em" }}>
              · {z.label}
            </text>
          </g>
        ))}
        <path d={CYCLE_PHASE_PATH} fill="none" stroke="var(--acid)" strokeWidth="2.2"
          style={{ filter: "drop-shadow(0 0 12px rgba(191,250,70,0.25))" }} />
        <line x1={active.x} x2={active.x} y1={Math.max(0, active.y - 24)} y2="360"
          stroke={activeColor} strokeWidth="1" strokeDasharray="3 5"
          style={{ transition: "all 220ms ease" }} />

        {CYCLE_PHASES.map((p, idx) => {
          if (idx === activeIdx) return null;
          const color = p.v === "long" ? "var(--acid)" : "var(--pink)";
          const labelAbove = p.y > 200;
          return (
            <g key={p.id} style={{ cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); setActiveIdx(idx); }}>
              <circle cx={p.x} cy={p.y} r="14" fill="transparent" />
              <circle cx={p.x} cy={p.y} r="8" fill="var(--bg-1)" stroke={color} strokeWidth="2" opacity="0.55" />
              <circle cx={p.x} cy={p.y} r="3" fill={color} opacity="0.7" />
              <text x={p.x} y={labelAbove ? p.y - 18 : p.y + 24} textAnchor="middle" fill={color}
                style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", opacity: 0.65 }}>{p.id}</text>
              <text x={p.x} y={labelAbove ? p.y - 32 : p.y + 38} textAnchor="middle" fill="var(--bone)"
                style={{ fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 500, letterSpacing: "-0.01em", opacity: 0.55 }}>{p.name}</text>
            </g>
          );
        })}

        {(() => {
          const p = active;
          const labelAbove = p.y > 200;
          return (
            <g style={{ transition: "all 240ms cubic-bezier(0.2,0.8,0.2,1)" }}>
              <circle cx={p.x} cy={p.y} r="22" fill="none" stroke={activeColor} strokeWidth="1" opacity="0.35" />
              <circle cx={p.x} cy={p.y} r="14" fill="var(--bg-1)" stroke={activeColor} strokeWidth="3"
                style={{ filter: `drop-shadow(0 0 14px ${activeColor})` }} />
              <circle cx={p.x} cy={p.y} r="5" fill={activeColor} />
              <text x={p.x} y={labelAbove ? p.y - 26 : p.y + 32} textAnchor="middle" fill={activeColor}
                style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, letterSpacing: "0.22em" }}>{p.id}</text>
              <text x={p.x} y={labelAbove ? p.y - 44 : p.y + 50} textAnchor="middle" fill="var(--bone)"
                style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, letterSpacing: "-0.015em" }}>{p.name}</text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
