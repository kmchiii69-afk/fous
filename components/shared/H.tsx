import React from "react";
import Wrap from "./Wrap";

export default function H({
  num,
  label,
  title,
  sub,
}: {
  num: string;
  label: string;
  title: React.ReactNode;
  sub?: string;
}) {
  return (
    <div style={{ marginBottom: 60 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            fontWeight: 600,
            color: "var(--acid)",
            letterSpacing: "0.22em",
            padding: "6px 12px",
            border: "1px solid var(--acid)",
            whiteSpace: "nowrap",
          }}
        >
          § {num}
        </span>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            fontWeight: 600,
            color: "var(--acid)",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
      </div>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: 76,
          lineHeight: 0.98,
          letterSpacing: "-0.04em",
          color: "var(--bone)",
          margin: "0 0 24px",
          maxWidth: 1100,
        }}
      >
        {title}
      </h2>
      {sub && (
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 19,
            lineHeight: 1.6,
            color: "var(--ash)",
            margin: 0,
            maxWidth: 820,
            fontWeight: 400,
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

export function Section({
  id,
  children,
  py = 120,
  style,
}: {
  id?: string;
  children: React.ReactNode;
  py?: number;
  style?: React.CSSProperties;
}) {
  return (
    <section id={id} style={{ padding: `${py}px 0`, ...style }}>
      <Wrap>{children}</Wrap>
    </section>
  );
}
