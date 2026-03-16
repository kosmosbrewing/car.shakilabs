import {
  ACQUISITION_TAX_RATES,
  BOND_PURCHASE_RATES,
  LIGHT_CAR_TAX_EXEMPT_LIMIT,
  MISC_COSTS,
  RESIDUAL_VALUE_RATES,
} from "@/data/carTaxRates";
import type { CarTaxBreakdown, CarTaxInput, TaxItem } from "./calculator-types";
import { roundWon } from "./calculator-helpers";

function getResidualRate(modelYearAge: number): number {
  const safeAge = Math.min(15, Math.max(1, Math.round(modelYearAge)));
  return RESIDUAL_VALUE_RATES[safeAge] ?? RESIDUAL_VALUE_RATES[15];
}

function isDisabilityExempt(input: CarTaxInput): boolean {
  if (!input.isDisabledOwner) return false;
  if (input.vehicleType === "light") return true;

  return input.vehicleType === "passenger" && input.displacementRange !== "over2000";
}

function isBondExempt(input: CarTaxInput): boolean {
  return input.isDisabledOwner || ["light", "motorcycle"].includes(input.vehicleType);
}

export function calcCarTax(input: CarTaxInput): CarTaxBreakdown {
  const residualRate = input.condition === "used" ? getResidualRate(input.modelYearAge) : 1;
  const taxableBase = roundWon(input.vehiclePrice * residualRate);
  const taxRate = ACQUISITION_TAX_RATES[input.vehicleType];
  const rawAcquisitionTax = roundWon(taxableBase * taxRate);

  let acquisitionTax = rawAcquisitionTax;
  const notes: string[] = [];

  if (isDisabilityExempt(input)) {
    acquisitionTax = 0;
    notes.push("장애인 감면 가정으로 취득세를 0원 처리했습니다.");
  } else if (input.vehicleType === "light") {
    acquisitionTax = Math.max(0, rawAcquisitionTax - LIGHT_CAR_TAX_EXEMPT_LIMIT);
    if (rawAcquisitionTax <= LIGHT_CAR_TAX_EXEMPT_LIMIT) {
      notes.push("경차 취득세 감면 한도(75만원) 안으로 계산되었습니다.");
    } else {
      notes.push("경차 감면 한도 75만원을 초과한 금액만 취득세에 반영했습니다.");
    }
  } else if (input.isDisabledOwner && input.displacementRange === "over2000") {
    notes.push("장애인 감면은 2,000cc 초과 승용 조건에서는 적용하지 않았습니다.");
  }

  const bondRate = isBondExempt(input)
    ? { purchaseRate: 0, discountRate: 0 }
    : BOND_PURCHASE_RATES[input.region][input.displacementRange];
  const bondPurchaseAmount = roundWon(taxableBase * bondRate.purchaseRate);
  const bondCost = roundWon(bondPurchaseAmount * bondRate.discountRate);
  const miscItems: TaxItem[] = [
    { label: "인지세", value: MISC_COSTS.stampDuty },
    { label: "증지대", value: MISC_COSTS.certificateStamp },
  ];

  if (input.applyPlateAgencyFee) {
    miscItems.push({ label: "번호판 대행 수수료", value: MISC_COSTS.plateAgencyFee });
  }

  const miscCost = miscItems.reduce((sum, item) => sum + item.value, 0);
  const totalCost = acquisitionTax + bondCost + miscCost;

  if (bondRate.purchaseRate === 0) {
    notes.push("현재 조건에서는 공채 부담을 0원으로 계산했습니다.");
  } else {
    notes.push(
      `공채 할인매각 비용은 매입비율 ${(bondRate.purchaseRate * 100).toFixed(0)}%와 할인율 ${(bondRate.discountRate * 100).toFixed(0)}% 가정입니다.`
    );
  }

  const items: TaxItem[] = [
    { label: "과세표준", value: taxableBase },
    { label: "취득세", value: acquisitionTax },
    { label: "공채 매입 기준액", value: bondPurchaseAmount },
    { label: "공채 할인매각 비용", value: bondCost },
    ...miscItems,
  ];

  return {
    vehiclePrice: input.vehiclePrice,
    taxableBase,
    residualRate,
    taxRate,
    acquisitionTax,
    bondPurchaseRate: bondRate.purchaseRate,
    bondPurchaseAmount,
    bondDiscountRate: bondRate.discountRate,
    bondCost,
    miscCost,
    totalCost,
    items,
    notes,
  };
}
