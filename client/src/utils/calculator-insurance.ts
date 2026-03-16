import {
  ACCIDENT_SURCHARGES,
  BLACKBOX_DISCOUNT,
  DEDUCTIBLE_DISCOUNTS,
  DIRECT_DISCOUNT_RATE,
  EXPERIENCE_DISCOUNTS,
  MILEAGE_DISCOUNTS,
} from "@/data/insuranceRates";
import type {
  InsuranceBreakdown,
  InsuranceInput,
  SavingItem,
} from "./calculator-types";
import { roundWon } from "./calculator-helpers";

function resolveExperienceDiscount(experienceYears: number): number {
  return (
    EXPERIENCE_DISCOUNTS.find(
      (entry) => experienceYears >= entry.minYears && experienceYears <= entry.maxYears
    )?.discountRate ?? 0
  );
}

function applyDiscount(
  currentPremium: number,
  rate: number,
  label: string
): { nextPremium: number; item: SavingItem | null } {
  if (rate <= 0) return { nextPremium: currentPremium, item: null };
  const nextPremium = currentPremium * (1 - rate);
  return {
    nextPremium,
    item: {
      label,
      rate,
      amount: roundWon(nextPremium - currentPremium),
      kind: "discount",
    },
  };
}

function applySurcharge(
  currentPremium: number,
  rate: number,
  label: string
): { nextPremium: number; item: SavingItem | null } {
  if (rate <= 0) return { nextPremium: currentPremium, item: null };
  const nextPremium = currentPremium * (1 + rate);
  return {
    nextPremium,
    item: {
      label,
      rate,
      amount: roundWon(nextPremium - currentPremium),
      kind: "surcharge",
    },
  };
}

export function calcInsurance(input: InsuranceInput): InsuranceBreakdown {
  let runningPremium = input.currentPremium;
  const items: SavingItem[] = [];
  const notes: string[] = [];

  const experienceDiscount = resolveExperienceDiscount(input.experienceYears);
  const experienceStep = applyDiscount(
    runningPremium,
    experienceDiscount,
    `가입 경력 ${input.experienceYears}년 할인`
  );
  if (experienceStep.item) items.push(experienceStep.item);
  runningPremium = experienceStep.nextPremium;

  const accidentSurcharge =
    ACCIDENT_SURCHARGES[Math.min(3, Math.max(0, input.accidentCount))] ?? 0;
  const accidentStep = applySurcharge(
    runningPremium,
    accidentSurcharge,
    `최근 3년 사고 ${input.accidentCount}건 할증`
  );
  if (accidentStep.item) items.push(accidentStep.item);
  runningPremium = accidentStep.nextPremium;

  const mileageDiscount = MILEAGE_DISCOUNTS[input.mileageRange];
  const mileageStep = applyDiscount(
    runningPremium,
    mileageDiscount,
    `마일리지 특약 ${Number(input.mileageRange).toLocaleString("ko-KR")}km`
  );
  if (mileageStep.item) items.push(mileageStep.item);
  runningPremium = mileageStep.nextPremium;

  if (input.hasBlackbox && input.vehicleAgeYears <= 12) {
    const blackboxStep = applyDiscount(runningPremium, BLACKBOX_DISCOUNT, "블랙박스 할인");
    if (blackboxStep.item) items.push(blackboxStep.item);
    runningPremium = blackboxStep.nextPremium;
  } else if (input.hasBlackbox && input.vehicleAgeYears > 12) {
    notes.push("차량 연식 13년 이상은 블랙박스 할인 적용을 보수적으로 제외했습니다.");
  }

  const deductibleDiscount = DEDUCTIBLE_DISCOUNTS[input.deductibleLevel];
  const deductibleStep = applyDiscount(
    runningPremium,
    deductibleDiscount,
    `자기부담금 ${Number(input.deductibleLevel).toLocaleString("ko-KR")}원`
  );
  if (deductibleStep.item) items.push(deductibleStep.item);
  runningPremium = deductibleStep.nextPremium;

  const estimatedPremium = roundWon(Math.max(0, runningPremium));
  const directDiscountAmount = roundWon(estimatedPremium * DIRECT_DISCOUNT_RATE);
  const finalPremium = Math.max(0, estimatedPremium - directDiscountAmount);
  const savingsAmount = input.currentPremium - estimatedPremium;
  const totalSavingsWithDirect = input.currentPremium - finalPremium;
  const totalDiscountRate =
    input.currentPremium > 0
      ? 1 - finalPremium / input.currentPremium
      : 0;

  notes.push("다이렉트 전환 절감액은 주요 보험사의 공개 할인 범위를 보수적으로 단순화한 가정입니다.");

  return {
    currentPremium: input.currentPremium,
    estimatedPremium,
    finalPremium,
    savingsAmount,
    directDiscountAmount,
    totalSavingsWithDirect,
    totalDiscountRate,
    items,
    notes,
  };
}
