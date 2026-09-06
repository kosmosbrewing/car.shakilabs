// /insurance 파생 다이제스트 — 보험료 계산은 할인·할증을 "순차로 곱하는" 구조라,
// 요율표를 눈으로 더해서는 결과가 나오지 않는다. 구간 경계가 어디이고 한 칸이 얼마인지는
// 엔진(calcInsurance)을 축마다 전 구간 돌려야 보인다. 아래 수치는 전부 그 실행값이다.

import { DEFAULT_INSURANCE_INPUT } from "@/lib/validators";
import { calcInsurance } from "@/utils/calculator";
import { type Finding, eul, eun, ga, km, num, pct, pp, ro, times, wa, won } from "./format";

/** 화면 기본값과 같은 조건: 현재 보험료 70만원, 경력 5년, 무사고, 연 1만km, 블랙박스 장착, 차령 5년, 자기부담금 20만원 */
export const INSURANCE_BASE = DEFAULT_INSURANCE_INPUT;
const run = (patch: Partial<typeof INSURANCE_BASE>) => calcInsurance({ ...INSURANCE_BASE, ...patch });

/** 요율은 손으로 적지 않는다 — 엔진이 붙여 준 항목에서 읽어야 요율표를 고쳤을 때 문장이 같이 움직인다. */
const rateOf = (label: string, patch: Partial<typeof INSURANCE_BASE> = {}) =>
  run(patch).items.find((i) => i.label.includes(label))?.rate ?? 0;
const DIRECT_RATE = run({}).directDiscountAmount / run({}).estimatedPremium;
const EXP_RATE = rateOf("가입 경력");
const MILE_RATE = rateOf("마일리지");
const BOX_RATE = rateOf("블랙박스");

function multiplicativeNotAdditive(): Finding {
  const r = run({});
  const nominal = EXP_RATE + MILE_RATE + BOX_RATE;
  const naive = INSURANCE_BASE.currentPremium * (1 - nominal);
  const actual = 1 - r.estimatedPremium / INSURANCE_BASE.currentPremium;
  return {
    h2: `할인율을 더하면 ${eun(pct(nominal))} 나오지만 실제 할인폭은 ${pct(actual)}다`,
    body:
      `현재 보험료 ${won(INSURANCE_BASE.currentPremium)}에 경력 ${pct(EXP_RATE, 0)}·마일리지 ${pct(MILE_RATE, 0)}·블랙박스 ${pct(BOX_RATE, 0)} 할인이 걸린다고 가정하면, 요율을 눈으로 더한 ${pct(nominal)} 할인은 ${won(naive)}을 가리킵니다. ` +
      `그런데 엔진이 실제로 내놓는 값은 ${won(r.estimatedPremium)}, 즉 ${eul(won(r.estimatedPremium - naive))} 덜 깎습니다 — 각 할인이 원래 보험료가 아니라 앞 단계에서 이미 깎인 금액에 다시 곱해지기 때문입니다. ` +
      `여기에 다이렉트 전환 ${pct(DIRECT_RATE, 0)}까지 얹으면 명목 합계는 ${ga(pct(nominal + DIRECT_RATE))} 되지만 최종 보험료 ${won(r.finalPremium)}이 뜻하는 실제 총 할인율은 ${pct(r.totalDiscountRate)}에 그칩니다. ` +
      `따라서 특약을 하나 더 붙였을 때 "몇 %p 더 싸지나"는 이미 적용된 할인이 몇 개인지에 따라 달라지고, 할인이 많이 붙어 있을수록 새 특약의 절대 절감액은 작아집니다.`,
  };
}

function experienceCliff(): Finding {
  const years = [1, 2, 3, 4, 5, 6, 7, 10, 15, 20];
  const rows = years.map((y) => ({ y, p: run({ experienceYears: y }).finalPremium }));
  const at = (y: number) => rows.find((r) => r.y === y)!.p;
  const biggest = at(4) - at(5);
  const smallest = at(19 - 4) - at(20);
  return {
    h2: `가입 경력은 4년에서 5년으로 넘어갈 때 ${ga(won(biggest))} 한 번에 빠진다`,
    body:
      `경력 할인은 해마다 조금씩 늘지 않고 구간 단위로 계단을 오릅니다. 다른 조건을 기본 가정(무사고, 연 ${km(10_000)}, 블랙박스 장착, 자기부담금 ${won(200_000)})으로 고정하고 경력만 바꾸면 최종 보험료가 1년 ${won(at(1))}, 3년 ${won(at(3))}, 5년 ${won(at(5))}, 7년 ${won(at(7))}, 10년 ${won(at(10))}, 20년 ${ro(won(at(20)))} 내려갑니다. ` +
      `가장 큰 계단은 4년→5년으로 ${ga(won(biggest))} 한 번에 빠지는데, 이 구간에서 할인율이 ${pct(rateOf("가입 경력", { experienceYears: 4 }), 0)}에서 ${ro(pct(rateOf("가입 경력", { experienceYears: 5 }), 0))} ${pp((rateOf("가입 경력", { experienceYears: 5 }) - rateOf("가입 경력", { experienceYears: 4 })) * 100)} 뛰기 때문입니다. ` +
      `반면 15년→20년 구간은 같은 5년을 더 타고도 ${won(smallest)}만 줄어, 경력이 쌓일수록 1년의 값어치는 빠르게 작아집니다. ` +
      `즉 갱신 시점이 경력 만 4년 언저리라면 며칠 차이로 구간이 갈릴 수 있으므로, 계약일을 앞뒤로 옮겨 넣어 보는 편이 특약을 하나 더 고르는 것보다 큰 차이를 냅니다.`,
  };
}

