// /ev-vs-gas 파생 다이제스트 — 이 페이지는 엔진 두 개를 쓴다. 운행비 비교(compareEvVsGas)는
// 연료비와 고정비를 더한 값이고, 보조금(calculateEvSubsidy)은 차량 가격 구간에 지급률을 곱한다.
// 그래서 "얼마부터 유리한가"와 "얼마를 넘으면 절벽인가"가 서로 다른 축에 있다.
// 아래 경계는 전부 두 엔진을 구간마다 다시 돌려 찾은 실행값이다.

import { MODEL_PRESETS, REGIONAL_SUBSIDIES } from "@/data/ownershipData";
import { calculateEvSubsidy, compareEvVsGas } from "@/utils/ownershipCalculator";
import { type Finding, eul, eun, ga, ida, km, manwon, num, pct, ro, times, wa, won, wonAt } from "./format";

/** 화면(EvVsGasView) 기본값과 같은 조건 */
export const EV_VS_GAS_BASE: { annualKm: number; gasPrice: number; electricityPrice: number; gasEfficiency: number; evKwhPerKm: number } =
  { annualKm: 20_000, gasPrice: 1_700, electricityPrice: 180, gasEfficiency: 11, evKwhPerKm: 0.18 };
export const EV_SUBSIDY_BASE: { vehiclePrice: number; nationalSubsidy: number; localSubsidy: number; isYouth: boolean; isConversion: boolean } = {
  vehiclePrice: 45_000_000,
  nationalSubsidy: MODEL_PRESETS[0].subsidy,
  localSubsidy: REGIONAL_SUBSIDIES[0].subsidy,
  isYouth: false,
  isConversion: false,
};

type RunPatch = Partial<{ annualKm: number; gasPrice: number; electricityPrice: number; gasEfficiency: number; evKwhPerKm: number }>;
function run(patch: RunPatch = {}) {
  const r = compareEvVsGas({ ...EV_VS_GAS_BASE, ...patch });
  if (!r.success) throw new Error(`ev-vs-gas digest input rejected: ${r.errorCode}`);
  return r.data;
}
type SubPatch = Partial<{ vehiclePrice: number; nationalSubsidy: number; localSubsidy: number; isYouth: boolean; isConversion: boolean }>;
function sub(patch: SubPatch = {}) {
  const r = calculateEvSubsidy({ ...EV_SUBSIDY_BASE, ...patch });
  if (!r.success) throw new Error(`ev subsidy digest input rejected: ${r.errorCode}`);
  return r.data;
}

function fuelCostGap(): Finding {
  const r = run();
  const gasPerKm = r.gasFuel / EV_VS_GAS_BASE.annualKm;
  const evPerKm = r.evFuel / EV_VS_GAS_BASE.annualKm;
  return {
    h2: `연료비만 놓고 보면 1km에 가솔린 ${wonAt(gasPerKm)}, 전기차 ${ida(wonAt(evPerKm))}`,
    body:
      `연 ${km(EV_VS_GAS_BASE.annualKm)}, 휘발유 ${won(EV_VS_GAS_BASE.gasPrice)}/L에 연비 ${num(EV_VS_GAS_BASE.gasEfficiency)}km/L, 충전 ${won(EV_VS_GAS_BASE.electricityPrice)}/kWh에 전비 ${num(EV_VS_GAS_BASE.evKwhPerKm, 2)}kWh/km를 가정하면 1년 연료비가 가솔린 ${won(r.gasFuel)}, 전기차 ${ro(won(r.evFuel))} 계산됩니다. ` +
      `1km로 환산하면 ${wonAt(gasPerKm)} 대 ${wonAt(evPerKm)}, 즉 ${eun(times(gasPerKm, evPerKm))} 차이입니다. ` +
      `이 격차가 생기는 이유는 단가가 아니라 단위 환산에 있는데, 가솔린은 1km에 ${num(1 / EV_VS_GAS_BASE.gasEfficiency, 3)}L를 쓰고 전기차는 ${num(EV_VS_GAS_BASE.evKwhPerKm, 2)}kWh를 쓰기 때문입니다. ` +
      `따라서 유가가 오르내릴 때 체감이 큰 쪽은 가솔린이고, 연 ${km(EV_VS_GAS_BASE.annualKm)} 기준으로 휘발유가 리터당 100원 오르면 연료비가 ${ga(won(run({ gasPrice: EV_VS_GAS_BASE.gasPrice + 100 }).gasFuel - r.gasFuel))} 늘어납니다.`,
  };
}

