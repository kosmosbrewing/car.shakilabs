// /maintenance 파생 다이제스트 — 연간 유지비는 "주행거리에 비례하는 변동비 + 차령이 정하는 고정비"인데,
// 엔진오일만 주행거리를 나눠 올림하므로 총액이 매끈한 직선이 아니라 계단을 낀 꺾은선이다.
// 계단이 어디에 있고 두 힘이 어디서 뒤집히는지는 엔진(calculateMaintenanceBudget)을 전 구간 돌려야 보인다.

import { calculateMaintenanceBudget } from "@/utils/ownershipCalculator";
import { type Finding, eul, eun, ga, ida, km, pct, ro, times, wa, won, wonAt } from "./format";

/** 화면(MaintenanceView) 기본값과 같은 조건: 연 15,000km, 차령 5년, 가솔린 */
export type FuelType = "gasoline" | "hybrid" | "ev";
export const MAINTENANCE_BASE: { annualKm: number; vehicleAge: number; fuelType: FuelType } =
  { annualKm: 15_000, vehicleAge: 5, fuelType: "gasoline" };
type Patch = Partial<typeof MAINTENANCE_BASE>;

/** 다이제스트는 유효 입력만 쓰므로 실패 분기는 오지 않는다 — 그래도 조용히 넘기지 않고 던진다. */
function run(patch: Patch = {}) {
  const r = calculateMaintenanceBudget({ ...MAINTENANCE_BASE, ...patch });
  if (!r.success) throw new Error(`maintenance digest input rejected: ${r.errorCode}`);
  return r.data;
}
const fixedOf = (r: ReturnType<typeof run>) => r.inspection + r.insurance + r.tax;
const variableOf = (r: ReturnType<typeof run>) => r.oil + r.tires + r.consumables;

function costShape(): Finding {
  const r = run();
  const fixed = fixedOf(r);
  return {
    h2: `연 유지비에서 가장 큰 항목은 정비가 아니라 보험 ${ida(won(r.insurance))}`,
    body:
      `연 ${km(MAINTENANCE_BASE.annualKm)}, 차령 ${MAINTENANCE_BASE.vehicleAge}년, ${run().profile.label} 차량을 가정하면 연 유지비가 ${won(r.total)}, 월 평균 ${ro(won(r.monthlyAverage))} 계산됩니다. ` +
      `항목별로는 보험 ${won(r.insurance)}, 자동차세 ${won(r.tax)}, 소모품 ${won(r.consumables)}, 타이어 적립 ${won(r.tires)}, 엔진오일 ${won(r.oil)}, 정기검사 ${ro(won(r.inspection))} 나뉘는데, 흔히 유지비의 주인공으로 꼽히는 정비 항목이 아니라 보험이 1위입니다. ` +
      `그런데 더 중요한 것은 이 항목들이 주행과 무관하다는 점인데, 보험·세금·검사만 묶으면 ${won(fixed)}으로 총액의 ${eul(pct(fixed / r.total))} 차지하기 때문입니다 — 즉 차를 한 달 세워 둬도 이 돈은 그대로 나갑니다. ` +
      `따라서 유지비를 줄이려는 노력은 정비 항목이 아니라 보험 조건과 차령에 걸린 부분에서 시작해야 하고, 정비소에서 아낄 수 있는 몫은 남은 ${eul(pct(variableOf(r) / r.total))} 넘지 못합니다.`,
  };
}

function oilStep(): Finding {
  const interval = run().profile.oilIntervalKm;
  const before = run({ annualKm: interval });
  const after = run({ annualKm: interval + 1 });
  return {
    h2: `${km(interval)}에서 1km만 더 타면 유지비가 ${won(after.total - before.total)} 뛴다`,
    body:
      `엔진오일은 주행거리를 교환 주기로 나눈 뒤 올림해서 횟수를 세므로, 총액이 매끈하게 늘지 않고 주기마다 계단을 만듭니다. ` +
      `${run().profile.label} 기준 교환 주기 ${km(interval)}, 차령 ${MAINTENANCE_BASE.vehicleAge}년(가정)에서 연 ${km(interval)}를 타면 오일값이 ${won(before.oil)}이고 총액은 ${won(before.total)}인데, ${km(interval + 1)}가 되는 순간 오일값이 ${ro(won(after.oil))} 두 배가 되면서 총액이 ${won(after.total)}이 됩니다. ` +
      `1km를 더 탄 대가가 ${won(after.total - before.total)}인 셈이고, 이 계단은 ${km(interval * 2)}·${km(interval * 3)}에서도 같은 높이로 반복됩니다. ` +
      `그래서 연말 주행거리가 교환 주기 바로 앞에 걸려 있다면, 다음 해로 넘겨 타는 편이 이 한 칸을 통째로 미루는 결정이 됩니다.`,
  };
}

