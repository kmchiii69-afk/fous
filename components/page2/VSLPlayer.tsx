"use client";

import { useState } from "react";

const YT_ID = "YUB3sqIWGgs";

export default function VSLPlayer() {
  const [playing, setPlaying] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [imgSrc, setImgSrc] = useState(`https://i.ytimg.com/vi/${YT_ID}/maxresdefault.jpg`);

  return (
    <div
      style={{
        position: "relative",
        aspectRatio: "16/9",
        background: "var(--bg-2)",
        border: `1px solid ${playing || hovered ? "var(--acid)" : "var(--line)"}`,
        overflow: "hidden",
        transition: "border-color 200ms ease",
      }}
      onMouseEnter={() => !playing && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {playing ? (
        <iframe
          src={`https://www.youtube.com/embed/${YT_ID}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          title="Quantum Cipher · Free Training"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            border: 0,
          }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label="Play training video"
          style={{
            position: "absolute",
            inset: 0,
            padding: 0,
            background: "transparent",
            border: 0,
            cursor: "pointer",
            color: "inherit",
          }}
        >
          {/* Thumbnail */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt="Cameron Fous · Free Training"
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

          {/* Dim + radial vignette */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at 50% 50%, rgba(6,7,10,0.25) 0%, rgba(6,7,10,0.65) 100%)",
              pointerEvents: "none",
            }}
          />

          {/* Centered play overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                width: 120,
                height: 120,
                background: "var(--acid)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: hovered
                  ? "0 0 0 1px var(--acid), 0 0 96px rgba(191,250,70,0.55)"
                  : "0 0 0 1px var(--acid), 0 0 64px rgba(191,250,70,0.35)",
                transform: hovered ? "scale(1.04)" : "scale(1)",
                transition: "transform 200ms ease, box-shadow 200ms ease",
              }}
            >
              <svg width="40" height="40" viewBox="0 0 40 40">
                <polygon points="12,6 12,34 36,20" fill="var(--bg)" />
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
              · Click to start the training ·
            </span>
          </div>
        </button>
      )}
    </div>
  );
}
