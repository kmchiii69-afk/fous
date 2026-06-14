import Wrap from "./Wrap";

export default function ApplyBand({
  caption,
  href = "#apply",
}: {
  caption?: string;
  href?: string;
}) {
  return (
    <div style={{ background: "var(--bg-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", padding: "48px 0" }}>
      <Wrap>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
          {caption && (
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--ash)",
              }}
            >
              {caption}
            </div>
          )}
          <a href={href} className="btn btn-lg" style={{ marginLeft: "auto" }}>
            Apply Now →
          </a>
        </div>
      </Wrap>
    </div>
  );
}