function fixedCostAlreadyFavorsEv(): Finding {
  const r = run();
  const gasFixed = r.gasTotal - r.gasFuel;
  const evFixed = r.evTotal - r.evFuel;
  const atZeroish = run({ annualKm: 1_000 });
  return {
    h2: `연료를 한 방울도 안 써도 전기차가 이미 연 ${won(gasFixed - evFixed)} 앞선다`,
    body:
      `이 계산기는 연료비 말고도 세금·정비 같은 고정비를 붙이는데, 그 합이 가솔린 ${won(gasFixed)}, 전기차 ${ro(won(evFixed))} 이미 ${won(gasFixed - evFixed)} 벌어져 있습니다. ` +
      `그래서 주행거리를 최소인 연 ${km(1_000)}까지 내려도 총액이 가솔린 ${won(atZeroish.gasTotal)} 대 전기차 ${ro(won(atZeroish.evTotal))} 전기차가 이깁니다 — 즉 이 모델에는 "전기차가 손해인 주행거리 구간"이 아예 없습니다. ` +
      `여기에는 중요한 가정이 숨어 있는데, 두 차의 구매 가격과 감가상각이 계산에 들어 있지 않다는 점입니다. ` +
      `따라서 이 비교는 "값이 같은 두 차를 몰 때의 운행비"를 뜻하고, 전기차의 높은 출고가와 보조금은 아래 항목의 실구매가로 따로 따져야 합니다.`,
  };
}

function chargingPriceCannotFlipAlone(): Finding {
  const r = run();
  const maxElec = 600;
  const atMax = run({ electricityPrice: maxElec });
  const needed = (r.gasTotal - (r.evTotal - r.evFuel)) / (EV_VS_GAS_BASE.annualKm * EV_VS_GAS_BASE.evKwhPerKm);
  return {
    h2: `충전요금을 입력 상한 ${won(maxElec)}/kWh까지 올려도 전기차가 이긴다`,
    body:
      `기본 전비 ${num(EV_VS_GAS_BASE.evKwhPerKm, 2)}kWh/km, 연 ${km(EV_VS_GAS_BASE.annualKm)}(가정)을 고정하고 충전 단가만 올리면 전기차 총액이 ${won(r.evTotal)}에서 ${ro(won(atMax.evTotal))} 오르지만, 가솔린 ${won(r.gasTotal)}에는 여전히 닿지 못합니다. ` +
      `계산상 동률이 되려면 충전 단가가 ${won(needed)}/kWh는 되어야 하는데, 이는 계산기가 받는 입력 범위를 한참 넘어섭니다. ` +
      `급속충전 요금이 완속의 몇 배가 되더라도 순위가 바뀌지 않는 이유는, 전기차가 연료비뿐 아니라 고정비에서도 ${eul(won(r.gasTotal - r.gasFuel - (r.evTotal - r.evFuel)))} 앞서 출발하기 때문입니다. ` +
      `그러므로 충전 단가를 낮추려는 노력의 값어치는 순위를 바꾸는 데 있지 않고, 연 ${eul(won(atMax.evTotal - r.evTotal))} 아끼는 절대 절감액에 있습니다.`,
  };
}

