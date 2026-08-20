import { z } from "zod";
import { maintenanceProfiles, PRICE_TIERS, YOUTH_BONUS_RATE, CONVERSION_BONUS, NATIONAL_SUBSIDY_MAX } from "@/data/ownershipData";
import { calculationFailure, calculationSuccess } from "@/utils/calculationState";

/**
 * 주차 계산의 일 최대요금 상한.
 * 화면(ParkingView)의 "이 결과는 이렇게 계산했습니다" 설명이 이 값을 그대로 렌더한다.
 * 상한을 로직과 화면에 각각 박아두면 한쪽만 고쳤을 때 설명이 결과를 배신하므로
 * 계산 모듈을 유일한 출처로 삼는다.
 */
export const PARKING_DAILY_CAP = 15_000;

export interface InputBound {
  min: number;
  max: number;
}

/**
 * 입력 허용 범위. zod 스키마와 화면의 min/max 속성이 같은 출처를 봐야
 * 범위를 좁혔을 때 입력창이 조용히 낡지 않는다.
 */
export const PARKING_INPUT_LIMITS = {
  daysPerMonth: { min: 1, max: 31 },
  hoursPerDay: { min: 1, max: 24 },
  hourlyRate: { min: 500, max: 20_000 },
  monthlyPass: { min: 0, max: 1_000_000 },
} as const satisfies Record<string, InputBound>;

export const MAINTENANCE_INPUT_LIMITS = {
  annualKm: { min: 1_000, max: 100_000 },
  vehicleAge: { min: 0, max: 20 },
} as const satisfies Record<string, InputBound>;

export const EV_VS_GAS_INPUT_LIMITS = {
  annualKm: { min: 1_000, max: 100_000 },
  gasPrice: { min: 1_000, max: 3_500 },
  electricityPrice: { min: 100, max: 600 },
  gasEfficiency: { min: 5, max: 25 },
  evKwhPerKm: { min: 0.08, max: 0.4 },
} as const satisfies Record<string, InputBound>;

const bounded = (limit: InputBound) => z.number().min(limit.min).max(limit.max);

const parkingSchema = z.object({
  daysPerMonth: bounded(PARKING_INPUT_LIMITS.daysPerMonth).int(),
  hoursPerDay: bounded(PARKING_INPUT_LIMITS.hoursPerDay),
  hourlyRate: bounded(PARKING_INPUT_LIMITS.hourlyRate),
  monthlyPass: bounded(PARKING_INPUT_LIMITS.monthlyPass),
});

const maintenanceSchema = z.object({
  annualKm: bounded(MAINTENANCE_INPUT_LIMITS.annualKm),
  vehicleAge: bounded(MAINTENANCE_INPUT_LIMITS.vehicleAge).int(),
  fuelType: z.enum(["gasoline", "hybrid", "ev"]),
});

const evVsGasSchema = z.object({
  annualKm: bounded(EV_VS_GAS_INPUT_LIMITS.annualKm),
  gasPrice: bounded(EV_VS_GAS_INPUT_LIMITS.gasPrice),
  electricityPrice: bounded(EV_VS_GAS_INPUT_LIMITS.electricityPrice),
  gasEfficiency: bounded(EV_VS_GAS_INPUT_LIMITS.gasEfficiency),
  evKwhPerKm: bounded(EV_VS_GAS_INPUT_LIMITS.evKwhPerKm),
});

export interface EvVsGasResult {
  gasFuel: number;
  evFuel: number;
  gasTotal: number;
  evTotal: number;
  winner: "ev" | "gas";
  gap: number;
}

export function compareParkingOptions(input: z.input<typeof parkingSchema>) {
  const parsedResult = parkingSchema.safeParse(input);
  if (!parsedResult.success) return calculationFailure(parsedResult.error);
  const parsed = parsedResult.data;
  const hourlyTotal = Math.round(parsed.daysPerMonth * parsed.hoursPerDay * parsed.hourlyRate);
  const dayCapTotal = Math.round(parsed.daysPerMonth * Math.min(parsed.hoursPerDay * parsed.hourlyRate, PARKING_DAILY_CAP));
  const monthlyTotal = Math.round(parsed.monthlyPass);
  const items = [
    { key: "hourly", label: "시간권", total: hourlyTotal },
    { key: "daycap", label: "일 최대요금", total: dayCapTotal },
    { key: "monthly", label: "월주차", total: monthlyTotal },
  ].sort((a, b) => a.total - b.total);

  return calculationSuccess({
    items,
    bestOption: items[0],
    spread: items[items.length - 1].total - items[0].total,
  });
}

