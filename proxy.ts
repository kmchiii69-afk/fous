import { NextRequest, NextResponse } from "next/server";
import { isLowPPP } from "@/lib/geo";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const path = request.nextUrl.pathname;

  // /wolfpack-global is the PPP-priced regional edition ($297). Fence it:
  //  - price integrity: countries outside the low-PPP list → /wolfpack
  //  - dormant until the $297 checkout env (NEXT_PUBLIC_WHOP_GLOBAL_URL)
  //    is set, so nobody sees a $297 page with a $997 checkout
  //  - ?preview=1 bypasses both checks for internal QA
  if (path === "/wolfpack-global" && request.nextUrl.searchParams.get("preview") !== "1") {
    const country = request.headers.get("x-vercel-ip-country");
    const checkoutLive = !!(process.env.NEXT_PUBLIC_WHOP_GLOBAL_URL || "").trim();
    if (country && !isLowPPP(country)) {
      return NextResponse.redirect(new URL("/wolfpack", request.url));
    }
    if (!checkoutLive) {
      // Keep the cohort tag so analytics still splits these visitors.
      return NextResponse.redirect(new URL("/wolfpack?offer=intl", request.url));
    }
  }

  if (
    host === "free.quantumcipherlab.com" &&
    !path.startsWith("/api/") &&
    !path.startsWith("/_next/") &&
    !path.startsWith("/uploads/")
  ) {
    // Rewrite all free.quantumcipherlab.com/* → /free-course/*
    // e.g. /         → /free-course
    //      /confirm  → /free-course/confirm
    const rewritePath = path === "/" ? "/free-course" : `/free-course${path}`;
    const rewriteUrl = new URL(rewritePath, request.url);
    // new URL(path, base) drops the original query — re-attach it so UTM
    // params (and anything else) survive the rewrite server-side.
    rewriteUrl.search = request.nextUrl.search;
    return NextResponse.rewrite(rewriteUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
