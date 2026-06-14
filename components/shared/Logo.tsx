export default function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, whiteSpace: "nowrap" }}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ flexShrink: 0 }}>
        <rect x="1" y="1" width="26" height="26" rx="2" stroke="var(--acid)" strokeWidth="1.5" />
        <rect x="9" y="9" width="10" height="10" rx="1" fill="var(--acid)" />
        <rect x="12" y="12" width="4" height="4" fill="var(--bg)" />
      </svg>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 15,
          letterSpacing: "0.04em",
          color: "var(--bone)",
          whiteSpace: "nowrap",
        }}
      >
        Quantum Cipher
      </span>
    </div>
  );
}
