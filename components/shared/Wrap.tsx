import React from "react";

export default function Wrap({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        maxWidth: 1320,
        margin: "0 auto",
        padding: "0 48px",
        width: "100%",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
