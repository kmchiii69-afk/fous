"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function isWolfpackTier(tier: string): boolean {
  // Wolfpack route = lowest investment tier. Match on "$500" prefix
  // so we're robust to formatting drift ($500-$2000, $500 – $2,500, etc.)
  return tier.trim().startsWith("$500");
}

function QualifiedRouter() {
  const sp = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const tier = sp.get("tier") || "";
    const route = sp.get("route") || "";
    const intl = sp.get("intl") === "1";
    const firstName = sp.get("first_name") || "";
    const lastName = sp.get("last_name") || "";
    const email = sp.get("email") || "";
    const phone = sp.get("phone") || "";

    // Explicit route param (from the server's routing decision) wins; tier
    // prefix is the legacy fallback.
    const toWolfpack = route ? route === "wolfpack" : isWolfpackTier(tier);
    if (toWolfpack) {
      // Low-PPP budget-tier leads get the regional ($297) edition. While
      // its checkout link isn't configured yet, proxy.ts bounces them to
      // the standard page tagged `offer=intl` so the cohort stays visible.
      router.replace(intl ? "/wolfpack-global" : "/wolfpack");
      return;
    }

    const params = new URLSearchParams();
    if (firstName) params.set("first_name", firstName);
    if (lastName) params.set("last_name", lastName);
    if (email) params.set("email", email);
    if (phone) params.set("phone", phone);
    router.replace(`/book?${params.toString()}`);
  }, [sp, router]);

  return null;
}

export default function QualifiedPage() {
  return (
    <div className="grid-bg" style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--bone)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", maxWidth: 480, padding: "0 48px", position: "relative" }}>
        <div style={{ position: "absolute", inset: -100, pointerEvents: "none", background: "radial-gradient(600px 360px at 50% 50%, rgba(191,250,70,0.10), transparent 60%)" }} />
        <div style={{ position: "relative" }}>
          <svg width="44" height="44" viewBox="0 0 28 28" fill="none" style={{ marginBottom: 28 }}>
            <rect x="0.5" y="0.5" width="27" height="27" stroke="var(--acid)" strokeWidth="1" />
            <rect x="7" y="7" width="14" height="14" fill="var(--acid)" />
            <rect x="11" y="11" width="6" height="6" fill="var(--bg)" />
          </svg>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 20 }}>
            <span className="pulse" style={{ width: 8, height: 8, background: "var(--acid)", display: "inline-block" }} />
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--acid)", letterSpacing: "0.22em", textTransform: "uppercase" }}>
              · Application received ·
            </div>
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 48, lineHeight: 0.98, letterSpacing: "-0.04em", color: "var(--bone)", margin: "0 0 16px" }}>
            Routing you now<em style={{ color: "var(--acid)" }}>...</em>
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 16, lineHeight: 1.55, color: "var(--ash)", margin: 0, fontWeight: 400 }}>
            Hang tight — taking you to the next step.
          </p>
        </div>
      </div>

      <Suspense fallback={null}>
        <QualifiedRouter />
      </Suspense>
    </div>
  );
}
