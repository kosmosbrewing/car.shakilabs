// 파라미터 단위: 만 원 (URL 파라미터 × 10,000 = 원화)
export const TAX_PRICES = [2000, 3000, 5000, 7000, 10000];
export const INSURANCE_PREMIUMS = [30, 50, 70, 100, 150];
export const LEASE_PRICES = [3000, 5000, 7000, 10000];

// Doorway-variant consolidation (AdSense "low value content" remediation):
// the amount-variant routes render the exact same prerendered body as their
// base calculator (the amount only affects post-hydration state), so they are
// consolidated instead of enriched — canonical points at the base page and the
// variants leave the sitemap. This is reversible: once a variant gains unique
// body content, move it back to the sitemap and drop its canonical override.
export const PARAM_ROUTES = [
  ...TAX_PRICES.map((a) => `/tax/${a}`),
  ...INSURANCE_PREMIUMS.map((a) => `/insurance/${a}`),
  ...LEASE_PRICES.map((a) => `/lease-vs-loan/${a}`),
];

export const SEO_ROUTES = [
  // "/" must stay listed here, not only in PRERENDER_ROUTES: SITEMAP_ROUTES is
  // derived from this array, so an omission silently drops the app home — the
  // most authoritative URL we own — out of the sitemap entirely.
  "/",
  "/all",
  "/tax",
  "/insurance",
  "/lease-vs-loan",
  "/parking",
  "/maintenance",
  "/ev-vs-gas",
  "/about",
  "/terms",
  "/privacy",
  ...PARAM_ROUTES,
];

// Sitemap lists only self-canonical pages; PARAM_ROUTES canonicalize away
// and must not be advertised to crawlers.
export const SITEMAP_ROUTES = SEO_ROUTES.filter(
  (route) => !PARAM_ROUTES.includes(route)
);

// Canonical target for a prerendered route: variants point at their base page
// (e.g. /tax/2000 -> /tax), everything else is self-canonical.
export function canonicalPathFor(route) {
  return PARAM_ROUTES.includes(route)
    ? route.slice(0, route.lastIndexOf("/"))
    : route;
}

// PARAM_ROUTES stay prerendered on purpose: without a static HTML file the
// Vercel rewrite would serve the SPA shell for these URLs, which is a
// soft-404 for crawlers. Never drop them from PRERENDER_ROUTES.
export const PRERENDER_ROUTES = SEO_ROUTES;
