import { describe, expect, it } from "vitest";
import { MODEL_PRESETS, REGIONAL_SUBSIDIES } from "@/data/ownershipData";

describe("2026 EV subsidy snapshot", () => {
  it("차종별 국고보조금 공시값을 유지한다", () => {
    expect(MODEL_PRESETS.find((item) => item.label.includes("아이오닉 6"))?.subsidy).toBe(5_700_000);
    expect(MODEL_PRESETS.find((item) => item.label.includes("모델 3"))?.subsidy).toBe(2_100_000);
  });

  it("지자체 범위 지역은 보수적인 최솟값을 사용한다", () => {
    expect(REGIONAL_SUBSIDIES.find((item) => item.key === "gyeonggi")?.subsidy).toBe(1_940_000);
    expect(REGIONAL_SUBSIDIES.find((item) => item.key === "gyeongbuk")?.subsidy).toBe(6_670_000);
  });
});
