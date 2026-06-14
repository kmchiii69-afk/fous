"use client";

import { useEffect, useState } from "react";
import Logo from "./Logo";
import Wrap from "./Wrap";

export default function StickyBar({
  label = "· Application Open",
  cta = "Apply Now →",
  ctaHref = "#apply",
}: {
  label?: string;
  cta?: string;
  ctaHref?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 700);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transform: visible ? "translateY(0)" : "translateY(-100%)",
        transition: "transform 280ms cubic-bezier(0.22,1,0.36,1)",
        background: "rgba(6,7,10,0.94)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--acid)",
      }}
    >
      <Wrap>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 0",
          }}
        >
          <Logo />
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.18em",
              color: "var(--ash)",
              textTransform: "uppercase",
            }}
          >
            {label}
          </div>
          <a href={ctaHref} className="btn" style={{ padding: "10px 18px", fontSize: 11 }}>
            {cta}
          </a>
        </div>
      </Wrap>
    </div>
  );
}
