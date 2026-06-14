"use client";

import { useState } from "react";

export default function VideoTestimonialCard({
  videoId,
  headline,
  body,
}: {
  videoId: string;
  headline: string;
  body: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const thumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  const embed = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;

  return (
    <div
      style={{
        background: "var(--bg-1)",
        border: "1px solid var(--line)",
        display: "flex",
        flexDirection: "column",
        transition: "border-color 200ms ease, transform 200ms ease",
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
        onClick={() => !loaded && setLoaded(true)}
        style={{
          position: "relative",
          aspectRatio: "9/16",
          background: "var(--bg-2)",
          cursor: loaded ? "default" : "pointer",
          overflow: "hidden",
          borderBottom: "1px solid var(--line)",
        }}
      >
        {!loaded ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumb}
              alt={headline}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(6,7,10,0.25) 0%, rgba(6,7,10,0.05) 40%, rgba(6,7,10,0.85) 100%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  background: "var(--acid)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 40px rgba(191,250,70,0.45), 0 0 100px rgba(191,250,70,0.18)",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <polygon points="7,4 7,20 21,12" fill="var(--bg)" />
                </svg>
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                padding: "3px 7px",
                background: "rgba(6,7,10,0.85)",
                border: "1px solid var(--acid)",
                fontFamily: "var(--font-mono)",
                fontSize: 8,
                fontWeight: 700,
                color: "var(--acid)",
                letterSpacing: "0.22em",
                whiteSpace: "nowrap",
              }}
            >
              · LIVE · TESTIMONIAL
            </div>
            <div
              style={{
                position: "absolute",
                bottom: 10,
                right: 10,
                padding: "3px 7px",
                background: "rgba(6,7,10,0.85)",
                border: "1px solid var(--line-2)",
                fontFamily: "var(--font-mono)",
                fontSize: 8,
                fontWeight: 700,
                color: "var(--bone)",
                letterSpacing: "0.22em",
                whiteSpace: "nowrap",
              }}
            >
              YT SHORT
            </div>
          </>
        ) : (
          <iframe
            src={embed}
            title={headline}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
          />
        )}
      </div>
      <div
        style={{
          padding: "18px 20px 22px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          flex: 1,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 17,
            fontWeight: 600,
            color: "var(--bone)",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}
        >
          {headline}
        </div>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 12.5,
            lineHeight: 1.55,
            color: "var(--ash)",
            margin: 0,
            fontWeight: 400,
          }}
        >
          {body}
        </p>
      </div>
    </div>
  );
}