function accidentOutweighsExperience(): Finding {
  const clean5 = run({}).finalPremium;
  const acc1 = run({ accidentCount: 1 }).finalPremium;
  const acc2 = run({ accidentCount: 2 }).finalPremium;
  const acc3 = run({ accidentCount: 3 }).finalPremium;
  const clean20 = run({ experienceYears: 20 }).finalPremium;
  return {
    h2: `사고 1건은 경력 15년치 할인을 지우고도 ${won(acc1 - clean20)}이 남는다`,
    body:
      `기본 가정(경력 5년, 연 ${km(10_000)}, 블랙박스 장착)에서 무사고 보험료는 ${won(clean5)}인데, 최근 3년 사고를 1건으로 바꾸면 ${ro(won(acc1))} 올라 ${ga(won(acc1 - clean5))} 붙습니다. ` +
      `비교 대상을 바꿔 보면 크기가 더 분명해집니다 — 같은 조건에서 경력을 5년에서 20년으로 늘린 무사고 보험료가 ${won(clean20)}이므로, 사고 1건이 붙은 경력 5년은 경력 20년 무사고보다 ${eul(won(acc1 - clean20))} 더 냅니다. ` +
      `사고가 2건이면 ${won(acc2)}, 3건이면 ${ro(won(acc3))} 올라 무사고 대비 ${times(acc3, clean5)}가 되고, 이 할증은 할인과 마찬가지로 곱해지므로 특약을 아무리 붙여도 같은 비율만큼 남습니다. ` +
      `그래서 소액 사고를 자비로 처리할지 판단할 때는 수리비 한 번이 아니라 이 ${won(acc1 - clean5)}이 몇 년간 따라붙는지를 함께 놓고 봐야 합니다.`,
  };
}

function blackboxAgeCliff(): Finding {
  const at12 = run({ vehicleAgeYears: 12 }).finalPremium;
  const at13 = run({ vehicleAgeYears: 13 }).finalPremium;
  const noBox = run({ hasBlackbox: false }).finalPremium;
  return {
    h2: `차령 12년에서 13년으로 넘어가면 블랙박스 할인이 통째로 사라진다`,
    body:
      `이 계산기는 차령이 일정 기준을 넘으면 블랙박스 할인을 보수적으로 빼도록 가정합니다. 그래서 다른 조건을 그대로 두고 차령만 바꾸면 12년까지는 ${won(at12)}이던 보험료가 13년에서 ${ro(won(at13))} 뛰고, ${ga(won(at13 - at12))} 그 계단의 높이입니다. ` +
      `이 값은 애초에 블랙박스를 장착하지 않았을 때의 보험료 ${wa(won(noBox))} 정확히 같은데, 할인 자체가 없어지는 것이지 다른 할증이 붙는 것이 아니기 때문입니다. ` +
      `할인율은 ${pct(BOX_RATE, 0)}이지만 절대액이 ${ga(won(at13 - at12))} 되는 이유는 이 할인이 경력·마일리지 할인이 끝난 뒤의 금액에 곱해지기 때문입니다. ` +
      `따라서 오래된 차에 블랙박스를 새로 다는 결정은 보험료 절감이 아니라 사고 입증 목적으로 판단해야 하고, 절감액을 기대하려면 계산기에 차령을 정확히 넣어 확인해야 합니다.`,
  };
}

