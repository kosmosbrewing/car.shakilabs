import { describe, expect, it } from "vitest";
import {
  compareEvVsGas,
  compareParkingOptions,
  calculateMaintenanceBudget,
  EV_VS_GAS_INPUT_LIMITS,
  MAINTENANCE_INPUT_LIMITS,
  PARKING_DAILY_CAP,
  PARKING_INPUT_LIMITS,
} from "@/utils/ownershipCalculator";

/**
 * 계산 규칙 상수의 단일 출처 회귀 테스트.
 *
 * 이 앱의 실제 사고 유형은 "로직과 화면에 같은 숫자를 각각 박아두고 한쪽만 고치는 것"이다.
 * (일 최대요금 상한 15,000원이 compareParkingOptions와 ParkingView에 따로 있었다)
 * 그 경우 계산은 새 값으로 하는데 화면 설명은 옛 값을 말해 결과를 재현할 수 없게 된다.
 *
 * 여기서는 "상수를 바꾸면 화면 표시도 따라 바뀐다"를 두 단계로 못박는다.
 *   1) 값 결속 — export한 상수가 로직이 실제로 적용하는 바로 그 값인지 (동작 검증)
 *   2) 렌더 결속 — 화면이 그 상수를 렌더하는지, 숫자를 다시 적지 않았는지 (소스 검증)
 * 둘을 합치면 상수 → 로직 → 화면의 사슬이 닫힌다. 한 곳만으로는 닫히지 않는다:
 * (1)만 있으면 화면이 옛 숫자를 그대로 들고 있어도 통과하고,
 * (2)만 있으면 로직이 상수를 무시해도 통과한다.
 *
 * 컴포넌트 렌더 테스트가 아니라 소스 스캔인 이유는 이 저장소에 @vue/test-utils가 없기 때문이다.
 * 같은 방식의 선례가 lib/gradientGuard.test.ts에 있다.
 */

// 루트 상대 글롭(/src/**)을 쓴다. "../**"는 이 테스트가 놓인 디렉터리(utils/)를
// 통째로 결과에서 빼버려서 계산 모듈이 조용히 검사 대상 밖으로 빠진다.
const sources = import.meta.glob("/src/**/*.{vue,ts}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function sourceOf(suffix: string): string {
  const hit = Object.entries(sources).find(([path]) => path.endsWith(suffix));
  // 파일이 이동·개명되면 조용히 통과하지 않고 여기서 터져야 한다.
  if (!hit) throw new Error(`source not found: ${suffix}`);
  return hit[1];
}

// ── 1) 값 결속: export한 상수 == 로직이 실제로 적용하는 값 ──────────────

describe("계산 상수는 로직이 실제로 쓰는 값이다", () => {
  it("PARKING_DAILY_CAP이 일 최대요금 산식에 그대로 적용된다", () => {
    const daysPerMonth = 10;
    const hoursPerDay = PARKING_INPUT_LIMITS.hoursPerDay.max;
    const hourlyRate = PARKING_INPUT_LIMITS.hourlyRate.max;

    // 상한이 실제로 물리는 조건인지 먼저 확인한다 (안 물리면 아래 단언이 무의미하다)
    expect(hoursPerDay * hourlyRate).toBeGreaterThan(PARKING_DAILY_CAP);

    const state = compareParkingOptions({ daysPerMonth, hoursPerDay, hourlyRate, monthlyPass: 0 });
    expect(state.success).toBe(true);
    if (!state.success) return;

    const dayCap = state.data.items.find((item) => item.key === "daycap");
    expect(dayCap?.total).toBe(daysPerMonth * PARKING_DAILY_CAP);
  });

  it("주차 입력 한계는 zod 스키마가 실제로 강제하는 경계다", () => {
    const base = { daysPerMonth: 20, hoursPerDay: 8, hourlyRate: 2_000, monthlyPass: 180_000 };
    const { daysPerMonth, hoursPerDay, hourlyRate } = PARKING_INPUT_LIMITS;

    expect(compareParkingOptions({ ...base, daysPerMonth: daysPerMonth.max }).success).toBe(true);
    expect(compareParkingOptions({ ...base, daysPerMonth: daysPerMonth.max + 1 }).success).toBe(false);
    expect(compareParkingOptions({ ...base, daysPerMonth: daysPerMonth.min - 1 }).success).toBe(false);

    expect(compareParkingOptions({ ...base, hoursPerDay: hoursPerDay.max }).success).toBe(true);
    expect(compareParkingOptions({ ...base, hoursPerDay: hoursPerDay.max + 1 }).success).toBe(false);

    expect(compareParkingOptions({ ...base, hourlyRate: hourlyRate.min }).success).toBe(true);
    expect(compareParkingOptions({ ...base, hourlyRate: hourlyRate.min - 1 }).success).toBe(false);
  });

  it("유지비·전기차 입력 한계도 스키마 경계와 일치한다", () => {
    const maintenance = { annualKm: 15_000, vehicleAge: 5, fuelType: "ev" as const };
    expect(calculateMaintenanceBudget({ ...maintenance, annualKm: MAINTENANCE_INPUT_LIMITS.annualKm.min }).success).toBe(true);
    expect(calculateMaintenanceBudget({ ...maintenance, annualKm: MAINTENANCE_INPUT_LIMITS.annualKm.min - 1 }).success).toBe(false);
    expect(calculateMaintenanceBudget({ ...maintenance, vehicleAge: MAINTENANCE_INPUT_LIMITS.vehicleAge.max }).success).toBe(true);
    expect(calculateMaintenanceBudget({ ...maintenance, vehicleAge: MAINTENANCE_INPUT_LIMITS.vehicleAge.max + 1 }).success).toBe(false);

    const evVsGas = { annualKm: 20_000, gasPrice: 1_700, electricityPrice: 180, gasEfficiency: 11, evKwhPerKm: 0.18 };
    expect(compareEvVsGas({ ...evVsGas, gasPrice: EV_VS_GAS_INPUT_LIMITS.gasPrice.max }).success).toBe(true);
    expect(compareEvVsGas({ ...evVsGas, gasPrice: EV_VS_GAS_INPUT_LIMITS.gasPrice.max + 1 }).success).toBe(false);
    expect(compareEvVsGas({ ...evVsGas, evKwhPerKm: EV_VS_GAS_INPUT_LIMITS.evKwhPerKm.min }).success).toBe(true);
    expect(compareEvVsGas({ ...evVsGas, evKwhPerKm: EV_VS_GAS_INPUT_LIMITS.evKwhPerKm.min / 2 }).success).toBe(false);
  });
});

