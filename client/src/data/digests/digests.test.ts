import { describe, expect, it } from "vitest";

import { CAR_SERVICE_UPDATED_AT, EV_SUBSIDY_UPDATED } from "../ownershipData";
import { CAR_TAX_DATA_UPDATED } from "../carTaxRates";
import { INSURANCE_DATA_UPDATED } from "../insuranceRates";
import { LEASE_DATA_UPDATED } from "../leaseRates";
import {
  CAR_ABOUT_GUIDE,
  CAR_EV_VS_GAS_GUIDE,
  CAR_HOME_GUIDE,
  CAR_INSURANCE_GUIDE,
  CAR_LEASE_GUIDE,
  CAR_MAINTENANCE_GUIDE,
  CAR_PARKING_GUIDE,
  CAR_TAX_GUIDE,
  type GuideData,
} from "../seoGuides";
import { DEFAULT_CAR_TAX_INPUT, DEFAULT_INSURANCE_INPUT, DEFAULT_LEASE_COMPARE_INPUT } from "@/lib/validators";
import { calcCarTax, calcInsurance, calcLeaseCompare } from "@/utils/calculator";
import {
  PARKING_DAILY_CAP,
  calculateEvSubsidy,
  calculateMaintenanceBudget,
  compareEvVsGas,
  compareParkingOptions,
} from "@/utils/ownershipCalculator";
import { type Finding, manwon, num, pct, won, wonAt } from "./format";
import {
  CAR_TAX_DIGEST,
  EV_VS_GAS_DIGEST,
  INSURANCE_DIGEST,
  LEASE_VS_LOAN_DIGEST,
  MAINTENANCE_DIGEST,
  PARKING_DIGEST,
} from "./index";
import { EV_SUBSIDY_BASE, EV_VS_GAS_BASE } from "./evVsGasDigest";
import { MAINTENANCE_BASE } from "./maintenanceDigest";
import { PARKING_BASE } from "./parkingDigest";

// 규율: 페이지당 엔진 파생 발견 8개 이상. 법령·고시 수치를 한 줄 인용한 문장은 발견이 아니므로,
// 발견마다 합산·경계·차액 같은 파생 수치가 여럿 들어 있어야 한다(숫자 토큰 4개 이상).
const MIN_FINDINGS = 8;
const MIN_NUMBER_TOKENS = 4;
// 09-05 QA: card가 "숫자 나열" 판정을 받은 원인이 연결어 부족이었다. 밀도 하한을 게이트로 박는다.
const MIN_CONNECTIVE_DENSITY = 0.25;
// h3가 두 줄이 되면 스캔성이 떨어진다 — 결론 한 줄로 제한한다.
const MAX_H3_LENGTH = 45;
// scaled content abuse 방지: 새 산문 전 쌍 유사도 0.5 미만, 기존 본문과는 0.85 미만
const MAX_PAIR_SIMILARITY = 0.5;
const MAX_LEGACY_SIMILARITY = 0.85;

const DIGESTS: Record<string, Finding[]> = {
  tax: CAR_TAX_DIGEST,
  insurance: INSURANCE_DIGEST,
  maintenance: MAINTENANCE_DIGEST,
  "ev-vs-gas": EV_VS_GAS_DIGEST,
  parking: PARKING_DIGEST,
  "lease-vs-loan": LEASE_VS_LOAN_DIGEST,
};
const ALL = Object.entries(DIGESTS).flatMap(([page, items]) => items.map((f, i) => ({ id: `${page}#${i + 1}`, ...f })));

/** 논리 연결어 — 인과·대조·환언. 숫자만 나열한 절과 분석 산문을 가르는 신호다. */
const CONNECTIVES = /때문|이유|그래서|따라서|즉 |즉,|반면|다만|하지만|그러나|대신|결국|덕분|한편|그만큼|이므로|으므로|므로|셈|반대로|게다가|오히려|그런데/g;
const density = (body: string) => ((body.match(CONNECTIVES) ?? []).length / body.length) * 100;

const compact = (text: string) => text.replace(/\s+/g, "");

function bigrams(text: string): Map<string, number> {
  const map = new Map<string, number>();
  const t = compact(text);
  for (let i = 0; i < t.length - 1; i += 1) {
    const g = t.slice(i, i + 2);
    map.set(g, (map.get(g) ?? 0) + 1);
  }
  return map;
}