function mileageSteps(): Finding {
  const ranges = ["20000", "15000", "10000", "7000", "5000", "3000"] as const;
  const rows = ranges.map((m) => ({ m, p: run({ mileageRange: m }).finalPremium }));
  const total = rows[0].p - rows[rows.length - 1].p;
  const d1 = rows[0].p - rows[1].p;
  const d2 = rows[1].p - rows[2].p;
  return {
    h2: `주행거리 구간을 끝까지 낮춰도 아끼는 돈은 ${won(total)}뿐이다`,
    body:
      `마일리지 특약은 구간이 여섯 칸이고, 기본 가정(경력 5년, 무사고, 블랙박스 장착, 차령 5년)에서 최종 보험료가 연 ${km(20_000)} ${won(rows[0].p)}, ${km(15_000)} ${won(rows[1].p)}, ${km(10_000)} ${won(rows[2].p)}, ${km(5_000)} ${won(rows[4].p)}, ${km(3_000)} ${ro(won(rows[5].p))} 내려갑니다. ` +
      `가장 높은 구간에서 가장 낮은 구간까지 다섯 칸을 전부 내려도 차이는 ${won(total)}, 원 보험료 ${won(INSURANCE_BASE.currentPremium)} 대비 ${pct(total / INSURANCE_BASE.currentPremium)}에 그칩니다. ` +
      `게다가 칸마다 값어치가 달라서 ${km(20_000)}→${km(15_000)}는 ${won(d1)}인데 ${km(15_000)}→${km(10_000)}는 ${ro(won(d2))}, 요율이 ${ranges.slice(1).map((m, i) => pp((rateOf("마일리지", { mileageRange: m }) - rateOf("마일리지", { mileageRange: ranges[i] })) * 100)).join("·")}씩 번갈아 오르내리기 때문에 절감액도 지그재그를 그립니다. ` +
      `즉 주행거리를 줄여 보험료를 아끼려는 계획은 실익이 크지 않고, 오히려 실제보다 낮은 구간을 골랐다가 정산에서 되돌려 받는 위험이 더 큽니다.`,
  };
}

function deductibleDiminishing(): Finding {
  const levels = ["200000", "300000", "500000", "1000000", "2000000"] as const;
  const rows = levels.map((d) => ({ d: Number(d), p: run({ deductibleLevel: d }).finalPremium }));
  const lastGain = rows[3].p - rows[4].p;
  const lastRisk = rows[4].d - rows[3].d;
  return {
    h2: `자기부담금을 ${manwonLabel(rows[3].d)}에서 ${ro(manwonLabel(rows[4].d))} 올려도 ${won(lastGain)}밖에 안 아낀다`,
    body:
      `자기부담금을 올리면 보험료가 내려가지만, 내려가는 폭이 위험을 키우는 폭을 따라가지 못합니다. 기본 가정(경력 5년, 무사고, 연 ${km(10_000)})에서 최종 보험료가 ${manwonLabel(rows[0].d)} ${won(rows[0].p)}, ${manwonLabel(rows[1].d)} ${won(rows[1].p)}, ${manwonLabel(rows[2].d)} ${won(rows[2].p)}, ${manwonLabel(rows[3].d)} ${won(rows[3].p)}, ${manwonLabel(rows[4].d)} ${ro(won(rows[4].p))} 계산됩니다. ` +
      `가장 큰 절감은 ${manwonLabel(rows[2].d)}→${manwonLabel(rows[3].d)} 구간의 ${won(rows[2].p - rows[3].p)}이고, 그다음 칸은 자기부담금을 ${eul(won(lastRisk))} 더 지면서도 보험료는 ${won(lastGain)}만 줄어듭니다. ` +
      `따라서 마지막 칸은 사고가 ${num(lastRisk / lastGain)}년에 한 번보다 드물어야 본전인 셈이고, 그 확률은 계산기가 알 수 없습니다. ` +
      `자기부담금 선택은 절감액이 아니라 사고 시 현금을 얼마까지 감당할 수 있는지로 정하는 편이 안전합니다.`,
  };
}

function directDiscountDepends(): Finding {
  const base = run({});
  const best = run({ experienceYears: 20, accidentCount: 0, mileageRange: "3000", deductibleLevel: "2000000" });
  const worst = run({ experienceYears: 1, accidentCount: 3, mileageRange: "20000", deductibleLevel: "200000", hasBlackbox: false });
  return {
    h2: `같은 다이렉트 ${ga(pct(DIRECT_RATE, 0))} 조건에 따라 ${won(best.directDiscountAmount)}에서 ${won(worst.directDiscountAmount)}까지 달라진다`,
    body:
      `다이렉트 전환 절감은 다른 할인·할증이 모두 끝난 금액에 마지막으로 곱해진다고 가정하므로, 비율은 고정이어도 절대액은 앞 단계 결과에 통째로 종속됩니다. ` +
      `기본 조건에서는 전환 전 ${won(base.estimatedPremium)}에 ${ga(pct(DIRECT_RATE, 0))} 붙어 ${ga(won(base.directDiscountAmount))} 절약되지만, 할인을 최대로 몰아넣은 조건(경력 20년·무사고·연 ${km(3_000)}·자기부담금 ${manwonLabel(2_000_000)})에서는 ${ro(won(best.directDiscountAmount))} 줄어듭니다. ` +
      `반대로 할증이 최대인 조건(경력 1년·사고 3건·연 ${km(20_000)}·블랙박스 없음)에서는 ${ga(won(worst.directDiscountAmount))} 되어 가장 유리한 조건의 ${times(worst.directDiscountAmount, best.directDiscountAmount)}에 이릅니다. ` +
      `그래서 "다이렉트로 바꾸면 얼마 아끼나"라는 질문에는 단일한 답이 없고, 보험료가 비싼 사람일수록 전환의 절대 이득이 크다는 결론만 남습니다.`,
  };
}