// ── 2) 렌더 결속: 화면이 상수를 렌더하고, 숫자를 다시 적지 않는다 ────────

interface Binding {
  /** 무엇을 단일 출처화했는지 */
  what: string;
  /** 검사 대상 소스 파일 (접미사 매칭) */
  file: string;
  /** 이 파일에 반드시 등장해야 하는 심볼 */
  symbols: string[];
  /** 다시 적으면 안 되는 리터럴 */
  forbidden: RegExp[];
}

const BINDINGS: Binding[] = [
  {
    what: "일 최대요금 상한 + 주차 입력 한계",
    file: "views/ParkingView.vue",
    symbols: ["PARKING_DAILY_CAP", "PARKING_INPUT_LIMITS"],
    // 상한 금액 리터럴, 그리고 input의 하드코딩된 min/max
    forbidden: [/15[_,]000/, /\b(?:min|max)="[0-9]/],
  },
  {
    what: "유지비 입력 한계",
    file: "views/MaintenanceView.vue",
    symbols: ["MAINTENANCE_INPUT_LIMITS"],
    forbidden: [/\b(?:min|max)="[0-9]/],
  },
  {
    what: "국고보조금 상한 · 청년 가산율 · 전기차 비교 입력 한계",
    file: "views/EvVsGasView.vue",
    symbols: ["NATIONAL_SUBSIDY_MAX", "YOUTH_BONUS_RATE", "EV_VS_GAS_INPUT_LIMITS"],
    forbidden: [
      /5[_,]?800[_,]?000/,
      /580만/,
      /국고 20%/,
      /\bmin="1000"/,
      /\bmin="100"/,
      /\bmin="5"/,
      /\bmin="0\.08"/,
    ],
  },
  {
    what: "경차 취득세 감면 한도",
    file: "views/CarTaxView.vue",
    symbols: ["LIGHT_CAR_TAX_EXEMPT_LIMIT"],
    forbidden: [/75만/],
  },
  {
    what: "경차 취득세 감면 한도 (계산 모듈 안내 문구)",
    file: "utils/calculator-tax.ts",
    symbols: ["LIGHT_CAR_TAX_EXEMPT_LIMIT"],
    forbidden: [/75만/],
  },
  {
    what: "블랙박스 할인 연식 상한",
    file: "views/InsuranceView.vue",
    symbols: ["BLACKBOX_DISCOUNT_MAX_VEHICLE_AGE"],
    forbidden: [/13년/],
  },
  {
    what: "블랙박스 할인 연식 상한 (계산 모듈 안내 문구)",
    file: "utils/calculator-insurance.ts",
    symbols: ["BLACKBOX_DISCOUNT_MAX_VEHICLE_AGE"],
    forbidden: [/13년/, /\b12\b/],
  },
  {
    what: "출처 기준일",
    file: "views/CarTaxView.vue",
    symbols: ["CAR_TAX_DATA_UPDATED"],
    forbidden: [/updated-at="[0-9]/],
  },
  {
    what: "출처 기준일",
    file: "views/InsuranceView.vue",
    symbols: ["INSURANCE_DATA_UPDATED"],
    forbidden: [/updated-at="[0-9]/],
  },
  {
    what: "출처 기준일",
    file: "views/LeaseVsLoanView.vue",
    symbols: ["LEASE_DATA_UPDATED"],
    forbidden: [/updated-at="[0-9]/],
  },
];

describe("화면은 계산 상수를 렌더한다 (숫자 재기입 금지)", () => {
  it.each(BINDINGS)("$file — $what", ({ file, symbols, forbidden }) => {
    const source = sourceOf(file);
    for (const symbol of symbols) {
      expect(source, `${file}가 ${symbol}을 참조해야 한다`).toContain(symbol);
    }
    for (const pattern of forbidden) {
      expect(source, `${file}에 ${pattern} 리터럴을 다시 적었다 — 상수를 참조하라`).not.toMatch(pattern);
    }
  });
});
