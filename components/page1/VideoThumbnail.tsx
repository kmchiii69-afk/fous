"use client";

import { useState } from "react";

// Page 1 video — visual only. Click opens the opt-in modal, not the video.
const YT_ID = "YUB3sqIWGgs";

export default function VideoThumbnail({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const [imgSrc, setImgSrc] = useState(`https://i.ytimg.com/vi/${YT_ID}/maxresdefault.jpg`);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        aspectRatio: "16/9",
        width: "100%",
        maxWidth: 880,
        margin: "0 auto",
        cursor: "pointer",
        border: `1px solid ${hovered ? "var(--acid)" : "var(--line-2)"}`,
        background: "var(--bg-1)",
        overflow: "hidden",
        transition: "border-color 200ms ease",
      }}
    >
      {/* Thumbnail image — maxresdefault falls back to hqdefault if not available */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgSrc}
        alt="Watch the free training"
        onError={() => setImgSrc(`https://i.ytimg.com/vi/${YT_ID}/hqdefault.jpg`)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
        }}
      />

      {/* Dim + radial vignette so the play button reads */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(6,7,10,0.20) 0%, rgba(6,7,10,0.55) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Acid play button + caption */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            background: "var(--acid)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: hovered
              ? "0 0 0 1px var(--acid), 0 0 96px rgba(191,250,70,0.55)"
              : "0 0 0 1px var(--acid), 0 0 48px rgba(191,250,70,0.30)",
            transform: hovered ? "scale(1.04)" : "scale(1)",
            transition: "transform 200ms ease, box-shadow 200ms ease",
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24">
            <polygon points="7,4 7,20 21,12" fill="var(--bg)" />
          </svg>
        </div>
        <span
          style={{
            padding: "8px 14px",
            background: "rgba(6,7,10,0.78)",
            border: "1px solid var(--line-2)",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            fontWeight: 600,
            color: "var(--bone)",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
          }}
        >
          · Click To Watch Free Training ·
        </span>
      </div>
    </div>
  );
}
