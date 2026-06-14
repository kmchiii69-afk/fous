"use client";

import { useState } from "react";

export default function PhotoFrame({
  src,
  alt,
  ratio = "4/3",
  style,
  objectPosition = "center",
  zoomable = true,
}: {
  src: string;
  alt: string;
  ratio?: string;
  style?: React.CSSProperties;
  objectPosition?: string;
  zoomable?: boolean;
}) {
  const [hover, setHover] = useState(false);

  function openLightbox() {
    if (!zoomable) return;
    window.dispatchEvent(
      new CustomEvent("qc:lightbox", { detail: { src: `/${src}`, alt } })
    );
  }

  return (
    <div
      onClick={openLightbox}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        aspectRatio: ratio,
        background: "var(--bg-2)",
        border: "1px solid var(--line)",
        overflow: "hidden",
        cursor: zoomable ? "zoom-in" : "default",
        ...style,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/${src}`}
        alt={alt}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition,
          transition: "transform 320ms ease",
          transform: hover && zoomable ? "scale(1.015)" : "scale(1)",
        }}
      />
      {zoomable && (
        <div
          style={{
            position: "absolute",
            bottom: 12,
            right: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            background: "rgba(6,7,10,0.82)",
            backdropFilter: "blur(6px)",
            border: `1px solid ${hover ? "var(--acid)" : "var(--line-2)"}`,
            opacity: hover ? 1 : 0.65,
            transition: "opacity 200ms ease, border-color 200ms ease",
            pointerEvents: "none",
          }}
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 14 14"
            fill="none"
            stroke={hover ? "var(--acid)" : "var(--bone)"}
            strokeWidth="1.6"
          >
            <circle cx="6" cy="6" r="4.5" />
            <line x1="9.5" y1="9.5" x2="13" y2="13" />
            <line x1="4" y1="6" x2="8" y2="6" />
            <line x1="6" y1="4" x2="6" y2="8" />
          </svg>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              fontWeight: 700,
              color: hover ? "var(--acid)" : "var(--bone)",
              letterSpacing: "0.20em",
              textTransform: "uppercase",
              transition: "color 200ms ease",
            }}
          >
            · Click to enlarge
          </span>
        </div>
      )}
    </div>
  );
}