function fuelChangesStepPosition(): Finding {
  const rows = (["gasoline", "hybrid", "ev"] as const).map((f) => ({ f, p: run({ fuelType: f }).profile, r: run({ fuelType: f }) }));
  const [gas, hyb, ev] = rows;
  return {
    h2: `계단이 서는 자리는 연료마다 달라 ${km(12_000)}에서 하이브리드만 손해다`,
    body:
      `교환 주기가 ${gas.p.label} ${km(gas.p.oilIntervalKm)}, ${hyb.p.label} ${km(hyb.p.oilIntervalKm)}, ${ev.p.label} ${km(ev.p.oilIntervalKm)}로 달라서, 같은 주행거리라도 어느 차는 계단 앞에 있고 어느 차는 막 계단을 밟은 뒤입니다. ` +
      `차령 ${MAINTENANCE_BASE.vehicleAge}년(가정)에서 연 ${km(12_000)}를 타면 ${gas.p.label}은 이미 두 번째 칸이라 오일값이 ${won(run({ annualKm: 12_000 }).oil)}인데, ${hyb.p.label}는 아직 첫 칸이라 ${won(run({ annualKm: 12_000, fuelType: "hybrid" }).oil)}에 머뭅니다. ` +
      `그런데 ${km(12_001)}가 되면 ${hyb.p.label}만 ${ro(won(run({ annualKm: 12_001, fuelType: "hybrid" }).oil))} 뛰어 총액이 ${won(run({ annualKm: 12_000, fuelType: "hybrid" }).total)}에서 ${ro(won(run({ annualKm: 12_001, fuelType: "hybrid" }).total))} 오르는 반면, ${gas.p.label}은 그 지점에서 아무 일도 일어나지 않습니다. ` +
      `한편 ${ev.p.label}는 주기가 ${km(ev.p.oilIntervalKm)}이고 회당 비용도 ${won(ev.p.oilCost)}이라, 계단이 드물 뿐 아니라 높이도 ${gas.p.label}의 ${eul(times(ev.p.oilCost, gas.p.oilCost))} 넘지 않습니다.`,
  };
}

function inspectionCliff(): Finding {
  const y3 = run({ vehicleAge: 3 });
  const y4 = run({ vehicleAge: 4 });
  return {
    h2: `차령 4년째 유지비가 ${won(y4.total - y3.total)} 뛰는데 그중 ${won(y4.inspection)}은 정기검사다`,
    body:
      `연 ${km(MAINTENANCE_BASE.annualKm)} ${run().profile.label}(가정)에서 차령만 3년에서 4년으로 바꾸면 총액이 ${won(y3.total)}에서 ${ro(won(y4.total))} 올라 ${ga(won(y4.total - y3.total))} 늘어납니다. ` +
      `이 계단은 두 힘이 겹친 결과인데, 정기검사비 ${ga(won(y4.inspection))} 0원에서 새로 생기고 보험료가 ${won(y3.insurance)}에서 ${ro(won(y4.insurance))} 오르기 때문입니다. ` +
      `검사비는 한 번 생기고 나면 차령이 더 올라가도 ${ro(won(y4.inspection))} 고정이라, 이후의 증가분은 전부 보험료 몫입니다. ` +
      `즉 차령 4년은 유지비 곡선에서 유일한 계단이고, 중고차를 고를 때 3년차와 4년차의 가격 차이를 볼 때는 이 ${eul(won(y4.total - y3.total))} 매년 더 낸다는 점을 얹어야 합니다.`,
  };
}

