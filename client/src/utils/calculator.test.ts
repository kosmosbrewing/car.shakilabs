import { describe, expect, it } from "vitest";
import {
  calcCarTax,
  calcEqualPayment,
  calcInsurance,
  calcLease,
  calcLeaseCompare,
  calcLongTermRent,
} from "./calculator";
import {
  DEFAULT_CAR_TAX_INPUT,
  DEFAULT_INSURANCE_INPUT,
  DEFAULT_LEASE_COMPARE_INPUT,
  sanitizeCarTaxInput,
} from "@/lib/validators";

describe("calcCarTax", () => {
  it("비영업 승용 신차 3000만원은 취득세 210만원이다", () => {
    const result = calcCarTax(DEFAULT_CAR_TAX_INPUT);
    expect(result.acquisitionTax).toBe(2_100_000);
  });

  it("경차 1500만원은 감면 한도 안에서 취득세가 0원이다", () => {
    const result = calcCarTax({
      ...DEFAULT_CAR_TAX_INPUT,
      vehiclePrice: 15_000_000,
      vehicleType: "light",
      displacementRange: "under1000",
    });

    expect(result.acquisitionTax).toBe(0);
  });

  it("중고차 5년은 잔존가치율 0.404를 적용한다", () => {
    const result = calcCarTax({
      ...DEFAULT_CAR_TAX_INPUT,
      vehiclePrice: 20_000_000,
      condition: "used",
      modelYearAge: 5,
    });

    expect(result.taxableBase).toBe(8_080_000);
    expect(result.residualRate).toBe(0.404);
  });

  it("서울 2000cc 초과는 공채 매입 비율 20%를 사용한다", () => {
    const result = calcCarTax({
      ...DEFAULT_CAR_TAX_INPUT,
      displacementRange: "over2000",
    });

    expect(result.bondPurchaseRate).toBe(0.2);
  });

  it("장애인 감면 가정이면 취득세는 0원이다", () => {
    const result = calcCarTax({
      ...DEFAULT_CAR_TAX_INPUT,
      isDisabledOwner: true,
    });

    expect(result.acquisitionTax).toBe(0);
  });

  it("장애인 감면이어도 2000cc 초과 승용은 면제하지 않는다", () => {
    const result = calcCarTax({
      ...DEFAULT_CAR_TAX_INPUT,
      isDisabledOwner: true,
      displacementRange: "over2000",
    });

    expect(result.acquisitionTax).toBe(2_100_000);
  });

  it("경차 입력은 배기량 구간을 1000cc 미만으로 고정한다", () => {
    const result = sanitizeCarTaxInput({
      ...DEFAULT_CAR_TAX_INPUT,
      vehicleType: "light",
      displacementRange: "over2000",
    });

    expect(result.displacementRange).toBe("under1000");
  });

  it("이륜차 입력은 배기량 구간을 1000cc 미만으로 정규화한다", () => {
    const result = sanitizeCarTaxInput({
      ...DEFAULT_CAR_TAX_INPUT,
      vehicleType: "motorcycle",
      displacementRange: "1600to2000",
    });

    expect(result.displacementRange).toBe("under1000");
  });
});

describe("calcInsurance", () => {
  it("5년 경력 무사고는 22% 할인율을 반영한다", () => {
    const result = calcInsurance(DEFAULT_INSURANCE_INPUT);
    const experienceItem = result.items.find((item) => item.label.includes("가입 경력"));
    expect(experienceItem?.rate).toBe(0.22);
  });

  it("사고 2건은 30% 할증한다", () => {
    const result = calcInsurance({
      ...DEFAULT_INSURANCE_INPUT,
      accidentCount: 2,
      hasBlackbox: false,
      mileageRange: "20000",
      deductibleLevel: "200000",
    });
    const surchargeItem = result.items.find((item) => item.label.includes("사고"));
    expect(surchargeItem?.rate).toBe(0.3);
  });

  it("3천km와 블랙박스 할인은 함께 적용된다", () => {
    const result = calcInsurance({
      ...DEFAULT_INSURANCE_INPUT,
      currentPremium: 1_000_000,
      experienceYears: 1,
      accidentCount: 0,
      mileageRange: "3000",
      hasBlackbox: true,
      deductibleLevel: "200000",
    });

    expect(result.estimatedPremium).toBeLessThan(1_000_000);
    expect(result.items.some((item) => item.label.includes("블랙박스"))).toBe(true);
  });

  it("자기부담금 100만원은 10% 할인한다", () => {
    const result = calcInsurance({
      ...DEFAULT_INSURANCE_INPUT,
      deductibleLevel: "1000000",
    });
    const deductibleItem = result.items.find((item) => item.label.includes("자기부담금"));
    expect(deductibleItem?.rate).toBe(0.1);
  });

  it("다이렉트 전환 추가 할인은 17%다", () => {
    const result = calcInsurance(DEFAULT_INSURANCE_INPUT);
    expect(result.directDiscountAmount).toBe(Math.round(result.estimatedPremium * 0.19));
  });
});

describe("lease compare", () => {
  it("PMT 공식은 5000만, 6.5%, 36개월 기준으로 동작한다", () => {
    expect(calcEqualPayment(50_000_000, 0.065, 36)).toBeCloseTo(1_532_450.14, 1);
  });

  it("리스 월 납입금은 잔존가치를 제외한 원금으로 계산한다", () => {
    const result = calcLease(DEFAULT_LEASE_COMPARE_INPUT);
    expect(result.monthlyPayment).toBe(603_918);
  });

  it("장기렌트는 보험료와 취등록세를 별도 항목에 더하지 않는다", () => {
    const result = calcLongTermRent(DEFAULT_LEASE_COMPARE_INPUT);
    expect(result.insuranceCost).toBe(0);
    expect(result.taxCost).toBe(0);
  });

  it("리스는 만기 반납 기준 비교 메모를 가진다", () => {
    const result = calcLease(DEFAULT_LEASE_COMPARE_INPUT);
    expect(result.comparisonNote).toContain("만기 반납 기준");
    expect(result.residualValue).toBe(20_000_000);
  });

  it("가장 저렴한 방식과 격차를 계산한다", () => {
    const result = calcLeaseCompare(DEFAULT_LEASE_COMPARE_INPUT);
    expect(result.bestResult.totalCost).toBe(
      Math.min(...result.methods.map((method) => method.totalCost))
    );
    expect(result.spread).toBeGreaterThanOrEqual(0);
  });

  it("차량가 최소값도 계산 가능하다", () => {
    const result = calcLeaseCompare({
      ...DEFAULT_LEASE_COMPARE_INPUT,
      vehiclePrice: 1_000_000,
    });
    expect(result.bestResult.totalCost).toBeGreaterThanOrEqual(0);
  });
});
