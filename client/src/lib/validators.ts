import { z } from "zod";
import type {
  DisplacementRange,
  Region,
  VehicleCondition,
  VehicleType,
} from "@/data/carTaxRates";
import type {
  DeductibleLevel,
  MileageRange,
} from "@/data/insuranceRates";
import type {
  DepositRateOption,
  ResidualRateOption,
  TermMonths,
} from "@/data/leaseRates";
import {
  DEFAULT_ANNUAL_INSURANCE,
  DEFAULT_LEASE_RATE,
  DEFAULT_LOAN_RATE,
  DEFAULT_RENT_MANAGEMENT_RATE,
} from "@/data/leaseRates";
import type {
  CarTaxInput,
  InsuranceInput,
  LeaseCompareInput,
} from "@/utils/calculator";

export const CAR_PRICE_MIN = 1_000_000;
export const CAR_PRICE_MAX = 300_000_000;
/** 슬라이더 UX용 상한 — 텍스트 입력은 CAR_PRICE_MAX까지 허용 */
export const CAR_PRICE_SLIDER_MAX = 100_000_000;
export const INSURANCE_PREMIUM_MIN = 100_000;
export const INSURANCE_PREMIUM_MAX = 3_000_000;

const vehicleTypeValues = [
  "passenger",
  "passengerBiz",
  "van",
  "vanBiz",
  "truck",
  "special",
  "light",
  "motorcycle",
] as const;
const conditionValues = ["new", "used"] as const;
const displacementValues = [
  "under1000",
  "1000to1600",
  "1600to2000",
  "over2000",
] as const;
const regionValues = ["seoul", "gyeonggi", "other"] as const;
const mileageValues = ["3000", "5000", "7000", "10000", "15000", "20000"] as const;
const deductibleValues = ["200000", "300000", "500000", "1000000", "2000000"] as const;
const depositValues = [0, 0.1, 0.2, 0.3] as const;
const termValues = [24, 36, 48, 60] as const;
const residualValues = [0.3, 0.4, 0.5, 0.6] as const;

export const DEFAULT_CAR_TAX_INPUT: CarTaxInput = {
  vehiclePrice: 30_000_000,
  vehicleType: "passenger",
  condition: "new",
  modelYearAge: 1,
  displacementRange: "1600to2000",
  region: "seoul",
  isDisabledOwner: false,
  applyPlateAgencyFee: true,
};

export const DEFAULT_INSURANCE_INPUT: InsuranceInput = {
  currentPremium: 700_000,
  experienceYears: 5,
  accidentCount: 0,
  mileageRange: "10000",
  hasBlackbox: true,
  vehicleAgeYears: 5,
  deductibleLevel: "200000",
};

export const DEFAULT_LEASE_COMPARE_INPUT: LeaseCompareInput = {
  vehiclePrice: 50_000_000,
  depositRate: 0.2,
  termMonths: 36,
  residualRate: 0.4,
  leaseRate: DEFAULT_LEASE_RATE,
  loanRate: DEFAULT_LOAN_RATE,
  annualInsurance: DEFAULT_ANNUAL_INSURANCE,
  acquisitionTaxRate: 0.07,
  rentManagementRate: DEFAULT_RENT_MANAGEMENT_RATE,
};

export const carTaxInputSchema = z.object({
  vehiclePrice: z.number().int().min(CAR_PRICE_MIN).max(CAR_PRICE_MAX),
  vehicleType: z.enum(vehicleTypeValues),
  condition: z.enum(conditionValues),
  modelYearAge: z.number().int().min(1).max(15),
  displacementRange: z.enum(displacementValues),
  region: z.enum(regionValues),
  isDisabledOwner: z.boolean(),
  applyPlateAgencyFee: z.boolean(),
});

export const insuranceInputSchema = z.object({
  currentPremium: z.number().int().min(INSURANCE_PREMIUM_MIN).max(INSURANCE_PREMIUM_MAX),
  experienceYears: z.number().int().min(1).max(20),
  accidentCount: z.number().int().min(0).max(3),
  mileageRange: z.enum(mileageValues),
  hasBlackbox: z.boolean(),
  vehicleAgeYears: z.number().int().min(0).max(20),
  deductibleLevel: z.enum(deductibleValues),
});

export const leaseCompareInputSchema = z.object({
  vehiclePrice: z.number().int().min(CAR_PRICE_MIN).max(CAR_PRICE_MAX),
  depositRate: z.union([
    z.literal(0),
    z.literal(0.1),
    z.literal(0.2),
    z.literal(0.3),
  ]),
  termMonths: z.union([
    z.literal(24),
    z.literal(36),
    z.literal(48),
    z.literal(60),
  ]),
  residualRate: z.union([
    z.literal(0.3),
    z.literal(0.4),
    z.literal(0.5),
    z.literal(0.6),
  ]),
  leaseRate: z.number().min(0).max(0.2),
  loanRate: z.number().min(0).max(0.2),
  annualInsurance: z.number().int().min(0).max(5_000_000),
  acquisitionTaxRate: z.number().min(0).max(0.2),
  rentManagementRate: z.number().min(0).max(0.5),
});

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.replace(/,/g, "").trim();
    if (normalized.length === 0) return null;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function toBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["1", "true", "y", "yes"].includes(normalized)) return true;
    if (["0", "false", "n", "no"].includes(normalized)) return false;
  }

  return null;
}

function parseStringEnum<T extends readonly string[]>(
  values: T,
  value: unknown
): T[number] | null {
  return typeof value === "string" && values.includes(value as T[number])
    ? (value as T[number])
    : null;
}

function parseNumberEnum<T extends readonly number[]>(
  values: T,
  value: unknown
): T[number] | null {
  const numeric = toNumber(value);
  return numeric != null && values.includes(numeric as T[number])
    ? (numeric as T[number])
    : null;
}