function insuranceLinearInAge(): Finding {
  const y0 = run({ vehicleAge: 0 });
  const y5 = run();
  const y20 = run({ vehicleAge: 20 });
  const perYear = (y20.insurance - y0.insurance) / 20;
  return {
    h2: `보험료는 차령 1년마다 ${won(perYear)}씩 곧게 올라 20년이면 ${times(y20.insurance, y0.insurance)}가 된다`,
    body:
      `이 계산기는 유지비 안의 보험료를 차령에 정비례한다고 가정합니다. 그래서 연 ${km(MAINTENANCE_BASE.annualKm)} ${run().profile.label} 기준으로 보험료가 신차 ${won(y0.insurance)}, 차령 ${MAINTENANCE_BASE.vehicleAge}년 ${won(y5.insurance)}, 차령 20년 ${ro(won(y20.insurance))} 오릅니다. ` +
      `기울기가 1년당 ${won(perYear)}으로 일정하다는 점이 중요한데, 감가상각이 앞쪽에 몰리는 것과 정반대이기 때문입니다. ` +
      `총 유지비로 보면 신차 ${won(y0.total)}에서 20년차 ${won(y20.total)}까지 ${ga(won(y20.total - y0.total))} 늘고, 이 증가분의 ${eun(pct((y20.insurance - y0.insurance) / (y20.total - y0.total)))} 보험료, 나머지는 차령 4년에 생긴 검사비입니다. ` +
      `다만 실제 보험료는 차령보다 사고 이력·경력에 훨씬 크게 반응하므로, 이 직선은 "차령만 놓고 보면 이렇다"는 가정선으로 읽어야 합니다.`,
  };
}

function marginalCostPerKm(): Finding {
  const per = (f: FuelType) =>
    (run({ annualKm: 16_000, fuelType: f }).total - run({ annualKm: 15_000, fuelType: f }).total) / 1_000;
  const g = per("gasoline");
  const h = per("hybrid");
  const e = per("ev");
  return {
    h2: `계단을 밟지 않는 구간에서 1km의 값은 가솔린 ${wonAt(g)}, 전기차 ${ida(wonAt(e))}`,
    body:
      `오일 계단을 건너뛰지 않는 구간에서는 유지비가 주행거리에 정확히 비례합니다. 차령 ${MAINTENANCE_BASE.vehicleAge}년(가정)에서 연 ${km(15_000)}와 ${km(16_000)}의 총액 차이를 1,000으로 나누면 1km당 ${run().profile.label} ${wonAt(g)}, ${run({ fuelType: "hybrid" }).profile.label} ${wonAt(h)}, ${run({ fuelType: "ev" }).profile.label} ${ga(wonAt(e))} 나옵니다. ` +
      `이 값에는 연료비가 들어 있지 않고 타이어 적립과 소모품 마모만 들어 있는데, 그런데도 ${run({ fuelType: "ev" }).profile.label}가 ${eul(pct(1 - e / g))} 낮은 것은 마모 계수 자체가 다르다고 가정하기 때문입니다. ` +
      `연 ${eul(km(10_000))} 더 타면 ${run().profile.label} 기준 ${eul(won(g * 10_000))} 더 쓰는 셈이고, 여기에 오일 계단 ${ga(won(run().profile.oilCost))} 한 번 더 얹힙니다. ` +
      `따라서 출퇴근 경로를 바꿔 연 주행을 줄이는 계획의 값어치는 이 ${wa(wonAt(g))} 계단 위치를 함께 계산해야 정확히 나옵니다.`,
  };
}

function fixedBeatsVariable(): Finding {
  const cross = (f: FuelType) => {
    let k = 1_000;
    while (k < 100_000 && variableOf(run({ annualKm: k, fuelType: f })) <= fixedOf(run({ annualKm: k, fuelType: f }))) k += 100;
    return k;
  };
  const g = cross("gasoline");
  const h = cross("hybrid");
  const e = cross("ev");
  const at = run({ annualKm: g });
  return {
    h2: `연 ${km(g)}를 넘겨야 정비비가 보험·세금을 앞지른다`,
    body:
      `차를 유지하는 돈은 "타서 나가는 돈"과 "세워 둬도 나가는 돈"으로 갈리는데, 차령 ${MAINTENANCE_BASE.vehicleAge}년(가정)에서 주행거리를 100km씩 올려 가며 두 합계를 다시 계산하면 ${run().profile.label}은 연 ${km(g)}에서야 변동비 ${ga(won(variableOf(at)))} 고정비 ${eul(won(fixedOf(at)))} 넘어섭니다. ` +
      `같은 경계가 ${run({ fuelType: "hybrid" }).profile.label}는 ${km(h)}, ${run({ fuelType: "ev" }).profile.label}는 ${km(e)}인데, ${run({ fuelType: "ev" }).profile.label}는 자동차세가 ${won(run({ fuelType: "ev" }).tax)}으로 낮아 고정비가 작은데도 마모 계수가 함께 낮아 경계가 오히려 뒤로 밀립니다. ` +
      `기본 가정인 연 ${km(MAINTENANCE_BASE.annualKm)}는 이 경계의 절반도 되지 않으므로, 대부분의 운전자에게 유지비는 주행량이 아니라 보유 자체가 정하는 값입니다. ` +
      `그래서 주말에만 타는 차의 유지비를 "덜 타니까 싸다"고 어림하면 실제보다 훨씬 낮게 잡게 됩니다.`,
  };
}

