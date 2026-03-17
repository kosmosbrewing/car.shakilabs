import { describe, expect, it } from "vitest";
import {
  calculateMaintenanceBudget,
  compareEvVsGas,
  compareParkingOptions,
} from "@/utils/ownershipCalculator";

describe("ownershipCalculator", () => {
  it("주차 20일, 8시간, 시간당 2천원은 월주차가 가장 저렴하다", () => {
    const result = compareParkingOptions({ daysPerMonth: 20, hoursPerDay: 8, hourlyRate: 2_000, monthlyPass: 180_000 });
    expect(result.bestOption.key).toBe("monthly");
    expect(result.spread).toBe(140_000);
  });

  it("전기차 유지비는 세금이 낮다", () => {
    const result = calculateMaintenanceBudget({ annualKm: 15_000, vehicleAge: 5, fuelType: "ev" });
    expect(result.tax).toBe(130_000);
    expect(result.total).toBe(1_645_000);
  });

  it("연 2만km면 전기차 총비용이 더 낮게 나온다", () => {
    const result = compareEvVsGas({
      annualKm: 20_000,
      gasPrice: 1_700,
      electricityPrice: 180,
      gasEfficiency: 11,
      evKwhPerKm: 0.18,
    });
    expect(result.winner).toBe("ev");
    expect(result.gap).toBe(3_082_909);
  });
});