export function calculateMaintenanceBudget(input: z.input<typeof maintenanceSchema>) {
  const parsedResult = maintenanceSchema.safeParse(input);
  if (!parsedResult.success) return calculationFailure(parsedResult.error);
  const parsed = parsedResult.data;
  const profile = maintenanceProfiles[parsed.fuelType];
  const oil = Math.ceil(parsed.annualKm / profile.oilIntervalKm) * profile.oilCost;
  const tires = Math.round((parsed.annualKm / 40_000) * profile.tireCost);
  const consumables = Math.round(parsed.annualKm * profile.wearPerKm);
  const inspection = parsed.vehicleAge >= 4 ? 90_000 : 0;
  const insurance = 700_000 + parsed.vehicleAge * 35_000;
  const tax = profile.tax;
  const total = oil + tires + consumables + inspection + insurance + tax;

  return calculationSuccess({
    profile,
    oil,
    tires,
    consumables,
    inspection,
    insurance,
    tax,
    total,
    monthlyAverage: Math.round(total / 12),
  });
}

export function compareEvVsGas(input: z.input<typeof evVsGasSchema>) {
  const parsedResult = evVsGasSchema.safeParse(input);
  if (!parsedResult.success) return calculationFailure(parsedResult.error);
  const parsed = parsedResult.data;
  const gasFuel = Math.round((parsed.annualKm / parsed.gasEfficiency) * parsed.gasPrice);
  const evFuel = Math.round(parsed.annualKm * parsed.evKwhPerKm * parsed.electricityPrice);
  const gasTotal = gasFuel + 850_000 + 520_000;
  const evTotal = evFuel + 420_000 + 130_000 + 180_000;

  return calculationSuccess<EvVsGasResult>({
    gasFuel,
    evFuel,
    gasTotal,
    evTotal,
    winner: evTotal <= gasTotal ? "ev" : "gas",
    gap: Math.abs(gasTotal - evTotal),
  });
}

// ── 전기차 보조금 계산 ──────────────────────────────
const evSubsidySchema = z.object({
  vehiclePrice: z.number().min(0).max(200_000_000),
  nationalSubsidy: z.number().min(0).max(NATIONAL_SUBSIDY_MAX),
  localSubsidy: z.number().min(0).max(10_000_000),
  isYouth: z.boolean(),
  isConversion: z.boolean(),
});

export type EvSubsidyInput = z.input<typeof evSubsidySchema>;

export interface EvSubsidyResult {
  /** 가격 구간 적용률 */
  priceRate: number;
  priceRateLabel: string;
  /** 가격 조정된 국고보조금 */
  adjustedNational: number;
  /** 청년 가산 금액 */
  youthBonus: number;
  /** 전환지원금 */
  conversionBonus: number;
  /** 지자체 보조금 (가격 조정 적용) */
  adjustedLocal: number;
  /** 총 보조금 */
  totalSubsidy: number;
  /** 보조금 적용 후 실구매가 */
  effectivePrice: number;
}

export function calculateEvSubsidy(input: z.input<typeof evSubsidySchema>) {
  const parsedResult = evSubsidySchema.safeParse(input);
  if (!parsedResult.success) return calculationFailure(parsedResult.error);
  const parsed = parsedResult.data;

  // 가격 구간별 지급률
  const tier = PRICE_TIERS.find((t) => parsed.vehiclePrice < t.maxPrice) ?? PRICE_TIERS[PRICE_TIERS.length - 1];
  const priceRate = tier.rate;

  // 국고보조금 = 성능보조금 × 가격구간률
  const adjustedNational = Math.round(parsed.nationalSubsidy * priceRate);

  // 청년 가산 = 가격 조정된 국고보조금 × 20%
  const youthBonus = parsed.isYouth ? Math.round(adjustedNational * YOUTH_BONUS_RATE) : 0;

  // 전환지원금
  const conversionBonus = parsed.isConversion ? CONVERSION_BONUS : 0;

  // 지자체 보조금에도 동일한 가격 구간률 적용
  const adjustedLocal = Math.round(parsed.localSubsidy * priceRate);

  const totalSubsidy = adjustedNational + youthBonus + conversionBonus + adjustedLocal;
  const effectivePrice = Math.max(0, parsed.vehiclePrice - totalSubsidy);

  return calculationSuccess<EvSubsidyResult>({
    priceRate,
    priceRateLabel: tier.label,
    adjustedNational,
    youthBonus,
    conversionBonus,
    adjustedLocal,
    totalSubsidy,
    effectivePrice,
  });
}
