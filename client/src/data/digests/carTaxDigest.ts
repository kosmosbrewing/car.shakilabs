// /tax 파생 다이제스트 — 취등록세는 "과세표준 × 차종 세율 + 공채 할인매각 + 부대비용"이라,
// 배기량·지역·차종·차령 어느 축을 건드려도 총액이 계단처럼 꺾인다. 그 계단이 어디에 있고
// 한 칸이 얼마인지는 엔진(calcCarTax)을 구간마다 돌려야 보인다. 아래 수치는 전부 그 실행값이다.

import { DEFAULT_CAR_TAX_INPUT } from "@/lib/validators";
import { calcCarTax } from "@/utils/calculator";
import { type Finding, eul, eun, ga, manwon, num, pct, ro, times, wa, won } from "./format";

/** 화면 기본값과 같은 조건: 3,000만원 신차 비영업 승용 1,600~2,000cc, 서울, 번호판 대행 포함 */
export const TAX_BASE = DEFAULT_CAR_TAX_INPUT;
const run = (patch: Partial<typeof TAX_BASE>) => calcCarTax({ ...TAX_BASE, ...patch });

function costShape(): Finding {
  const r = run({});
  return {
    h2: `총 등록비용의 ${pct(r.acquisitionTax / r.totalCost)}는 취득세 하나다`,
    body:
      `${manwon(TAX_BASE.vehiclePrice)} 신차 비영업 승용차를 서울에서 1,600~2,000cc로 등록한다고 가정하면 총 ${won(r.totalCost)}이 들고, 그중 취득세가 ${won(r.acquisitionTax)}입니다. ` +
      `공채 할인매각 비용은 ${won(r.bondCost)}(${pct(r.bondCost / r.totalCost)}), 인지세·증지대·번호판 대행을 합친 부대비용은 ${won(r.miscCost)}(${pct(r.miscCost / r.totalCost)})에 그칩니다. ` +
      `따라서 등록비를 줄이려고 번호판을 직접 달러 가는 선택은 최대 ${eul(won(r.totalCost - run({ applyPlateAgencyFee: false }).totalCost))} 아끼는 데 그칩니다 — 총액을 실제로 움직이는 축은 세율이 걸리는 차종과, 공채 매입비율을 정하는 배기량·지역입니다. ` +
      `취득세는 과세표준에 세율 ${eul(pct(r.taxRate, 0))} 곱한 값이라 차값에 정비례하지만, 나머지 두 축은 아래처럼 구간을 넘는 순간 계단으로 뜁니다.`,
  };
}

function displacementCliff(): Finding {
  const small = run({ displacementRange: "1000to1600" });
  const mid = run({ displacementRange: "1600to2000" });
  const big = run({ displacementRange: "over2000" });
  return {
    h2: `배기량 1,600cc를 1cc 넘기면 등록비가 ${won(mid.totalCost - small.totalCost)} 뛴다`,
    body:
      `배기량은 취득세율을 바꾸지 않고 공채 매입비율만 바꾸는데도, 같은 ${manwon(TAX_BASE.vehiclePrice)} 승용차의 서울 등록비가 1,600cc 이하 ${won(small.totalCost)}, 1,600~2,000cc ${won(mid.totalCost)}, 2,000cc 초과 ${ro(won(big.totalCost))} 갈립니다(가정 조건은 신차·번호판 대행 포함). ` +
      `1,600cc 이하 구간의 매입비율이 ${pct(small.bondPurchaseRate, 0)}라 공채 부담이 아예 없기 때문에, 첫 계단은 ${won(mid.bondCost)}이 통째로 새로 생기는 모양입니다. ` +
      `두 번째 계단은 매입비율이 ${pct(mid.bondPurchaseRate, 0)}에서 ${ro(pct(big.bondPurchaseRate, 0))} 오르며 ${eul(won(big.bondCost - mid.bondCost))} 더합니다. ` +
      `즉 1,591cc와 1,601cc는 세금이 같지만 등록비는 ${won(mid.totalCost - small.totalCost)} 차이가 나므로, 같은 모델의 배기량 선택지가 이 경계를 걸치고 있다면 등록비까지 얹어 비교해야 합니다.`,
  };
}

