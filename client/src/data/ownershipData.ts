export const CAR_SERVICE_UPDATED_AT = "2026-03-16";

export const maintenanceProfiles = {
  gasoline: { label: "가솔린", oilIntervalKm: 10_000, oilCost: 110_000, tireCost: 700_000, wearPerKm: 22, tax: 520_000 },
  hybrid: { label: "하이브리드", oilIntervalKm: 12_000, oilCost: 120_000, tireCost: 720_000, wearPerKm: 19, tax: 420_000 },
  ev: { label: "전기차", oilIntervalKm: 20_000, oilCost: 40_000, tireCost: 760_000, wearPerKm: 15, tax: 130_000 },
} as const;
