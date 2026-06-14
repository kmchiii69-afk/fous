"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PasswordGate() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/analytics/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.refresh();
    } else {
      setError("Incorrect password.");
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#06070A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      <div style={{ width: "100%", maxWidth: 400, textAlign: "center" }}>
        {/* Logo mark */}
        <svg
          width="36"
          height="36"
          viewBox="0 0 28 28"
          fill="none"
          style={{ marginBottom: 32 }}
        >
          <rect x="0.5" y="0.5" width="27" height="27" stroke="#BFFA46" strokeWidth="1" />
          <rect x="7" y="7" width="14" height="14" fill="#BFFA46" />
          <rect x="11" y="11" width="6" height="6" fill="#06070A" />
        </svg>

        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.28em",
            color: "#BFFA46",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          · Quantum Cipher ·
        </div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.22em",
            color: "#6B7280",
            textTransform: "uppercase",
            marginBottom: 40,
          }}
        >
          · Analytics Access ·
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            autoFocus
            required
            style={{
              width: "100%",
              background: "#0D0E12",
              border: "1px solid #1E2028",
              borderRadius: 0,
              color: "#F2F0E6",
              padding: "16px 20px",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 14,
              letterSpacing: "0.08em",
              outline: "none",
              boxSizing: "border-box",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "#BFFA46")
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = "#1E2028")
            }
          />

          {error && (
            <div
              style={{
                fontSize: 11,
                color: "#FF6B6B",
                letterSpacing: "0.1em",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            style={{
              padding: "16px",
              background: loading || !password ? "#1E2028" : "#BFFA46",
              border: 0,
              color: loading || !password ? "#6B7280" : "#06070A",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              cursor: loading || !password ? "default" : "pointer",
              transition: "all 200ms ease",
            }}
          >
            {loading ? "Verifying..." : "Unlock →"}
          </button>
        </form>
      </div>
    </div>
  );
}