function regionSpread(): Finding {
  const seoulBig = run({ region: "seoul", displacementRange: "over2000" });
  const gyeonggiBig = run({ region: "gyeonggi", displacementRange: "over2000" });
  const otherBig = run({ region: "other", displacementRange: "over2000" });
  const seoulMid = run({ region: "seoul" });
  const otherMid = run({ region: "other" });
  return {
    h2: `같은 차를 서울에 등록하면 기타 지역보다 ${won(seoulBig.totalCost - otherBig.totalCost)} 더 낸다`,
    body:
      `취득세율은 전국이 같기 때문에 지역 차이는 오직 공채에서만 나옵니다. ${manwon(TAX_BASE.vehiclePrice)} 2,000cc 초과 신차를 가정하면 공채 부담이 서울 ${won(seoulBig.bondCost)}, 경기 ${won(gyeonggiBig.bondCost)}, 기타 지역 ${ro(won(otherBig.bondCost))} 총 등록비가 ${won(seoulBig.totalCost)}·${won(gyeonggiBig.totalCost)}·${ro(won(otherBig.totalCost))} 벌어집니다. ` +
      `1,600~2,000cc로 내려오면 같은 격차가 ${ro(won(seoulMid.totalCost - otherMid.totalCost))} 좁혀지는데, 배기량이 작을수록 매입비율 자체가 낮아 지역 차가 실릴 자리가 줄기 때문입니다. ` +
      `다만 할인율은 반대 방향입니다 — 서울 ${pct(seoulBig.bondDiscountRate, 0)}, 경기 ${pct(gyeonggiBig.bondDiscountRate, 0)}, 기타 ${pct(otherBig.bondDiscountRate, 0)}로 매입비율이 낮은 지역일수록 할인율은 높습니다. ` +
      `그래서 "지방이 무조건 싸다"가 아니라 매입비율(${pct(seoulBig.bondPurchaseRate, 0)}·${pct(gyeonggiBig.bondPurchaseRate, 0)}·${pct(otherBig.bondPurchaseRate, 0)})이 격차를 만들고 할인율이 그 일부를 되돌리는 구조입니다.`,
  };
}

function lightCarExemption(): Finding {
  const light = run({ vehicleType: "light" });
  const passenger = run({});
  // 감면 한도가 소진되는 차값을 10만원 단위로 올려 가며 엔진에서 직접 찾는다
  let exhaust = 1_000_000;
  while (exhaust < 50_000_000 && run({ vehicleType: "light", vehiclePrice: exhaust }).acquisitionTax === 0) exhaust += 10_000;
  const lastFree = exhaust - 10_000;
  const justOver = run({ vehicleType: "light", vehiclePrice: 20_000_000 });
  return {
    h2: `경차는 차값 ${manwon(lastFree)}까지 취득세가 0원이다`,
    body:
      `경차 취득세율은 ${pct(light.taxRate, 0)}이고 감면 한도가 정해져 있어서, 차값을 1만원씩 올려 가며 엔진을 다시 돌리면 ${manwon(lastFree)}까지는 취득세가 ${ga(won(0))} 유지되고 그 위로는 한도를 넘긴 부분에만 세금이 붙습니다. ` +
      `${manwon(20_000_000)}짜리 경차라면 한도를 넘긴 부분만 남아 취득세가 ${won(justOver.acquisitionTax)}, 총 등록비는 ${won(justOver.totalCost)}입니다. ` +
      `가격을 ${ro(manwon(TAX_BASE.vehiclePrice))} 맞춰 승용차와 나란히 놓으면 경차 ${won(light.totalCost)} 대 승용 ${ro(won(passenger.totalCost))} ${eul(won(passenger.totalCost - light.totalCost))} 아낍니다(가정 조건은 서울·신차). ` +
      `이 격차가 세율 차이보다 큰 이유는 경차가 공채 매입 대상에서도 빠져 ${eun(won(passenger.bondCost))} 통째로 사라지기 때문입니다.`,
  };
}

