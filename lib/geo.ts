// Regional (PPP) pricing for the funnel.
//
// Geo informs PRICE, not access: visitors from low purchasing-power
// countries who pick the budget tier get flagged for the regional Wolfpack
// offer (`offer=intl`); anyone who picks a $2,500+ tier routes to the
// booking calendar no matter where they are — the setter call filters real
// budgets from fantasy clicks. Rationale (June 2026 data): 73% of low-PPP
// submissions pick the budget tier, and 0 of the last 5 booked calls came
// from these geos — but Indonesia alone produced four $5K+ tier clicks in
// a month, and those are worth a setter's 30 minutes to verify.
//
// Country comes from Vercel's `x-vercel-ip-country` edge header, which is
// set by Vercel and can't be spoofed by the client in production. Locally
// the header is absent, so geo logic is a no-op in dev unless you send the
// header yourself.
//
// Edit freely — two-letter ISO 3166-1 alpha-2 codes, uppercase.
export const LOW_PPP_COUNTRIES = new Set<string>([
  // South / Southeast Asia
  "ID", "PK", "IN", "BD", "LK", "NP", "MM", "KH", "LA", "VN", "PH",
  // Africa
  "NG", "EG", "KE", "GH", "ET", "TZ", "UG", "ZM", "ZW", "SN", "CM", "CI",
  "MA", "TN", "DZ",
  // Central Asia / Caucasus
  "UZ", "TJ", "TM", "KG", "GE", "AM", "AZ",
  // Eastern Europe / Balkans (low-PPP tier only)
  "MD", "AL", "MK", "BA", "XK", "UA",
  // Latin America (low-PPP tier only)
  "BO", "NI", "HN", "GT", "SV", "PY", "VE",
  // Middle East (conflict / low-PPP tier)
  "IQ", "SY", "YE", "AF",
]);

export function isLowPPP(country: string | null | undefined): boolean {
  return !!country && LOW_PPP_COUNTRIES.has(country.trim().toUpperCase());
}