function efficiencyIsTheRealLever(): Finding {
  const maxElec = 600;
  // 전비를 0.001kWh/km씩 올려 가며 순위가 뒤집히는 지점을 엔진에서 찾는다
  let kwh = EV_VS_GAS_BASE.evKwhPerKm;
  while (kwh < 0.4 && run({ electricityPrice: maxElec, evKwhPerKm: Number(kwh.toFixed(3)) }).winner === "ev") kwh = Number((kwh + 0.001).toFixed(3));
  const flipped = run({ electricityPrice: maxElec, evKwhPerKm: kwh });
  return {
    h2: `순위를 뒤집는 축은 충전 단가가 아니라 전비 — ${num(kwh, 3)}kWh/km가 경계다`,
    body:
      `충전 단가를 입력 상한 ${won(maxElec)}/kWh로 올려 놓은 뒤(가정) 전비만 0.001kWh/km씩 나쁘게 만들면, ${num(kwh, 3)}kWh/km에서 처음으로 가솔린 총액 ${won(flipped.gasTotal)}이 전기차 ${won(flipped.evTotal)}보다 싸집니다. ` +
      `기본 가정 전비 ${num(EV_VS_GAS_BASE.evKwhPerKm, 2)}kWh/km에서 ${eul(pct(kwh / EV_VS_GAS_BASE.evKwhPerKm - 1))} 더 먹어야 도달하는 값이기 때문에, 대형 전기 SUV나 혹한기 주행처럼 전비가 크게 나빠지는 조건에서만 의미가 있습니다. ` +
      `게다가 뒤집힌 뒤에도 격차는 ${won(flipped.gap)}에 불과하므로, 경계 부근에서는 어느 쪽을 골라도 운행비 차이가 사실상 없습니다. ` +
      `즉 전기차의 운행비 우위를 지키는 핵심 변수는 요금제가 아니라 실제 전비이고, 계산기에는 제원표 값이 아니라 본인 주행 기록의 평균 전비를 넣어야 합니다.`,
  };
}

function gasCannotWinOnPriceAlone(): Finding {
  const best = run({ gasPrice: 1_000, gasEfficiency: 25 });
  const base = run();
  return {
    h2: `유가와 연비를 가솔린에 최대한 유리하게 줘도 격차가 ${won(best.gap)} 남는다`,
    body:
      `가솔린 쪽에 가장 유리한 입력을 모두 몰아넣어 휘발유 ${won(1_000)}/L, 연비 ${num(25)}km/L를 가정하면 연료비가 ${won(base.gasFuel)}에서 ${ro(won(best.gasFuel))} 내려갑니다. ` +
      `그런데도 총액은 가솔린 ${won(best.gasTotal)} 대 전기차 ${ro(won(best.evTotal))} 여전히 ${ga(won(best.gap))} 남습니다 — 연료비를 ${pct(1 - best.gasFuel / base.gasFuel)} 줄여도 고정비 차이를 다 메우지 못하기 때문입니다. ` +
      `이 조건에서 가솔린의 1km당 연료비는 ${won(best.gasFuel / EV_VS_GAS_BASE.annualKm)}까지 내려와 기본 가정의 전기차 ${wa(won(base.evFuel / EV_VS_GAS_BASE.annualKm))} 거의 같아지는데, 그것이 유가·연비로 갈 수 있는 끝입니다. ` +
      `따라서 하이브리드급 연비와 저유가가 동시에 와도 이 모델에서는 순위가 바뀌지 않고, 바뀌려면 앞서 본 전비 쪽이 무너져야 합니다.`,
  };
}

function gapScalesWithDistance(): Finding {
  const rows = [1_000, 10_000, 20_000, 50_000, 100_000].map((k) => ({ k, r: run({ annualKm: k }) }));
  const perKm = (rows[4].r.gap - rows[0].r.gap) / (100_000 - 1_000);
  return {
    h2: `주행 1km마다 전기차가 ${wonAt(perKm)}씩 벌어 격차가 곧게 커진다`,
    body:
      `기본 단가 가정(휘발유 ${won(EV_VS_GAS_BASE.gasPrice)}/L, 충전 ${won(EV_VS_GAS_BASE.electricityPrice)}/kWh)을 고정하고 주행거리만 바꾸면 연간 격차가 ${km(1_000)} ${won(rows[0].r.gap)}, ${km(10_000)} ${won(rows[1].r.gap)}, ${km(20_000)} ${won(rows[2].r.gap)}, ${km(100_000)} ${ro(won(rows[4].r.gap))} 커집니다. ` +
      `격차의 증가분을 주행거리로 나누면 1km당 정확히 ${ro(wonAt(perKm))} 일정한데, 고정비 차이는 주행과 무관하고 연료비 차이만 비례해서 늘기 때문입니다. ` +
      `그래서 격차는 ${won(rows[0].r.gap - perKm * 1_000)}이라는 고정 출발점에 1km당 ${eul(wonAt(perKm))} 더하는 1차식이 되고, 5년을 보유한다고 가정하면 연 ${km(20_000)} 기준 누적 ${ga(won(rows[2].r.gap * 5))} 됩니다. ` +
      `다만 이 누적액은 차값 차이를 상쇄하는 데 쓰이는 돈이므로, 전기차와 가솔린차의 실구매가 차이가 이보다 크면 5년으로는 회수되지 않습니다.`,
  };
}

