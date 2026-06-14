"use client";

import { useEffect, useState } from "react";
import Wrap from "@/components/shared/Wrap";

const CURRENT_CYCLE_READ = {
  phaseNum: "06",
  phaseName: "Whiplash",
  bias: "Long" as "Long" | "Short" | "Step aside",
  note: "Sweep at demand · longs back on the table",
};

function Tick({ label, price, pct, positive }: { label: string; price: string; pct: string; positive: boolean }) {
  const color = positive ? "var(--acid)" : "var(--pink)";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 110 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--ash)" }}>
          {label}
        </div>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--bone)", letterSpacing: "-0.02em", lineHeight: 1 }}>
          {price}
        </span>
      </div>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, fontWeight: 700, color, letterSpacing: "0.14em" }}>
        · {pct} · 24h
      </span>
    </div>
  );
}

export default function LiveTicker({ ctaHref = "#apply" }: { ctaHref?: string } = {}) {
  const [btc, setBtc] = useState<{ price: number; change: number } | null>(null);
  const [eth, setEth] = useState<{ price: number; change: number } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchPrices() {
      try {
        const r = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true"
        );
        if (!r.ok) throw new Error("rate");
        const j = await r.json();
        if (cancelled) return;
        setBtc({ price: j.bitcoin.usd, change: j.bitcoin.usd_24h_change });
        setEth({ price: j.ethereum.usd, change: j.ethereum.usd_24h_change });
        setError(false);
      } catch {
        if (!cancelled) setError(true);
      }
    }
    fetchPrices();
    const id = setInterval(fetchPrices, 45000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  function fmt(n: number | null | undefined) {
    if (n == null) return "—";
    if (n >= 10000) return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
    return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  }
  function fmtPct(n: number | null | undefined) {
    if (n == null) return "—";
    const sign = (n ?? 0) >= 0 ? "+" : "";
    return sign + (n ?? 0).toFixed(2) + "%";
  }

  const biasColor =
    CURRENT_CYCLE_READ.bias === "Long"
      ? "var(--acid)"
      : CURRENT_CYCLE_READ.bias === "Short"
      ? "var(--pink)"
      : "var(--bone)";

  return (
    <div
      style={{
        position: "relative",
        borderTop: "1px solid var(--line)",
        borderBottom: "1px solid var(--line)",
        background: "var(--bg-1)",
      }}
    >
      <Wrap style={{ padding: "16px 48px" }}>
        <div
          className="qc-ticker-row"
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr auto auto auto",
            gap: 28,
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              className="pulse"
              style={{
                width: 8,
                height: 8,
                background: error ? "var(--pink)" : "var(--acid)",
                borderRadius: "50%",
                display: "inline-block",
              }}
            />
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: error ? "var(--pink)" : "var(--acid)",
              }}
            >
              · {error ? "Offline" : "Live"} ·{" "}
              {new Date().toLocaleString("en-US", { month: "short", day: "numeric" })} ·
            </div>
          </div>

          <div style={{ minWidth: 0, display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--ash)" }}>
              · Phase
            </div>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 18,
                fontWeight: 700,
                color: "var(--bone)",
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              {CURRENT_CYCLE_READ.phaseNum} · {CURRENT_CYCLE_READ.phaseName}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                fontWeight: 700,
                color: biasColor,
                letterSpacing: "0.22em",
                border: `1px solid ${biasColor}`,
                padding: "3px 7px",
              }}
            >
              {CURRENT_CYCLE_READ.bias.toUpperCase()}
            </span>
            <span
              className="qc-ticker-note"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 13,
                fontWeight: 400,
                color: "var(--ash)",
                fontStyle: "italic",
              }}
            >
              {CURRENT_CYCLE_READ.note}
            </span>
          </div>

          <Tick
            label="BTC"
            price={fmt(btc?.price)}
            pct={fmtPct(btc?.change)}
            positive={(btc?.change ?? 0) >= 0}
          />
          <Tick
            label="ETH"
            price={fmt(eth?.price)}
            pct={fmtPct(eth?.change)}
            positive={(eth?.change ?? 0) >= 0}
          />

          <a
            href={ctaHref}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              fontWeight: 700,
              color: "var(--acid)",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              borderLeft: "1px solid var(--line)",
              paddingLeft: 20,
            }}
          >
            Trade with us →
          </a>
        </div>
      </Wrap>

      <style>{`
        @media (max-width: 900px) {
          .qc-ticker-row { grid-template-columns: 1fr 1fr !important; gap: 12px !important; }
          .qc-ticker-row > *:nth-child(1) { grid-column: 1 / -1; }
          .qc-ticker-row > *:nth-child(2) { grid-column: 1 / -1; }
          .qc-ticker-row > *:nth-child(5) { grid-column: 1 / -1; border-left: 0 !important; padding-left: 0 !important; border-top: 1px solid var(--line); padding-top: 12px; }
          .qc-ticker-note { display: none; }
        }
      `}</style>
    </div>
  );
}