function usedResidualCurve(): Finding {
  const ages = [1, 2, 3, 4, 5, 10].map((a) => ({ a, r: run({ condition: "used", modelYearAge: a }) }));
  const [y1, y2, y3, , y5, y10] = ages;
  const drop12 = y1.r.totalCost - y2.r.totalCost;
  const drop45 = ages[3].r.totalCost - y5.r.totalCost;
  const newCar = run({});
  return {
    h2: `중고차 차령 1년의 값어치는 ${won(drop12)}에서 ${ro(won(drop45))} 식는다`,
    body:
      `중고차는 시가표준액 잔존가치율이 과세표준을 깎기 때문에 차령이 곧 등록비입니다. 원 차값 ${manwon(TAX_BASE.vehiclePrice)}, 서울, 1,600~2,000cc를 가정하면 총 등록비가 차령 1년 ${won(y1.r.totalCost)}, 2년 ${won(y2.r.totalCost)}, 3년 ${won(y3.r.totalCost)}, 5년 ${won(y5.r.totalCost)}, 10년 ${won(y10.r.totalCost)}입니다. ` +
      `1년에서 2년으로 넘어갈 때 ${ga(won(drop12))} 빠지지만 4년에서 5년으로 넘어갈 때는 ${won(drop45)}뿐이라, 감가와 마찬가지로 등록비 절감도 앞쪽에 몰려 있습니다. ` +
      `그래서 신차 ${wa(won(newCar.totalCost))} 견주면 5년차 중고차는 등록비만으로도 ${eul(pct(1 - y5.r.totalCost / newCar.totalCost))} 덜 냅니다. ` +
      `반면 과세표준이 낮아져도 인지세·증지대·번호판 대행 ${eun(won(y10.r.miscCost))} 그대로라, 차령 10년쯤 되면 이 고정비가 총액의 ${eul(pct(y10.r.miscCost / y10.r.totalCost))} 차지할 만큼 비중이 커집니다.`,
  };
}

function vehicleTypeLadder(): Finding {
  const rows = (["passenger", "van", "light", "motorcycle"] as const).map((v) => ({ v, r: run({ vehicleType: v }) }));
  const [pass, van, light, moto] = rows;
  return {
    h2: `가격이 같아도 차종만 바꾸면 등록비가 ${times(pass.r.totalCost, light.r.totalCost)} 벌어진다`,
    body:
      `같은 ${manwon(TAX_BASE.vehiclePrice)}, 같은 서울 등록을 가정하고 차종만 바꾸면 비영업 승용 ${won(pass.r.totalCost)}, 승합·화물 ${won(van.r.totalCost)}, 경차 ${won(light.r.totalCost)}, 이륜 ${ro(won(moto.r.totalCost))} 계산됩니다. ` +
      `취득세율이 각각 ${pct(pass.r.taxRate, 0)}·${pct(van.r.taxRate, 0)}·${pct(light.r.taxRate, 0)}·${pct(moto.r.taxRate, 0)}이기 때문인데, 세율만으로는 설명이 끝나지 않습니다. ` +
      `경차 세율 ${eun(pct(light.r.taxRate, 0))} 승합·화물 ${pct(van.r.taxRate, 0)}보다 1%p 낮을 뿐이지만 실제 등록비는 ${eul(won(van.r.totalCost - light.r.totalCost))} 더 아끼는데, 감면 한도와 공채 면제가 함께 걸리기 때문입니다. ` +
      `즉 세율표만 보고 차종별 부담을 비교하면 경차·이륜의 이점을 실제보다 작게 잡게 됩니다.`,
  };
}

function disabilityCliff(): Finding {
  const midExempt = run({ isDisabledOwner: true });
  const bigExempt = run({ isDisabledOwner: true, displacementRange: "over2000" });
  const bigNormal = run({ displacementRange: "over2000" });
  return {
    h2: `장애인 감면은 2,000cc에서 끊겨 ${ga(won(bigExempt.totalCost - midExempt.totalCost))} 되살아난다`,
    body:
      `이 계산기는 장애인 감면을 2,000cc 이하 승용까지만 적용한다고 가정합니다. 그래서 ${manwon(TAX_BASE.vehiclePrice)} 신차를 1,600~2,000cc로 넣으면 총 등록비가 ${won(midExempt.totalCost)}까지 내려가지만, 배기량만 2,000cc 초과로 바꾸면 ${ro(won(bigExempt.totalCost))} 뜁니다. ` +
      `차이 ${eun(won(bigExempt.totalCost - midExempt.totalCost))} 사라졌던 취득세 ${ga(won(bigExempt.acquisitionTax))} 통째로 돌아온 값입니다. ` +
      `다만 감면 대상에서 벗어난 뒤에도 공채는 계속 면제라, 같은 2,000cc 초과 조건의 일반 등록 ${won(bigNormal.totalCost)}보다는 ${manwon(bigNormal.totalCost - bigExempt.totalCost)} 낮게 남습니다. ` +
      `따라서 이 경계는 "감면이 전부 사라지는 선"이 아니라 "취득세 감면만 사라지고 공채 면제는 남는 선"이며, 2,000cc 이하 모델이 선택지에 있다면 등록비 차이가 ${won(bigExempt.totalCost - midExempt.totalCost)}까지 벌어진다는 뜻입니다.`,
  };
}