function fiftyMillionCliff(): Finding {
  const under = sub({ vehiclePrice: 49_990_000 });
  const over = sub({ vehiclePrice: 50_000_000 });
  return {
    h2: `출고가 ${manwon(50_000_000)}에서 1만원 차이로 실구매가가 ${won(over.effectivePrice - under.effectivePrice)} 뛴다`,
    body:
      `보조금은 차량 가격 구간에 지급률을 곱하는 방식이라, 구간을 넘는 순간 총액이 절반으로 접힙니다(계산 기준은 아래 문단의 확인일). ` +
      `국고보조금 ${won(EV_SUBSIDY_BASE.nationalSubsidy)}, 지자체 ${eul(won(EV_SUBSIDY_BASE.localSubsidy))} 가정하면 출고가 ${won(49_990_000)}에서는 지급률 ${pct(under.priceRate, 0)}가 적용돼 총 보조금 ${won(under.totalSubsidy)}, 실구매가 ${won(under.effectivePrice)}입니다. ` +
      `출고가를 ${ro(won(50_000_000))} 1만원 올리면 지급률이 ${pct(over.priceRate, 0)}로 꺾여 보조금이 ${ro(won(over.totalSubsidy))} 줄고 실구매가는 ${ga(won(over.effectivePrice))} 됩니다. ` +
      `즉 차값 1만원 차이가 실구매가에서는 ${ga(won(over.effectivePrice - under.effectivePrice))} 되므로, 경계 바로 위의 차는 옵션을 빼서 경계 아래로 내리는 편이 같은 돈으로 더 나은 선택이 됩니다.`,
  };
}

function upperCliffRemovesEverything(): Finding {
  const bandLow = sub({ vehiclePrice: 50_000_000 });
  const bandHigh = sub({ vehiclePrice: 84_990_000 });
  const above = sub({ vehiclePrice: 85_000_000 });
  const bandWidth = 85_000_000 - 50_000_000;
  return {
    h2: `${manwon(bandWidth)} 폭의 절반 지급 구간 내내 보조금이 평평하다가 끝에서 0이 된다`,
    body:
      `가운데 구간에서는 지급률이 ${pct(bandLow.priceRate, 0)}로 고정이므로, 그 안에서 차값이 아무리 달라져도 받는 돈이 똑같습니다. ` +
      `국고 ${won(EV_SUBSIDY_BASE.nationalSubsidy)}·지자체 ${eul(won(EV_SUBSIDY_BASE.localSubsidy))} 가정하면 출고가 ${won(50_000_000)}인 차와 ${won(84_990_000)}인 차가 나란히 ${eul(won(bandLow.totalSubsidy))} 받아, ${manwon(bandWidth)}나 차이 나는 두 차의 보조금이 한 푼도 다르지 않습니다. ` +
      `그러다 ${won(85_000_000)}이 되는 순간 지급률이 ${ro(pct(above.priceRate, 0))} 떨어져 실구매가가 출고가와 같아지는데, 보조금 계산기를 돌릴 이유 자체가 사라지는 지점입니다. ` +
      `그러므로 이 구간 안에서는 값을 조금 낮춰 봐야 보조금이 늘지 않고, 의미가 있는 것은 위아래 두 경계선뿐입니다 — 아래 선을 넘길 때 잃는 돈이 ${won(bandHigh.totalSubsidy)}, 위 선을 넘길 때 잃는 돈이 남은 ${ida(won(bandHigh.totalSubsidy))}.`,
  };
}