/** 문자 바이그램 Dice 계수 — 0(무관)~1(동일). 순서를 무시하므로 문장 재배열 복제도 잡는다. */
function similarity(a: string, b: string): number {
  const ga = bigrams(a);
  const gb = bigrams(b);
  let shared = 0;
  for (const [g, n] of ga) shared += Math.min(n, gb.get(g) ?? 0);
  const total = [...ga.values()].reduce((s, n) => s + n, 0) + [...gb.values()].reduce((s, n) => s + n, 0);
  return total === 0 ? 0 : (2 * shared) / total;
}

describe("파생 다이제스트 — 발견 밀도", () => {
  it("사이트맵의 계산기 6페이지를 전부 덮는다", () => {
    expect(Object.keys(DIGESTS)).toHaveLength(6);
  });

  it.each(Object.entries(DIGESTS))(`%s 페이지는 발견 ${MIN_FINDINGS}개 이상`, (_page, items) => {
    expect(items.length).toBeGreaterThanOrEqual(MIN_FINDINGS);
  });

  it("발견마다 파생 수치가 여럿 들어 있고 h3가 겹치지 않는다", () => {
    const seen = new Set<string>();
    for (const f of ALL) {
      const numbers = f.body.match(/\d[\d,.]*/g) ?? [];
      expect(numbers.length, f.id).toBeGreaterThanOrEqual(MIN_NUMBER_TOKENS);
      expect(f.body.length, f.id).toBeGreaterThan(200);
      expect(seen.has(f.h2), f.h2).toBe(false);
      seen.add(f.h2);
    }
  });

  // 09-05 QA: 결론형 h3 + 인과 연결어가 "숫자 나열" 판정을 피하는 조건이었다.
  it("h3가 결론 한 줄이고 본문 연결어 밀도가 하한을 넘는다", () => {
    for (const f of ALL) {
      expect(f.h2.length, `${f.id} h3: ${f.h2}`).toBeLessThanOrEqual(MAX_H3_LENGTH);
      expect(f.h2, f.id).toMatch(/(다|까|가)$/);
      expect(density(f.body), `${f.id} 밀도`).toBeGreaterThanOrEqual(MIN_CONNECTIVE_DENSITY);
    }
  });

  // 숫자가 많은 절일수록 결론이 먼저 와야 한다. h3가 결론을 지고 있고, 본문도 인과를 두 번 이상 건다.
  it("숫자 10개를 넘는 절은 연결어를 두 번 이상 건다", () => {
    for (const f of ALL) {
      const numbers = (f.body.match(/\d[\d,.]*/g) ?? []).length;
      if (numbers <= 10) continue;
      expect((f.body.match(CONNECTIVES) ?? []).length, `${f.id} 숫자 ${numbers}`).toBeGreaterThanOrEqual(2);
    }
  });

  // YMYL: 금액·요율·기간은 사실이 아니라 사용자가 고르는 파라미터다. 문장 안에 "가정"이 드러나야 한다.
  it("발견마다 가정값임을 명시한다", () => {
    for (const f of ALL) expect(f.body, f.id).toContain("가정");
  });

  it("조사 오류와 계산 실패 흔적이 없다", () => {
    for (const f of ALL) {
      const text = `${f.h2} ${f.body}`;
      expect(text, f.id).not.toMatch(/원로 |원를 |원는 |원가 |원와 |원다 |만원로|억원로/);
      expect(text, f.id).not.toMatch(/%을 |%이 |%은 |%과 |%으로|배을 |배은 |배이 |배으로/);
      expect(text, f.id).not.toMatch(/km으로|km과 |km은 |km을 |시간로|시간를|시간는 /);
      expect(text, f.id).not.toMatch(/NaN|Infinity|undefined/);
    }
  });

  it("갱신 주기를 약속하는 말이 없다", () => {
    const banned = /매월\s*\S*\s*(반영|갱신|업데이트)|주\s*1회|매주|정기적으로\s*(갱신|업데이트)|실시간|즉시 반영|자동 갱신/;
    for (const f of ALL) expect(`${f.h2} ${f.body}`, f.id).not.toMatch(banned);
  });
});