function bestWorstSpread(): Finding {
  const best = run({ experienceYears: 20, accidentCount: 0, mileageRange: "3000", deductibleLevel: "2000000" }).finalPremium;
  const worst = run({ experienceYears: 1, accidentCount: 3, mileageRange: "20000", deductibleLevel: "200000", hasBlackbox: false }).finalPremium;
  const base = run({}).finalPremium;
  return {
    h2: `같은 원 보험료 ${won(INSURANCE_BASE.currentPremium)}이 조건에 따라 ${times(worst, best)} 벌어진다`,
    body:
      `계산기의 다섯 축을 한쪽 끝으로 몰면 최종 보험료가 ${won(best)}까지 내려가고, 반대쪽 끝으로 몰면 ${won(worst)}까지 올라갑니다. 두 값의 차이는 ${won(worst - best)}, 배수로는 ${times(worst, best)}입니다. ` +
      `출발점이 같은 ${won(INSURANCE_BASE.currentPremium)}(가정)이라는 점이 중요한데, 보험료 견적을 서로 비교할 때 흔히 놓치는 부분이 바로 이 조건 차이입니다. ` +
      `기본 조건의 ${won(base)}은 이 구간의 아래쪽 ${eul(pct((base - best) / (worst - best)))} 지난 지점에 있어, 대부분의 사람이 최선과 최악의 중간 어딘가에 놓입니다. ` +
      `따라서 남의 보험료와 비교해 비싸다고 느낀다면 보험사를 옮기기 전에 경력·사고·주행거리 중 어느 축이 다른지부터 맞춰 봐야 합니다.`,
  };
}

function orderIndependence(): Finding {
  const r = run({});
  const items = r.items;
    const boxFirst = INSURANCE_BASE.currentPremium * BOX_RATE;
  return {
    h2: `항목별 절감액은 적용 순서에 따라 달라지지만 최종 보험료는 같다`,
    body:
      `기본 가정 조건에서 계산기가 보여 주는 항목별 절감액은 경력 ${won(Math.abs(items[0].amount))}, 마일리지 ${won(Math.abs(items[1].amount))}, 블랙박스 ${won(Math.abs(items[2].amount))}입니다. ` +
      `블랙박스 할인율은 ${pct(BOX_RATE, 0)}인데 표시 금액이 ${ga(won(Math.abs(items[2].amount)))} 된 것은, 앞의 두 할인이 끝난 뒤 남은 금액에 곱해졌기 때문입니다 — 만약 블랙박스를 맨 앞에 적용했다면 같은 ${ga(pct(BOX_RATE, 0))} ${ro(won(boxFirst))} 표시됐을 것입니다. ` +
      `그래도 세 항목을 모두 더한 절감 총액 ${wa(won(Math.abs(r.savingsAmount)))} 최종 보험료 ${eun(won(r.estimatedPremium))} 순서를 어떻게 바꿔도 변하지 않는데, 곱셈은 순서를 바꿔도 결과가 같기 때문입니다. ` +
      `즉 견적서에서 "이 특약으로 얼마 아꼈다"는 항목별 숫자는 순서가 만든 배분일 뿐이므로, 특약 하나의 값어치를 알고 싶다면 그 특약만 껐다 켜서 최종 금액의 차이를 봐야 합니다.`,
  };
}

/** 자기부담금 라벨 — 20만원·200만원처럼 만원 단위로 읽는다 */
function manwonLabel(value: number): string {
  return `${num(value / 10_000)}만원`;
}

export const INSURANCE_DIGEST: Finding[] = [
  multiplicativeNotAdditive(),
  experienceCliff(),
  accidentOutweighsExperience(),
  blackboxAgeCliff(),
  mileageSteps(),
  deductibleDiminishing(),
  directDiscountDepends(),
  bestWorstSpread(),
  orderIndependence(),
];