function youthBonusHalvesButConversionDoesNot(): Finding {
  const lowYouth = sub({ isYouth: true, isConversion: true });
  const highYouth = sub({ vehiclePrice: 55_000_000, isYouth: true, isConversion: true });
  return {
    h2: `가격 구간을 넘으면 청년 가산은 반으로 줄지만 전환지원금은 그대로다`,
    body:
      `청년 가산은 가격 구간률이 곱해진 뒤의 국고보조금에 다시 붙는다고 계산하므로, 구간이 바뀌면 가산액도 함께 접힙니다. ` +
      `국고 ${won(EV_SUBSIDY_BASE.nationalSubsidy)}·지자체 ${won(EV_SUBSIDY_BASE.localSubsidy)}에 청년·전환을 모두 적용한다고 가정하면, 출고가 ${manwon(EV_SUBSIDY_BASE.vehiclePrice)}에서 청년 가산이 ${won(lowYouth.youthBonus)}인데 ${manwon(55_000_000)}에서는 ${ro(won(highYouth.youthBonus))} 절반이 됩니다. ` +
      `반면 전환지원금은 지급률과 무관한 정액이라 두 경우 모두 ${ro(won(lowYouth.conversionBonus))} 같고, 그래서 총 보조금에서 차지하는 비중이 ${pct(lowYouth.conversionBonus / lowYouth.totalSubsidy)}에서 ${ro(pct(highYouth.conversionBonus / highYouth.totalSubsidy))} 오릅니다. ` +
      `즉 비싼 차일수록 청년 자격보다 내연차 전환 조건이 상대적으로 값어치가 커지므로, 두 조건 중 하나만 맞출 수 있다면 차값에 따라 답이 달라집니다.`,
  };
}

function regionGapCompresses(): Finding {
  const cheapest = REGIONAL_SUBSIDIES.reduce((a, b) => (a.subsidy <= b.subsidy ? a : b));
  const richest = REGIONAL_SUBSIDIES.reduce((a, b) => (a.subsidy >= b.subsidy ? a : b));
  const lowCheap = sub({ localSubsidy: cheapest.subsidy });
  const lowRich = sub({ localSubsidy: richest.subsidy });
  const highCheap = sub({ vehiclePrice: 55_000_000, localSubsidy: cheapest.subsidy });
  const highRich = sub({ vehiclePrice: 55_000_000, localSubsidy: richest.subsidy });
  return {
    h2: `지자체 보조금 격차도 비싼 차에서는 정확히 절반으로 압축된다`,
    body:
      `지자체 보조금에도 같은 가격 구간률이 곱해지기 때문에, 지역 격차는 차값이 오르면 함께 압축됩니다. ` +
      `국고 ${eul(won(EV_SUBSIDY_BASE.nationalSubsidy))} 가정하고 출고가 ${manwon(EV_SUBSIDY_BASE.vehiclePrice)}에서 계산하면 지자체 몫이 가장 적은 지역은 총 ${won(lowCheap.totalSubsidy)}, 가장 많은 지역은 ${ro(won(lowRich.totalSubsidy))} ${ga(won(lowRich.totalSubsidy - lowCheap.totalSubsidy))} 벌어집니다. ` +
      `같은 두 지역을 출고가 ${manwon(55_000_000)}에 넣으면 ${won(highCheap.totalSubsidy)} 대 ${ro(won(highRich.totalSubsidy))} 격차가 ${ro(won(highRich.totalSubsidy - highCheap.totalSubsidy))} 정확히 절반이 됩니다. ` +
      `따라서 "보조금이 많은 지역"이라는 이점은 저가 전기차에서 가장 크고, 고가 차에서는 절반, 상위 구간에서는 아예 사라지므로 지역과 차값을 함께 넣어 확인해야 합니다.`,
  };
}

export const EV_VS_GAS_DIGEST: Finding[] = [
  fuelCostGap(),
  fixedCostAlreadyFavorsEv(),
  chargingPriceCannotFlipAlone(),
  efficiencyIsTheRealLever(),
  gasCannotWinOnPriceAlone(),
  gapScalesWithDistance(),
  fiftyMillionCliff(),
  upperCliffRemovesEverything(),
  youthBonusHalvesButConversionDoesNot(),
  regionGapCompresses(),
];