describe("파생 다이제스트 — 복제 방지", () => {
  it(`새 산문 전 쌍 유사도 ${MAX_PAIR_SIMILARITY} 미만`, () => {
    let max = 0;
    for (let i = 0; i < ALL.length; i += 1) {
      for (let j = i + 1; j < ALL.length; j += 1) {
        const s = similarity(ALL[i].body, ALL[j].body);
        max = Math.max(max, s);
        expect(s, `${ALL[i].id} vs ${ALL[j].id}`).toBeLessThan(MAX_PAIR_SIMILARITY);
      }
    }
    expect(max).toBeGreaterThan(0);
  });

  it(`기존 가이드 본문·FAQ와 유사도 ${MAX_LEGACY_SIMILARITY} 미만`, () => {
    const digestBodies = new Set(ALL.map((f) => f.body));
    const legacy = [CAR_HOME_GUIDE, CAR_TAX_GUIDE, CAR_INSURANCE_GUIDE, CAR_EV_VS_GAS_GUIDE, CAR_LEASE_GUIDE, CAR_PARKING_GUIDE, CAR_MAINTENANCE_GUIDE, CAR_ABOUT_GUIDE]
      .flatMap((g) => [g.intro, ...(g.sections ?? []).map((s) => s.body), ...(g.faqs ?? []).map((q) => q.a)])
      .filter((body) => !digestBodies.has(body));
    for (const f of ALL) for (const body of legacy) expect(similarity(f.body, body), f.id).toBeLessThan(MAX_LEGACY_SIMILARITY);
  });
});

describe("파생 다이제스트 — 가이드 배선", () => {
  it("계산기 6페이지 가이드가 각자의 다이제스트를 일반 절보다 앞에 싣는다", () => {
    const pairs: [GuideData, Finding[]][] = [
      [CAR_TAX_GUIDE, CAR_TAX_DIGEST],
      [CAR_INSURANCE_GUIDE, INSURANCE_DIGEST],
      [CAR_MAINTENANCE_GUIDE, MAINTENANCE_DIGEST],
      [CAR_EV_VS_GAS_GUIDE, EV_VS_GAS_DIGEST],
      [CAR_PARKING_GUIDE, PARKING_DIGEST],
      [CAR_LEASE_GUIDE, LEASE_VS_LOAN_DIGEST],
    ];
    for (const [guide, digest] of pairs) {
      expect(guide.sections!.slice(0, digest.length)).toEqual(digest);
      expect(guide.sections![digest.length].h2).toBe("위 발견의 계산 기준");
      expect(guide.sections!.length).toBeGreaterThan(digest.length + 1);
    }
  });

  it("홈(/)·소개(/about) 가이드에는 다이제스트가 섞이지 않는다", () => {
    for (const g of [CAR_HOME_GUIDE, CAR_ABOUT_GUIDE]) {
      expect(g.sections!.some((s) => s.h2 === "위 발견의 계산 기준")).toBe(false);
    }
  });

  // /about과 화면 FreshBadge가 같은 상수를 렌더하므로, 기준 문단도 같은 상수를 써야 모순이 없다.
  it("계산 기준 문단이 페이지마다 다르고 화면 기준일과 같은 날짜를 적는다", () => {
    const expected: [GuideData, string[]][] = [
      [CAR_TAX_GUIDE, [CAR_TAX_DATA_UPDATED]],
      [CAR_INSURANCE_GUIDE, [INSURANCE_DATA_UPDATED]],
      [CAR_MAINTENANCE_GUIDE, [CAR_SERVICE_UPDATED_AT]],
      [CAR_EV_VS_GAS_GUIDE, [CAR_SERVICE_UPDATED_AT, EV_SUBSIDY_UPDATED]],
      [CAR_PARKING_GUIDE, [CAR_SERVICE_UPDATED_AT]],
      [CAR_LEASE_GUIDE, [LEASE_DATA_UPDATED]],
    ];
    const bodies = new Set<string>();
    for (const [guide, dates] of expected) {
      const basis = guide.sections!.find((s) => s.h2 === "위 발견의 계산 기준")!;
      for (const d of dates) expect(basis.body).toContain(d);
      expect(basis.body).not.toMatch(/매월|매주|정기적으로|실시간/);
      bodies.add(basis.body);
    }
    expect(bodies.size).toBe(6);
  });
});

// card #56 방식: 산문에 인용된 수치가 엔진을 독립적으로 다시 돌린 값과 일치해야 한다.
// 다이제스트는 포매터만 거치므로 여기서 어긋나면 엔진이 바뀌었는데 문장이 낡은 것이다.
const bodyOf = (items: Finding[], i: number) => items[i].body;
const joined = (items: Finding[]) => items.map((f) => `${f.h2} ${f.body}`).join("\n");