function lowMileageTrap(): Finding {
  const low = run({ annualKm: 1_000 });
  const high = run({ annualKm: 100_000 });
  const base = run();
  return {
    h2: `주행거리를 100배 늘려도 유지비는 ${times(high.total, low.total)}밖에 늘지 않는다`,
    body:
      `차령 ${MAINTENANCE_BASE.vehicleAge}년 ${run().profile.label}(가정)에서 연 ${km(1_000)}만 타면 유지비가 ${won(low.total)}, 월 ${won(low.monthlyAverage)}입니다. 주행거리를 100배인 ${ro(km(100_000))} 올리면 ${won(high.total)}, ${ga(won(high.monthlyAverage))} 됩니다. ` +
      `주행은 100배인데 비용은 ${times(high.total, low.total)}에 그치는 이유는, 연 ${km(1_000)} 구간에서는 총액의 ${ga(pct(fixedOf(low) / low.total))} 이미 보험·세금·검사이기 때문입니다. ` +
      `그 비중이 ${km(100_000)}에서는 ${ro(pct(fixedOf(high) / high.total))} 내려가고, 기본 가정인 ${km(MAINTENANCE_BASE.annualKm)}에서는 ${eul(pct(fixedOf(base) / base.total))} 차지합니다. ` +
      `즉 km당 유지비를 계산해 차를 비교하면 저주행 차량이 실제보다 훨씬 비싸 보이므로, 비교는 연 총액과 예상 주행거리를 함께 놓고 해야 합니다.`,
  };
}

function evNeedsDoubleDistance(): Finding {
  const gasBase = run();
  let k = 1_000;
  while (k < 100_000 && run({ annualKm: k, fuelType: "ev" }).total < gasBase.total) k += 100;
  const evAt = run({ annualKm: k, fuelType: "ev" });
  const evSame = run({ fuelType: "ev" });
  const taxGap = gasBase.tax - evSame.tax;
  return {
    h2: `전기차는 연 ${km(k)}를 달려야 가솔린의 ${km(MAINTENANCE_BASE.annualKm)} 유지비에 닿는다`,
    body:
      `같은 연 ${km(MAINTENANCE_BASE.annualKm)}, 차령 ${MAINTENANCE_BASE.vehicleAge}년(가정)에서 유지비는 ${run().profile.label} ${won(gasBase.total)}, ${run({ fuelType: "hybrid" }).profile.label} ${won(run({ fuelType: "hybrid" }).total)}, ${run({ fuelType: "ev" }).profile.label} ${ro(won(evSame.total))} 계산됩니다. ` +
      `${run({ fuelType: "ev" }).profile.label}의 주행거리를 100km씩 올려 가며 다시 돌리면 연 ${km(k)}에 이르러서야 ${ro(won(evAt.total))} ${run().profile.label}의 기본 조건 총액을 넘어서므로, 같은 유지비를 쓰려면 ${eul(times(k, MAINTENANCE_BASE.annualKm))} 달려야 합니다. ` +
      `격차 ${won(gasBase.total - evSame.total)} 가운데 ${eun(won(taxGap))} 자동차세 차이(${won(gasBase.tax)} 대 ${won(evSame.tax)})에서 나오고, 나머지는 오일과 소모품에서 나옵니다. ` +
      `다만 이 비교에는 연료비도 충전비도 들어 있지 않고 배터리 교체 같은 항목도 없으므로, 실제 보유 비용 비교는 전기차 대 가솔린 계산기에서 따로 해야 합니다.`,
  };
}

export const MAINTENANCE_DIGEST: Finding[] = [
  costShape(),
  oilStep(),
  fuelChangesStepPosition(),
  inspectionCliff(),
  insuranceLinearInAge(),
  marginalCostPerKm(),
  fixedBeatsVariable(),
  lowMileageTrap(),
  evNeedsDoubleDistance(),
];
