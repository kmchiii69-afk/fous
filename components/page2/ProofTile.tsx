"use client";

export default function ProofTile({
  src,
  handle,
  caption,
  dollars,
  platform,
  accent = "var(--acid)",
}: {
  src: string;
  handle: string;
  caption?: string;
  dollars?: string;
  platform?: string;
  accent?: string;
}) {
  function openLightbox(e: React.MouseEvent) {
    e.stopPropagation();
    window.dispatchEvent(
      new CustomEvent("qc:lightbox", { detail: { src: `/${src}`, alt: handle } })
    );
  }

  return (
    <div
      style={{
        background: "var(--bg-1)",
        border: "1px solid var(--line)",
        overflow: "hidden",
        transition: "transform 200ms ease, border-color 200ms ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--acid)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--line)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      <div
        onClick={openLightbox}
        style={{
          position: "relative",
          aspectRatio: "16/10",
          background: "var(--bg-2)",
          overflow: "hidden",
          cursor: "zoom-in",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/${src}`}
          alt={handle}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "left top",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            padding: "4px 8px",
            background: "rgba(6,7,10,0.85)",
            border: `1px solid ${accent}`,
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            fontWeight: 700,
            color: accent,
            letterSpacing: "0.22em",
            whiteSpace: "nowrap",
          }}
        >
          · REAL · WHOP
        </div>
        {dollars && (
          <div
            style={{
              position: "absolute",
              bottom: 10,
              right: 10,
              padding: "6px 10px",
              background: accent,
              color: "var(--bg)",
              fontFamily: "var(--font-display)",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
            }}
          >
            {dollars}
          </div>
        )}
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            padding: "4px 8px",
            background: "rgba(6,7,10,0.85)",
            border: "1px solid var(--line-2)",
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            fontWeight: 700,
            color: "var(--bone)",
            letterSpacing: "0.20em",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <svg width="9" height="9" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="6" cy="6" r="4.5" />
            <line x1="9.5" y1="9.5" x2="13" y2="13" />
            <line x1="4" y1="6" x2="8" y2="6" />
            <line x1="6" y1="4" x2="6" y2="8" />
          </svg>
          ENLARGE
        </div>
      </div>

      <div style={{ padding: "18px 22px 22px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 18,
              fontWeight: 600,
              color: "var(--bone)",
              letterSpacing: "-0.015em",
            }}
          >
            {handle}
          </span>
          {platform && (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                fontWeight: 600,
                color: "var(--ash)",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              {platform}
            </span>
          )}
        </div>
        {caption && (
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 13,
              lineHeight: 1.55,
              color: "var(--ash)",
              fontWeight: 400,
            }}
          >
            {caption}
          </div>
        )}
      </div>
    </div>
  );
}