describe("파생 다이제스트 — 인용 수치 엔진 재계산 일치", () => {
  it("/tax: 총액 구성·배기량 계단·지역 격차·감면 경계·차령 곡선", () => {
    const T = DEFAULT_CAR_TAX_INPUT;
    const t = (p: Partial<typeof T>) => calcCarTax({ ...T, ...p });
    const base = t({});
    for (const v of [base.totalCost, base.acquisitionTax, base.bondCost, base.miscCost]) {
      expect(bodyOf(CAR_TAX_DIGEST, 0)).toContain(won(v));
    }
    // 배기량 계단: 1,600cc 이하는 공채 0, 그 위로 두 칸
    const small = t({ displacementRange: "1000to1600" });
    const big = t({ displacementRange: "over2000" });
    expect(small.bondCost).toBe(0);
    expect(bodyOf(CAR_TAX_DIGEST, 1)).toContain(won(small.totalCost));
    expect(bodyOf(CAR_TAX_DIGEST, 1)).toContain(won(big.totalCost - base.totalCost));
    expect(CAR_TAX_DIGEST[1].h2).toContain(won(base.totalCost - small.totalCost));
    // 지역 격차는 공채에서만 나온다 — 취득세는 세 지역이 같다
    const regions = (["seoul", "gyeonggi", "other"] as const).map((region) => t({ region, displacementRange: "over2000" }));
    expect(new Set(regions.map((r) => r.acquisitionTax)).size).toBe(1);
    for (const r of regions) expect(bodyOf(CAR_TAX_DIGEST, 2)).toContain(won(r.bondCost));
    expect(CAR_TAX_DIGEST[2].h2).toContain(won(regions[0].totalCost - regions[2].totalCost));
    // 경차 감면 소진 경계: 산문이 적은 가격까지는 0원, 한 칸 위는 0원 초과
    const m = CAR_TAX_DIGEST[3].h2.match(/차값 ([\d,]+)만원까지/)!;
    const lastFree = Number(m[1].replace(/,/g, "")) * 10_000;
    expect(t({ vehicleType: "light", vehiclePrice: lastFree }).acquisitionTax).toBe(0);
    expect(t({ vehicleType: "light", vehiclePrice: lastFree + 10_000 }).acquisitionTax).toBeGreaterThan(0);
    // 차령 곡선: 앞쪽 계단이 뒤쪽보다 크다
    const drop12 = t({ condition: "used", modelYearAge: 1 }).totalCost - t({ condition: "used", modelYearAge: 2 }).totalCost;
    const drop45 = t({ condition: "used", modelYearAge: 4 }).totalCost - t({ condition: "used", modelYearAge: 5 }).totalCost;
    expect(drop12).toBeGreaterThan(drop45);
    expect(CAR_TAX_DIGEST[4].h2).toContain(won(drop12));
    expect(CAR_TAX_DIGEST[4].h2).toContain(won(drop45));
    // 장애인 감면 절벽 = 취득세 전액
    const exemptBig = t({ isDisabledOwner: true, displacementRange: "over2000" });
    const exemptMid = t({ isDisabledOwner: true });
    expect(exemptBig.totalCost - exemptMid.totalCost).toBe(exemptBig.acquisitionTax);
    expect(bodyOf(CAR_TAX_DIGEST, 6)).toContain(won(exemptBig.totalCost - exemptMid.totalCost));
    expect(bodyOf(CAR_TAX_DIGEST, 8)).toContain(won(base.bondPurchaseAmount));
  });

  it("/insurance: 곱셈 구조·경력 절벽·사고 할증·블랙박스 경계·자기부담금", () => {
    const I = DEFAULT_INSURANCE_INPUT;
    const i = (p: Partial<typeof I>) => calcInsurance({ ...I, ...p });
    const base = i({});
    expect(bodyOf(INSURANCE_DIGEST, 0)).toContain(won(base.estimatedPremium));
    expect(bodyOf(INSURANCE_DIGEST, 0)).toContain(won(base.finalPremium));
    // 순차 곱은 단순 합산보다 덜 깎는다
    const nominal = base.items.reduce((s, x) => s + x.rate, 0);
    expect(base.estimatedPremium).toBeGreaterThan(I.currentPremium * (1 - nominal));
    expect(INSURANCE_DIGEST[0].h2).toContain(pct(1 - base.estimatedPremium / I.currentPremium));
    // 경력 4→5년이 가장 큰 계단
    const steps = [1, 2, 3, 4, 5, 6, 7, 10, 15, 20].map((y) => i({ experienceYears: y }).finalPremium);
    const cliff = i({ experienceYears: 4 }).finalPremium - i({ experienceYears: 5 }).finalPremium;
    expect(INSURANCE_DIGEST[1].h2).toContain(won(cliff));
    for (const idx of [0, 4, 9]) expect(bodyOf(INSURANCE_DIGEST, 1)).toContain(won(steps[idx]));
    // 사고 1건이 경력 20년 무사고보다 비싸다
    const acc1 = i({ accidentCount: 1 }).finalPremium;
    const clean20 = i({ experienceYears: 20 }).finalPremium;
    expect(acc1).toBeGreaterThan(clean20);
    expect(INSURANCE_DIGEST[2].h2).toContain(won(acc1 - clean20));
    expect(bodyOf(INSURANCE_DIGEST, 2)).toContain(won(i({ accidentCount: 3 }).finalPremium));
    // 블랙박스 경계: 12년까지는 할인, 13년은 미장착과 같다
    const at12 = i({ vehicleAgeYears: 12 }).finalPremium;
    const at13 = i({ vehicleAgeYears: 13 }).finalPremium;
    expect(at13).toBe(i({ hasBlackbox: false }).finalPremium);
    expect(bodyOf(INSURANCE_DIGEST, 3)).toContain(won(at13 - at12));
    // 자기부담금 마지막 칸의 절감이 그 앞 칸보다 작다
    const d100 = i({ deductibleLevel: "1000000" }).finalPremium;
    const d200 = i({ deductibleLevel: "2000000" }).finalPremium;
    expect(d100 - d200).toBeLessThan(i({ deductibleLevel: "500000" }).finalPremium - d100);
    expect(INSURANCE_DIGEST[5].h2).toContain(won(d100 - d200));
  });

  it("/maintenance: 항목 구성·오일 계단·검사 절벽·한계비용·변동비 경계", () => {
    const run = (p: Partial<typeof MAINTENANCE_BASE> = {}) => {
      const r = calculateMaintenanceBudget({ ...MAINTENANCE_BASE, ...p });
      if (!r.success) throw new Error(r.errorCode);
      return r.data;
    };
    const base = run();
    for (const v of [base.total, base.insurance, base.tax, base.consumables, base.oil]) {
      expect(bodyOf(MAINTENANCE_DIGEST, 0)).toContain(won(v));
    }
    expect(base.insurance).toBeGreaterThan(Math.max(base.tax, base.consumables, base.tires, base.oil));
    // 오일 계단: 주기 +1km에서 오일값이 두 배
    const interval = base.profile.oilIntervalKm;
    const before = run({ annualKm: interval });
    const after = run({ annualKm: interval + 1 });
    expect(after.oil).toBe(before.oil * 2);
    expect(MAINTENANCE_DIGEST[1].h2).toContain(won(after.total - before.total));
    // 차령 4년 절벽 = 검사비 + 보험 1년치
    const y3 = run({ vehicleAge: 3 });
    const y4 = run({ vehicleAge: 4 });
    expect(y3.inspection).toBe(0);
    expect(y4.total - y3.total).toBe(y4.inspection + (y4.insurance - y3.insurance));
    expect(MAINTENANCE_DIGEST[3].h2).toContain(won(y4.total - y3.total));
    // 보험료 기울기가 일정하다
    const slope = (run({ vehicleAge: 20 }).insurance - run({ vehicleAge: 0 }).insurance) / 20;
    expect(run({ vehicleAge: 10 }).insurance - run({ vehicleAge: 9 }).insurance).toBe(slope);
    expect(MAINTENANCE_DIGEST[4].h2).toContain(won(slope));
    // 1km 한계비용
    const perKm = (run({ annualKm: 16_000 }).total - run({ annualKm: 15_000 }).total) / 1_000;
    expect(MAINTENANCE_DIGEST[5].h2).toContain(wonAt(perKm));
    // 변동비가 고정비를 넘는 경계: 산문이 적은 km에서는 넘고, 100km 아래에서는 못 넘는다
    const m = MAINTENANCE_DIGEST[6].h2.match(/연 ([\d,]+)km/)!;
    const cross = Number(m[1].replace(/,/g, ""));
    const varOf = (r: ReturnType<typeof run>) => r.oil + r.tires + r.consumables;
    const fixOf = (r: ReturnType<typeof run>) => r.inspection + r.insurance + r.tax;
    expect(varOf(run({ annualKm: cross }))).toBeGreaterThan(fixOf(run({ annualKm: cross })));
    expect(varOf(run({ annualKm: cross - 100 }))).toBeLessThanOrEqual(fixOf(run({ annualKm: cross - 100 })));
  });

  it("/ev-vs-gas: 연료비 격차·고정비 우위·전비 경계·보조금 두 절벽", () => {
    const run = (p: Partial<typeof EV_VS_GAS_BASE> = {}) => {
      const r = compareEvVsGas({ ...EV_VS_GAS_BASE, ...p });
      if (!r.success) throw new Error(r.errorCode);
      return r.data;
    };
    const base = run();
    expect(EV_VS_GAS_DIGEST[0].h2).toContain(wonAt(base.gasFuel / EV_VS_GAS_BASE.annualKm));
    expect(bodyOf(EV_VS_GAS_DIGEST, 0)).toContain(won(base.gasFuel));
    // 고정비만으로 이미 전기차가 앞선다
    const gasFixed = base.gasTotal - base.gasFuel;
    const evFixed = base.evTotal - base.evFuel;
    expect(gasFixed).toBeGreaterThan(evFixed);
    expect(EV_VS_GAS_DIGEST[1].h2).toContain(won(gasFixed - evFixed));
    expect(run({ annualKm: 1_000 }).winner).toBe("ev");
    // 충전 단가만으로는 상한에서도 안 뒤집힌다
    expect(run({ electricityPrice: 600 }).winner).toBe("ev");
    // 전비 경계: 산문이 적은 값에서 가솔린이 이기고 한 칸 아래에서는 전기차가 이긴다
    const m = EV_VS_GAS_DIGEST[3].h2.match(/([\d.]+)kWh\/km/)!;
    const kwh = Number(m[1]);
    expect(run({ electricityPrice: 600, evKwhPerKm: kwh }).winner).toBe("gas");
    expect(run({ electricityPrice: 600, evKwhPerKm: Number((kwh - 0.001).toFixed(3)) }).winner).toBe("ev");
    // 유가·연비를 가솔린에 최대로 유리하게 줘도 전기차가 이긴다
    const bestGas = run({ gasPrice: 1_000, gasEfficiency: 25 });
    expect(bestGas.winner).toBe("ev");
    expect(EV_VS_GAS_DIGEST[4].h2).toContain(won(bestGas.gap));
    // 격차는 주행거리의 1차식
    const perKm = (run({ annualKm: 100_000 }).gap - run({ annualKm: 1_000 }).gap) / 99_000;
    expect(EV_VS_GAS_DIGEST[5].h2).toContain(wonAt(perKm));
    // 보조금 절벽 둘
    const sub = (p: Partial<typeof EV_SUBSIDY_BASE>) => {
      const r = calculateEvSubsidy({ ...EV_SUBSIDY_BASE, ...p });
      if (!r.success) throw new Error(r.errorCode);
      return r.data;
    };
    const under50 = sub({ vehiclePrice: 49_990_000 });
    const at50 = sub({ vehiclePrice: 50_000_000 });
    expect(at50.priceRate).toBe(under50.priceRate / 2);
    expect(EV_VS_GAS_DIGEST[6].h2).toContain(won(at50.effectivePrice - under50.effectivePrice));
    // 50% 구간 안에서는 차값이 달라도 보조금이 같고, 8,500만원에서 0이 된다
    const bandLow = sub({ vehiclePrice: 50_000_000 });
    const under85 = sub({ vehiclePrice: 84_990_000 });
    const at85 = sub({ vehiclePrice: 85_000_000 });
    expect(under85.totalSubsidy).toBe(bandLow.totalSubsidy);
    expect(at85.totalSubsidy).toBe(0);
    expect(EV_VS_GAS_DIGEST[7].h2).toContain(manwon(85_000_000 - 50_000_000));
    expect(bodyOf(EV_VS_GAS_DIGEST, 7)).toContain(won(under85.totalSubsidy));
    // 청년 가산은 구간률을 타고 전환지원금은 정액
    const low = sub({ isYouth: true, isConversion: true });
    const high = sub({ vehiclePrice: 55_000_000, isYouth: true, isConversion: true });
    expect(high.youthBonus).toBe(low.youthBonus / 2);
    expect(high.conversionBonus).toBe(low.conversionBonus);
    expect(bodyOf(EV_VS_GAS_DIGEST, 8)).toContain(won(low.youthBonus));
  });

  it("/parking: 세 요금제 순위·상한 도달 시각·요율 경계·손익분기 일수", () => {
    const run = (p: Partial<typeof PARKING_BASE> = {}) => {
      const r = compareParkingOptions({ ...PARKING_BASE, ...p });
      if (!r.success) throw new Error(r.errorCode);
      return r.data;
    };
    const total = (p: Partial<typeof PARKING_BASE>, key: string) => run(p).items.find((i) => i.key === key)!.total;
    const base = run();
    expect(base.bestOption.key).toBe("monthly");
    for (const k of ["hourly", "daycap", "monthly"]) expect(bodyOf(PARKING_DIGEST, 0)).toContain(won(total({}, k)));
    expect(PARKING_DIGEST[0].h2).toContain(won((total({}, "hourly") - total({}, "monthly")) * 12));
    // 상한 도달 시각 = 상한 ÷ 요율
    expect(PARKING_DIGEST[1].h2).toContain(`${num(PARKING_DAILY_CAP / PARKING_BASE.hourlyRate, 1)}시간`);
    // 상한 뒤에는 시간이 공짜
    expect(total({ hoursPerDay: 24 }, "daycap")).toBe(total({}, "daycap"));
    // 요율 경계: 산문이 적은 요율까지는 두 요금제가 같고 1원 위에서 갈린다
    const m = PARKING_DIGEST[3].h2.match(/시간당 ([\d,]+)원/)!;
    const boundary = Number(m[1].replace(/,/g, ""));
    expect(total({ hourlyRate: boundary }, "hourly")).toBe(total({ hourlyRate: boundary }, "daycap"));
    expect(total({ hourlyRate: boundary + 1 }, "hourly")).toBeGreaterThan(total({ hourlyRate: boundary + 1 }, "daycap"));
    // 손익분기 일수: 그 날부터 월주차가 1위, 하루 전에는 아니다
    const d = PARKING_DIGEST[4].h2.match(/한 달 (\d+)일부터/)!;
    const days = Number(d[1]);
    expect(run({ daysPerMonth: days }).bestOption.key).toBe("monthly");
    expect(run({ daysPerMonth: days - 1 }).bestOption.key).not.toBe("monthly");
    // 월주차권 상한: 그 값을 넘으면 1위가 바뀐다
    const cap = total({}, "daycap");
    expect(PARKING_DIGEST[5].h2).toContain(won(cap));
    expect(run({ monthlyPass: cap - 10_000 }).bestOption.key).toBe("monthly");
    expect(run({ monthlyPass: cap + 10_000 }).bestOption.key).not.toBe("monthly");
    // 상한이 잘라 내는 금액
    expect(PARKING_DIGEST[6].h2).toContain(won(total({}, "hourly") - total({}, "daycap")));
  });

  it("/lease-vs-loan: 총비용 구성·잔가 보정·세 경계·기간 역전", () => {
    const C = DEFAULT_LEASE_COMPARE_INPUT;
    const run = (p: Partial<typeof C> = {}) => calcLeaseCompare({ ...C, ...p });
    const of = (p: Partial<typeof C>, method: string) => run(p).methods.find((m) => m.method === method)!;
    const base = run();
    const lease = of({}, "lease");
    const loan = of({}, "loan");
    expect(base.bestMethod).toBe("lease");
    expect(LEASE_VS_LOAN_DIGEST[0].h2).toContain(won(base.spread));
    expect(bodyOf(LEASE_VS_LOAN_DIGEST, 0)).toContain(won(lease.residualValue));
    // 잔가를 더하면 남는 격차가 정확히 이자 차이다
    const leaseOwned = lease.totalCost + lease.residualValue;
    const leaseInterest = lease.totalInstallment - (C.vehiclePrice - lease.deposit - lease.residualValue);
    const loanInterest = loan.totalInstallment - (C.vehiclePrice - loan.deposit);
    expect(loan.totalCost - leaseOwned).toBe(loanInterest - leaseInterest);
    expect(LEASE_VS_LOAN_DIGEST[1].h2).toContain(won(loan.totalCost - leaseOwned));
    // 리스 금리 경계: 그 금리에서 잔가 포함 총비용이 할부 이상, 0.01%p 아래에서는 미만
    const r1 = LEASE_VS_LOAN_DIGEST[2].h2.match(/([\d.]+)%/)!;
    const flipRate = Number(r1[1]) / 100;
    const atFlip = of({ leaseRate: flipRate }, "lease");
    const justBefore = of({ leaseRate: Number((flipRate - 0.0001).toFixed(4)) }, "lease");
    expect(atFlip.totalCost + atFlip.residualValue).toBeGreaterThanOrEqual(loan.totalCost);
    expect(justBefore.totalCost + justBefore.residualValue).toBeLessThan(loan.totalCost);
    // 취득세율 경계: 그 위에서 할부가 장기렌트보다 비싸다
    const r2 = LEASE_VS_LOAN_DIGEST[3].h2.match(/([\d.]+)%/)!;
    const flipTax = Number(r2[1]) / 100;
    expect(of({ acquisitionTaxRate: flipTax }, "loan").totalCost).toBeGreaterThanOrEqual(of({ acquisitionTaxRate: flipTax }, "longTermRent").totalCost);
    expect(of({ acquisitionTaxRate: 0 }, "loan").totalCost).toBeLessThan(of({ acquisitionTaxRate: 0 }, "longTermRent").totalCost);
    // 관리료율 경계
    const r3 = LEASE_VS_LOAN_DIGEST[4].h2.match(/([\d.]+)%/)!;
    const flipMgmt = Number(r3[1]) / 100;
    expect(of({ rentManagementRate: flipMgmt }, "longTermRent").totalCost).toBeGreaterThanOrEqual(loan.totalCost);
    expect(of({}, "longTermRent").totalCost).toBeLessThan(loan.totalCost);
    // 기간 역전: 24개월은 할부가, 60개월은 장기렌트가 2위
    expect(of({ termMonths: 24 }, "loan").totalCost).toBeLessThan(of({ termMonths: 24 }, "longTermRent").totalCost);
    expect(of({ termMonths: 60 }, "longTermRent").totalCost).toBeLessThan(of({ termMonths: 60 }, "loan").totalCost);
    expect(bodyOf(LEASE_VS_LOAN_DIGEST, 5)).toContain(won(of({ termMonths: 60 }, "loan").totalCost));
    // 관리료 총액과 할부 이자
    const mgmt = (C.vehiclePrice - loan.deposit) * C.rentManagementRate;
    expect(LEASE_VS_LOAN_DIGEST[6].h2).toContain(won(mgmt));
    // 차값을 바꿔도 순위는 같지만, 정액 보험료 때문에 배수는 벌어진다
    const order = (p: Partial<typeof C>) => run(p).methods.slice().sort((a, b) => a.totalCost - b.totalCost).map((m) => m.method).join(">");
    expect(order({ vehiclePrice: 20_000_000 })).toBe(order({ vehiclePrice: 100_000_000 }));
    expect(order({})).toBe(order({ vehiclePrice: 100_000_000 }));
    const ratio = (vehiclePrice: number) => of({ vehiclePrice }, "loan").totalCost / of({ vehiclePrice }, "lease").totalCost;
    expect(ratio(20_000_000)).toBeLessThan(ratio(100_000_000));
    expect(LEASE_VS_LOAN_DIGEST[8].h2).toContain(`${(ratio(20_000_000)).toFixed(1)}배`);
    expect(LEASE_VS_LOAN_DIGEST[8].h2).toContain(`${(ratio(100_000_000)).toFixed(1)}배`);
    // 보험료는 차값과 무관한 정액이라 저가 차에서 비중이 크다
    expect(of({ vehiclePrice: 20_000_000 }, "lease").insuranceCost).toBe(of({ vehiclePrice: 100_000_000 }, "lease").insuranceCost);
  });

  it("모든 인용 수치가 엔진 실행값에서 왔다 — 손으로 적은 요율표가 없다", () => {
    // 은행·보험사·정비소 이름을 특정해 유불리를 말하지 않는다(고유 데이터가 아니므로).
    for (const brand of ["삼성화재", "KB손해보험", "현대캐피탈", "현대", "기아", "테슬라"]) {
      expect(joined(ALL as unknown as Finding[]), brand).not.toContain(brand);
    }
  });
});