function clampInt(value: unknown, fallback: number, min: number, max: number): number {
  const numeric = toNumber(value);
  if (numeric == null) return fallback;
  return Math.min(max, Math.max(min, Math.round(numeric)));
}

function clampFloat(value: unknown, fallback: number, min: number, max: number): number {
  const numeric = toNumber(value);
  if (numeric == null) return fallback;
  return Math.min(max, Math.max(min, numeric));
}

export function sanitizeCarTaxInput(input: Partial<Record<keyof CarTaxInput, unknown>>): CarTaxInput {
  const candidate: CarTaxInput = {
    vehiclePrice: clampInt(input.vehiclePrice, DEFAULT_CAR_TAX_INPUT.vehiclePrice, CAR_PRICE_MIN, CAR_PRICE_MAX),
    vehicleType:
      parseStringEnum(vehicleTypeValues, input.vehicleType) ??
      DEFAULT_CAR_TAX_INPUT.vehicleType,
    condition:
      parseStringEnum(conditionValues, input.condition) ??
      DEFAULT_CAR_TAX_INPUT.condition,
    modelYearAge: clampInt(input.modelYearAge, DEFAULT_CAR_TAX_INPUT.modelYearAge, 1, 15),
    displacementRange:
      parseStringEnum(displacementValues, input.displacementRange) ??
      DEFAULT_CAR_TAX_INPUT.displacementRange,
    region:
      parseStringEnum(regionValues, input.region) ??
      DEFAULT_CAR_TAX_INPUT.region,
    isDisabledOwner:
      toBoolean(input.isDisabledOwner) ?? DEFAULT_CAR_TAX_INPUT.isDisabledOwner,
    applyPlateAgencyFee:
      toBoolean(input.applyPlateAgencyFee) ??
      DEFAULT_CAR_TAX_INPUT.applyPlateAgencyFee,
  };

  if (candidate.vehicleType === "light" || candidate.vehicleType === "motorcycle") {
    candidate.displacementRange = "under1000";
  }

  const parsed = carTaxInputSchema.safeParse(candidate);
  return parsed.success ? parsed.data : DEFAULT_CAR_TAX_INPUT;
}

export function sanitizeInsuranceInput(
  input: Partial<Record<keyof InsuranceInput, unknown>>
): InsuranceInput {
  const candidate: InsuranceInput = {
    currentPremium: clampInt(
      input.currentPremium,
      DEFAULT_INSURANCE_INPUT.currentPremium,
      INSURANCE_PREMIUM_MIN,
      INSURANCE_PREMIUM_MAX
    ),
    experienceYears: clampInt(input.experienceYears, DEFAULT_INSURANCE_INPUT.experienceYears, 1, 20),
    accidentCount: clampInt(input.accidentCount, DEFAULT_INSURANCE_INPUT.accidentCount, 0, 3),
    mileageRange:
      parseStringEnum(mileageValues, input.mileageRange) ??
      DEFAULT_INSURANCE_INPUT.mileageRange,
    hasBlackbox: toBoolean(input.hasBlackbox) ?? DEFAULT_INSURANCE_INPUT.hasBlackbox,
    vehicleAgeYears: clampInt(input.vehicleAgeYears, DEFAULT_INSURANCE_INPUT.vehicleAgeYears, 0, 20),
    deductibleLevel:
      parseStringEnum(deductibleValues, input.deductibleLevel) ??
      DEFAULT_INSURANCE_INPUT.deductibleLevel,
  };

  const parsed = insuranceInputSchema.safeParse(candidate);
  return parsed.success ? parsed.data : DEFAULT_INSURANCE_INPUT;
}

export function sanitizeLeaseCompareInput(
  input: Partial<Record<keyof LeaseCompareInput, unknown>>
): LeaseCompareInput {
  const candidate: LeaseCompareInput = {
    vehiclePrice: clampInt(input.vehiclePrice, DEFAULT_LEASE_COMPARE_INPUT.vehiclePrice, CAR_PRICE_MIN, CAR_PRICE_MAX),
    depositRate:
      parseNumberEnum(depositValues, input.depositRate) ??
      DEFAULT_LEASE_COMPARE_INPUT.depositRate,
    termMonths:
      parseNumberEnum(termValues, input.termMonths) ??
      DEFAULT_LEASE_COMPARE_INPUT.termMonths,
    residualRate:
      parseNumberEnum(residualValues, input.residualRate) ??
      DEFAULT_LEASE_COMPARE_INPUT.residualRate,
    leaseRate: clampFloat(input.leaseRate, DEFAULT_LEASE_COMPARE_INPUT.leaseRate, 0, 0.2),
    loanRate: clampFloat(input.loanRate, DEFAULT_LEASE_COMPARE_INPUT.loanRate, 0, 0.2),
    annualInsurance: clampInt(input.annualInsurance, DEFAULT_LEASE_COMPARE_INPUT.annualInsurance, 0, 5_000_000),
    acquisitionTaxRate: clampFloat(
      input.acquisitionTaxRate,
      DEFAULT_LEASE_COMPARE_INPUT.acquisitionTaxRate,
      0,
      0.2
    ),
    rentManagementRate: clampFloat(
      input.rentManagementRate,
      DEFAULT_LEASE_COMPARE_INPUT.rentManagementRate,
      0,
      0.5
    ),
  };

  const parsed = leaseCompareInputSchema.safeParse(candidate);
  return parsed.success ? parsed.data : DEFAULT_LEASE_COMPARE_INPUT;
}

export type {
  DeductibleLevel,
  DepositRateOption,
  DisplacementRange,
  MileageRange,
  Region,
  ResidualRateOption,
  TermMonths,
  VehicleCondition,
  VehicleType,
};