function fixedCostDilution(): Finding {
  const small = run({});
  const big = run({ vehiclePrice: 100_000_000, displacementRange: "over2000" });
  const noPlate = run({ applyPlateAgencyFee: false });
  return {
    h2: `부대비용 ${eun(won(small.miscCost))} 차값이 오르면 총액의 ${pct(small.miscCost / small.totalCost)}에서 ${ro(pct(big.miscCost / big.totalCost))} 희석된다`,
    body:
      `인지세·증지대·번호판 대행 수수료는 차값과 무관한 정액이라, 차가 비쌀수록 존재감이 빠르게 사라집니다. ${manwon(TAX_BASE.vehiclePrice)} 승용차(가정)에서는 ${won(small.miscCost)}이 총액 ${won(small.totalCost)}의 ${eul(pct(small.miscCost / small.totalCost))} 차지하지만, ${manwon(100_000_000)} 2,000cc 초과 차량에서는 총액이 ${ro(won(big.totalCost))} 뛰면서 같은 ${ga(won(big.miscCost))} ${ro(pct(big.miscCost / big.totalCost))} 내려갑니다. ` +
      `번호판 대행을 빼면 총액은 ${won(noPlate.totalCost)}, 절감폭은 ${won(small.totalCost - noPlate.totalCost)}입니다. ` +
      `그래서 등록 단계에서 "대행 수수료 아끼기"는 저가 차에서만 체감되는 절감이고, 고가 차에서는 취득세 ${wa(won(big.acquisitionTax))} 공채 ${ga(won(big.bondCost))} 결정을 지배합니다. ` +
      `비교를 할 때 항목별 절대액이 아니라 총액 대비 비중으로 봐야 하는 이유입니다.`,
  };
}

function bondIsNotPurchase(): Finding {
  const small = run({});
  const big = run({ vehiclePrice: 100_000_000, displacementRange: "over2000" });
  return {
    h2: `공채는 매입액 ${ga(won(small.bondPurchaseAmount))} 아니라 할인 손실 ${won(small.bondCost)}만 비용이다`,
    body:
      `공채는 사서 바로 되파는 것을 전제로 계산하므로, 실제로 부담하는 돈은 매입 기준액이 아니라 되팔 때의 할인 손실입니다. ${manwon(TAX_BASE.vehiclePrice)} 1,600~2,000cc 서울(가정)에서는 매입 기준액이 ${ro(won(small.bondPurchaseAmount))} 잡히지만 비용으로 계산되는 값은 ${won(small.bondCost)}, 즉 할인율 ${pct(small.bondDiscountRate, 0)}만큼입니다. ` +
      `${manwon(100_000_000)} 2,000cc 초과로 올리면 매입 기준액이 ${won(big.bondPurchaseAmount)}까지 커지지만 실제 비용은 ${ro(won(big.bondCost))} ${num(big.bondPurchaseAmount / big.bondCost)}분의 1에 머뭅니다. ` +
      `이 차이를 모르면 견적서의 "공채 ${manwon(big.bondPurchaseAmount)}"을 그대로 비용으로 더해 총액을 ${manwon(big.bondPurchaseAmount - big.bondCost)}이나 부풀리게 됩니다. ` +
      `반대로 공채를 팔지 않고 만기까지 보유한다면 이 계산은 맞지 않으니, 매입 기준액과 할인 손실을 나눠 적은 견적인지부터 확인해야 합니다.`,
  };
}

export const CAR_TAX_DIGEST: Finding[] = [
  costShape(),
  displacementCliff(),
  regionSpread(),
  lightCarExemption(),
  usedResidualCurve(),
  vehicleTypeLadder(),
  disabilityCliff(),
  fixedCostDilution(),
  bondIsNotPurchase(),
];
