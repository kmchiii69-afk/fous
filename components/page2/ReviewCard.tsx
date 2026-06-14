"use client";

function StarRow({ count = 5 }: { count?: number }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 14 14" style={{ display: "block" }}>
          <polygon
            points="7,1 8.85,5.1 13.3,5.5 9.9,8.4 11,12.8 7,10.4 3,12.8 4.1,8.4 0.7,5.5 5.15,5.1"
            fill="var(--acid)"
          />
        </svg>
      ))}
    </div>
  );
}

export default function ReviewCard({
  name,
  quote,
  date,
  verified = true,
}: {
  name: string;
  quote: string;
  date: string;
  verified?: boolean;
}) {
  const palette = ["var(--acid)", "var(--pink)", "#6FE9FF"];
  const accent = palette[name.charCodeAt(0) % 3];
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      style={{
        background: "var(--bg-1)",
        border: "1px solid var(--line)",
        padding: "22px 22px",
        marginBottom: 14,
        breakInside: "avoid",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        transition: "border-color 200ms ease, transform 200ms ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--acid)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--line)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <StarRow count={5} />
        {verified && (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 8,
              fontWeight: 700,
              color: "var(--acid)",
              letterSpacing: "0.22em",
              border: "1px solid var(--acid)",
              padding: "3px 6px",
              whiteSpace: "nowrap",
            }}
          >
            VERIFIED · WHOP
          </span>
        )}
      </div>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 14,
          lineHeight: 1.6,
          color: "var(--bone)",
          margin: 0,
          fontWeight: 400,
        }}
      >
        &ldquo;{quote}&rdquo;
      </p>
      <div
        style={{
          paddingTop: 14,
          borderTop: "1px solid var(--line)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            background: "var(--bg-2)",
            border: `1px solid ${accent}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-display)",
            fontSize: 12,
            fontWeight: 700,
            color: accent,
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 15,
              fontWeight: 600,
              color: "var(--bone)",
              letterSpacing: "-0.015em",
              lineHeight: 1.2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              color: "var(--ash)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              marginTop: 2,
            }}
          >
            {date}
          </div>
        </div>
      </div>
    </div>
  );
}
