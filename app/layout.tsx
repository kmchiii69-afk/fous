import type { Metadata } from "next";
import "./globals.css";
import PostHogProvider from "@/components/PostHogProvider";
import SegMetricsPixel from "@/components/SegMetricsPixel";

export const metadata: Metadata = {
  title: "Quantum Cipher — Swing Trade One Day A Week",
  description: "The nine-phase market cycle system used by 7-figure crypto swing traders.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* Calendly + YouTube preconnects shave ~200–400ms off iframe load on
            the booking + training pages. Costs nothing for users who never
            see those pages because the browser only opens the TCP/TLS
            connection if it has a reason to (the preconnect is a hint, not a fetch). */}
        <link rel="preconnect" href="https://calendly.com" />
        <link rel="preconnect" href="https://assets.calendly.com" crossOrigin="" />
        <link rel="preconnect" href="https://www.youtube.com" />
        <link rel="preconnect" href="https://i.ytimg.com" crossOrigin="" />
        <link rel="preconnect" href="https://player.vimeo.com" />
        <link rel="preconnect" href="https://vimeo.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300..800&family=Geist:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <PostHogProvider>{children}</PostHogProvider>
        <SegMetricsPixel />
      </body>
    </html>
  );
}
