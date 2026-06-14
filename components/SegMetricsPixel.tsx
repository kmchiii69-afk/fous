"use client";

import { useEffect } from "react";

export default function SegMetricsPixel() {
  useEffect(() => {
    if (document.getElementById("segmetrics-pixel")) return;
    const script = document.createElement("script");
    script.id = "segmetrics-pixel";
    script.src = "//tag.segmetrics.io/a1XJ5y.js";
    script.async = true;
    document.head.appendChild(script);
  }, []);

  return null;
}
