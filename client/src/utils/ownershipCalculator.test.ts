import { describe, expect, it } from "vitest";
import {
  calculateMaintenanceBudget,
  compareEvVsGas,
  compareParkingOptions,
  calculateEvSubsidy,
} from "@/utils/ownershipCalculator";
import type { CalculationState } from "@/utils/calculationState";

function expectSuccess<T>(state: CalculationState<T>): T {
  expect(state.success).toBe(true);
  if (!state.success) throw new Error(state.message);
  return state.data;
}

describe("ownershipCalculator", () => {
  it("주차 20일, 8시간, 시간당 2천원은 월주차가 가장 저렴하다", () => {
    const result = expectSuccess(compareParkingOptions({ daysPerMonth: 20, hoursPerDay: 8, hourlyRate: 2_000, monthlyPass: 180_000 }));
    expect(result.bestOption.key).toBe("monthly");
    expect(result.spread).toBe(140_000);
  });

  it("전기차 유지비는 세금이 낮다", () => {
    const result = expectSuccess(calculateMaintenanceBudget({ annualKm: 15_000, vehicleAge: 5, fuelType: "ev" }));
    expect(result.tax).toBe(130_000);
    expect(result.total).toBe(1_645_000);
  });

  it("연 2만km면 전기차 총비용이 더 낮게 나온다", () => {
    const result = expectSuccess(compareEvVsGas({
      annualKm: 20_000,
      gasPrice: 1_700,
      electricityPrice: 180,
      gasEfficiency: 11,
      evKwhPerKm: 0.18,
    }));
    expect(result.winner).toBe("ev");
    expect(result.gap).toBe(3_082_909);
  });

  it("범위를 벗어난 유지비 입력은 복구 가능한 실패 상태를 반환한다", () => {
    const states = [
      compareParkingOptions({ daysPerMonth: 0, hoursPerDay: 8, hourlyRate: 2_000, monthlyPass: 180_000 }),
      calculateMaintenanceBudget({ annualKm: 0, vehicleAge: 5, fuelType: "ev" }),
      compareEvVsGas({ annualKm: 0, gasPrice: 1_700, electricityPrice: 180, gasEfficiency: 11, evKwhPerKm: 0.18 }),
    ];
    expect(states.every((state) => !state.success)).toBe(true);
  });
});

describe("calculateEvSubsidy", () => {
  const baseInput = {
    vehiclePrice: 45_000_000,
    nationalSubsidy: 3_400_000,
    localSubsidy: 2_000_000,
    isYouth: false,
    isConversion: false,
  };

  it("5,000만원 미만 차량은 보조금 100% 지급", () => {
    const result = expectSuccess(calculateEvSubsidy(baseInput));
    expect(result.priceRate).toBe(1.0);
    expect(result.adjustedNational).toBe(3_400_000);
    expect(result.adjustedLocal).toBe(2_000_000);
    expect(result.totalSubsidy).toBe(5_400_000);
    expect(result.effectivePrice).toBe(39_600_000);
  });

  it("5,000~8,500만원 차량은 보조금 50% 지급", () => {
    const result = expectSuccess(calculateEvSubsidy({ ...baseInput, vehiclePrice: 60_000_000 }));
    expect(result.priceRate).toBe(0.5);
    expect(result.adjustedNational).toBe(1_700_000);
    expect(result.adjustedLocal).toBe(1_000_000);
    expect(result.totalSubsidy).toBe(2_700_000);
    expect(result.effectivePrice).toBe(57_300_000);
  });

  it("8,500만원 이상 차량은 보조금 미지원", () => {
    const result = expectSuccess(calculateEvSubsidy({ ...baseInput, vehiclePrice: 90_000_000 }));
    expect(result.priceRate).toBe(0);
    expect(result.totalSubsidy).toBe(0);
    expect(result.effectivePrice).toBe(90_000_000);
  });

  it("청년 가산은 가격 조정된 국고보조금의 20%", () => {
    const result = expectSuccess(calculateEvSubsidy({ ...baseInput, isYouth: true }));
    expect(result.youthBonus).toBe(680_000);
    expect(result.totalSubsidy).toBe(6_080_000);
  });

  it("전환지원금은 100만원 고정 추가", () => {
    const result = expectSuccess(calculateEvSubsidy({ ...baseInput, isConversion: true }));
    expect(result.conversionBonus).toBe(1_000_000);
    expect(result.totalSubsidy).toBe(6_400_000);
  });

  it("잘못된 보조금 입력은 예외 없이 실패 상태를 반환한다", () => {
    const result = calculateEvSubsidy({ ...baseInput, nationalSubsidy: -1 });
    expect(result.success).toBe(false);
  });
});
