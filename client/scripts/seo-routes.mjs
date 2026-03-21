// 파라미터 단위: 만 원 (URL 파라미터 × 10,000 = 원화)
export const TAX_PRICES = [2000, 3000, 5000, 7000, 10000];
export const INSURANCE_PREMIUMS = [30, 50, 70, 100, 150];
export const LEASE_PRICES = [3000, 5000, 7000, 10000];

export const SEO_ROUTES = [
  "/",
  "/tax",
  "/insurance",
  "/lease-vs-loan",
  "/parking",
  "/maintenance",
  "/ev-vs-gas",
  "/about",
  "/terms",
  "/privacy",
  ...TAX_PRICES.map((a) => `/tax/${a}`),
  ...INSURANCE_PREMIUMS.map((a) => `/insurance/${a}`),
  ...LEASE_PRICES.map((a) => `/lease-vs-loan/${a}`),
];
