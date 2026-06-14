"use client";

import { useEffect, useState } from "react";

interface LightboxState {
  src: string;
  alt: string;
}

export default function Lightbox() {
  const [state, setState] = useState<LightboxState | null>(null);

  useEffect(() => {
    function onOpen(e: Event) {
      setState((e as CustomEvent<LightboxState>).detail);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setState(null);
    }
    window.addEventListener("qc:lightbox", onOpen as EventListener);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("qc:lightbox", onOpen as EventListener);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = state ? "hidden" : "";
  }, [state]);

  if (!state) return null;

  return (
    <div
      onClick={() => setState(null)}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(6,7,10,0.92)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 48,
        cursor: "zoom-out",
      }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); setState(null); }}
        style={{
          position: "absolute",
          top: 24,
          right: 24,
          zIndex: 2,
          width: 44,
          height: 44,
          background: "var(--bg-1)",
          border: "1px solid var(--line-2)",
          color: "var(--bone)",
          fontFamily: "var(--font-mono)",
          fontSize: 16,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-label="Close"
      >
        ✕
      </button>

      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          fontWeight: 600,
          color: "var(--ash)",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          background: "var(--bg-1)",
          padding: "10px 18px",
          border: "1px solid var(--line)",
          whiteSpace: "nowrap",
        }}
      >
        · Click anywhere or press Esc to close ·
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={state.src}
        alt={state.alt}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "contain",
          border: "1px solid var(--line-2)",
          boxShadow: "0 30px 90px rgba(0,0,0,0.6)",
          animation: "lbIn 240ms cubic-bezier(0.2,0.8,0.2,1)",
          cursor: "default",
        }}
      />
    </div>
  );
}
