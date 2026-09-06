// /lease-vs-loan 파생 다이제스트 — 세 조달 방식은 "무엇을 총비용에 넣는가"가 서로 달라서,
// 엔진(calcLeaseCompare)이 내놓는 순위를 그대로 읽으면 오해가 생긴다. 리스는 만기 반납을 전제로
// 잔존가치를 총비용에서 빼고, 장기렌트는 보험·세금을 요금에 넣는 대신 이자 대신 관리료를 매긴다.
// 아래 수치는 전부 엔진 실행값이고, 잔가를 인수했을 때의 비교도 같은 실행값을 더해서 만든다.

import { DEFAULT_LEASE_COMPARE_INPUT } from "@/lib/validators";
import { calcLeaseCompare } from "@/utils/calculator";
import { type Finding, eul, eun, ga, manwon, pct, pp, ro, term, times, wa, won } from "./format";

/** 화면 기본값과 같은 조건: 5,000만원, 보증금 20%, 36개월, 잔가 40%, 리스 5.5%, 할부 5.0%, 연 보험 80만원, 취득세 7%, 렌트 관리료 15% */
export const LEASE_BASE = DEFAULT_LEASE_COMPARE_INPUT;
const run = (patch: Partial<typeof LEASE_BASE> = {}) => calcLeaseCompare({ ...LEASE_BASE, ...patch });
const of = (patch: Partial<typeof LEASE_BASE>, method: "lease" | "loan" | "longTermRent") =>
  run(patch).methods.find((m) => m.method === method)!;

function whatIsInTheTotal(): Finding {
  const r = run();
  const lease = of({}, "lease");
  const loan = of({}, "loan");
  const rent = of({}, "longTermRent");
  return {
    h2: `리스 총비용이 ${won(r.spread)} 낮은 것은 잔존가치가 빠졌기 때문이다`,
    body:
      `${manwon(LEASE_BASE.vehiclePrice)} 차량을 보증금 ${pct(LEASE_BASE.depositRate, 0)}, ${term(LEASE_BASE.termMonths)}, 잔가 ${pct(LEASE_BASE.residualRate, 0)}로 가정하면 총비용이 리스 ${won(lease.totalCost)}, 할부 ${won(loan.totalCost)}, 장기렌트 ${ro(won(rent.totalCost))} 계산되어 리스가 1위로 나옵니다. ` +
      `그런데 리스 총비용은 만기 반납을 전제로 하므로 차를 계속 타려면 내야 하는 잔존가치 ${ga(won(lease.residualValue))} 빠져 있습니다 — 즉 리스만 "차를 남기지 않는 선택지"의 값이고, 나머지 둘은 차가 남거나 회사 명의로 반납되는 값입니다. ` +
      `세 방식이 담고 있는 항목도 다른데, 리스와 할부에는 취득세 ${ga(won(loan.taxCost))} 붙고 보험료 ${ga(won(loan.insuranceCost))} 따로 계산되는 반면 장기렌트는 요금에 포함되어 두 항목이 ${won(rent.taxCost)}으로 표시됩니다. ` +
      `따라서 이 순위를 그대로 "리스가 가장 싸다"로 읽으면 안 되고, 아래처럼 같은 기준으로 맞춘 뒤에 비교해야 합니다.`,
  };
}

function equalizeWithResidual(): Finding {
  const lease = of({}, "lease");
  const loan = of({}, "loan");
  const leaseOwned = lease.totalCost + lease.residualValue;
  const leaseInterest = lease.totalInstallment - (LEASE_BASE.vehiclePrice - lease.deposit - lease.residualValue);
  const loanInterest = loan.totalInstallment - (LEASE_BASE.vehiclePrice - loan.deposit);
  return {
    h2: `잔가를 인수해 조건을 맞추면 리스의 우위가 ${ro(won(loan.totalCost - leaseOwned))} 줄어든다`,
    body:
      `만기에 잔존가치 ${eul(won(lease.residualValue))} 내고 차를 인수한다고 가정하면 리스의 실질 총비용이 ${ga(won(leaseOwned))} 되어, 같은 조건의 ${wa(won(loan.totalCost))}의 차이가 ${ro(won(loan.totalCost - leaseOwned))} 좁혀집니다. ` +
      `이 남은 차이는 우연이 아니라 두 방식의 이자 차이 그 자체인데, 할부 이자가 ${won(loanInterest)}이고 리스 이자가 ${ga(won(leaseInterest))} 되어 그 차액이 ${won(loanInterest - leaseInterest)}으로 정확히 일치합니다. ` +
      `리스 금리 ${pct(LEASE_BASE.leaseRate)}가 할부 ${pct(LEASE_BASE.loanRate)}보다 ${pp((LEASE_BASE.leaseRate - LEASE_BASE.loanRate) * 100)} 높은데도 이자가 적은 것은, 리스가 잔가를 뺀 ${eul(manwon(LEASE_BASE.vehiclePrice - lease.deposit - lease.residualValue))} 빌리고 할부는 ${eul(manwon(LEASE_BASE.vehiclePrice - loan.deposit))} 빌리기 때문입니다. ` +
      `다만 이 모델은 잔존가치에 붙는 금융비용을 세지 않으므로, 실제 리스 견적이 잔가에도 이자를 매긴다면 여기서 나온 ${eun(won(loan.totalCost - leaseOwned))} 더 줄어듭니다.`,
  };
}

function leaseRateBoundary(): Finding {
  const loanTotal = of({}, "loan").totalCost;
  let rate = LEASE_BASE.leaseRate;
  while (rate < 0.2) {
    const l = of({ leaseRate: rate }, "lease");
    if (l.totalCost + l.residualValue >= loanTotal) break;
    rate = Number((rate + 0.0001).toFixed(4));
  }
  const atFlip = of({ leaseRate: rate }, "lease");
  return {
    h2: `잔가를 인수해도 리스가 할부에 지려면 리스 금리가 ${pct(rate, 2)}는 되어야 한다`,
    body:
      `리스 금리를 0.01%p씩 올려 가며 잔가 인수까지 더한 총비용을 다시 계산하면, 연 ${pct(rate, 2)}에서 처음으로 리스 ${ga(won(atFlip.totalCost + atFlip.residualValue))} 할부 ${eul(won(loanTotal))} 넘어섭니다(다른 조건은 기본 가정 그대로). ` +
      `기본 가정 금리 ${pct(LEASE_BASE.leaseRate)}에서 ${eul(pp((rate - LEASE_BASE.leaseRate) * 100))} 더 얹어야 하는 셈이라, 실무에서 흔한 1~2%p 차이로는 순위가 바뀌지 않습니다. ` +
      `이만한 여유가 생기는 이유는 앞서 본 대로 리스가 빌리는 원금이 잔가만큼 작기 때문이고, 그래서 금리를 비교할 때는 표시 금리가 아니라 "얼마에 몇 %를 매기는가"를 봐야 합니다. ` +
      `반대로 잔가율을 낮게 잡을수록 빌리는 원금이 커져 이 여유가 줄어드니, 견적을 받을 때 잔가율과 금리를 한 쌍으로 확인해야 합니다.`,
  };
}

function taxRateFlipsLoanAndRent(): Finding {
  let rate = 0;
  while (rate <= 0.07 && of({ acquisitionTaxRate: rate }, "loan").totalCost < of({ acquisitionTaxRate: rate }, "longTermRent").totalCost) {
    rate = Number((rate + 0.0001).toFixed(4));
  }
  const atZero = of({ acquisitionTaxRate: 0 }, "loan");
  const rentTotal = of({}, "longTermRent").totalCost;
  const loanBase = of({}, "loan");
  return {
    h2: `취득세율이 ${pct(rate)}를 넘으면 할부가 장기렌트보다 비싸진다`,
    body:
      `장기렌트는 차가 회사 명의라 취득세를 이용자가 따로 내지 않는다고 가정하는 반면, 할부는 취득세를 총비용에 그대로 더합니다. ` +
      `그래서 취득세율을 0.01%p씩 올려 가며 두 방식을 다시 계산하면 ${pct(rate)}에서 순위가 갈리는데, 세율이 ${pct(0, 0)}일 때는 할부가 ${ro(won(atZero.totalCost))} 장기렌트 ${won(rentTotal)}보다 싸지만 기본 가정인 ${pct(LEASE_BASE.acquisitionTaxRate, 0)}에서는 ${ro(won(loanBase.totalCost))} 올라 역전됩니다. ` +
      `역전을 만드는 금액은 세율 차이만큼의 취득세, 즉 ${won(loanBase.taxCost - atZero.taxCost)}이고 이는 차값 ${manwon(LEASE_BASE.vehiclePrice)}에 세율을 곱한 값입니다. ` +
      `따라서 경차나 친환경차처럼 취득세 부담이 낮은 차라면 할부가 유리한 쪽으로 되돌아오므로, 차종별 실제 세율을 넣어 다시 확인해야 합니다.`,
  };
}

function managementFeeBoundary(): Finding {
  let mgmt = 0;
  const loanTotal = of({}, "loan").totalCost;
  while (mgmt <= 0.5 && of({ rentManagementRate: mgmt }, "longTermRent").totalCost < loanTotal) mgmt = Number((mgmt + 0.001).toFixed(3));
  const atFlip = of({ rentManagementRate: mgmt }, "longTermRent");
  const base = of({}, "longTermRent");
  return {
    h2: `장기렌트 관리료율이 ${pct(mgmt)}를 넘는 순간 할부가 더 싸진다`,
    body:
      `장기렌트 요금은 원금을 기간으로 나눈 금액에 관리료율을 곱해 얹는 구조라, 관리료율이 곧 이 방식의 금융비용입니다. ` +
      `관리료율을 0.1%p씩 올려 가며 다시 계산하면 ${pct(mgmt)}에서 장기렌트 총비용 ${ga(won(atFlip.totalCost)) } 할부 ${eul(won(loanTotal))} 넘어섭니다(다른 조건은 기본 가정 그대로). ` +
      `기본 가정인 ${pct(LEASE_BASE.rentManagementRate, 0)}에서는 총비용이 ${ro(won(base.totalCost))} 할부보다 ${won(loanTotal - base.totalCost)} 낮으니, 아직 ${pp((mgmt - LEASE_BASE.rentManagementRate) * 100)}의 여유가 있는 셈입니다. ` +
      `다만 이 여유는 취득세·보험이 요금에 포함된다는 가정에서 나온 것이므로, 실제 계약이 보험을 따로 받는 조건이라면 경계는 훨씬 앞으로 당겨집니다.`,
  };
}

function longerTermFavorsRent(): Finding {
  const rows = ([24, 36, 48, 60] as const).map((t) => ({ t, loan: of({ termMonths: t }, "loan").totalCost, rent: of({ termMonths: t }, "longTermRent").totalCost }));
  const [t24, , , t60] = rows;
  return {
    h2: `${term(24)} 계약에서는 할부가, ${term(36)}부터는 장기렌트가 2위로 올라선다`,
    body:
      `기간을 늘리면 할부는 이자가 붙어 총비용이 늘지만 장기렌트는 관리료가 원금 비례라 증가폭이 완만합니다. 기본 가정에서 총비용이 ${term(24)} 할부 ${won(t24.loan)} 대 장기렌트 ${won(t24.rent)}, ${term(60)} 할부 ${won(t60.loan)} 대 장기렌트 ${ro(won(t60.rent))} 뒤집힙니다. ` +
      `${term(24)}에서는 할부가 ${eul(won(t24.rent - t24.loan))} 앞서지만 ${term(60)}에서는 장기렌트가 ${eul(won(t60.loan - t60.rent))} 앞서, 순위가 바뀌는 지점이 ${wa(term(24))} ${term(36)} 사이에 있습니다. ` +
      `기간이 두 배 반이 되는 동안 할부 총비용은 ${ga(won(t60.loan - t24.loan))} 늘지만 장기렌트는 ${won(t60.rent - t24.rent)}만 늘기 때문인데, 장기렌트에는 복리로 쌓이는 이자가 없기 때문입니다. ` +
      `그래서 짧게 타고 바꿀 계획이라면 할부가, 길게 끌 계획이라면 장기렌트가 상대적으로 유리해지고, 이 판단은 금리보다 기간이 먼저 정합니다.`,
  };
}

function rentHasNoInterestButFees(): Finding {
  const rent = of({}, "longTermRent");
  const loan = of({}, "loan");
  const financed = LEASE_BASE.vehiclePrice - loan.deposit;
  const mgmtTotal = financed * LEASE_BASE.rentManagementRate;
  const loanInterest = loan.totalInstallment - financed;
  return {
    h2: `장기렌트에는 이자가 없지만 관리료 ${ga(won(mgmtTotal))} 할부 이자의 ${times(mgmtTotal, loanInterest)}다`,
    body:
      `장기렌트 월 요금은 원금을 기간으로 나눈 뒤 관리료와 월 보험료를 더하는 방식이라 이자율이 등장하지 않습니다. 그래서 "이자가 없어 싸다"는 말이 나오지만, 실제로 내는 금융비용은 관리료입니다. ` +
      `기본 가정에서 조달 원금 ${manwon(financed)}에 관리료율 ${pct(LEASE_BASE.rentManagementRate, 0)}를 곱하면 ${won(mgmtTotal)}이고, 같은 원금을 연 ${pct(LEASE_BASE.loanRate)}로 ${term(LEASE_BASE.termMonths)} 할부했을 때의 이자는 ${won(loanInterest)}입니다. ` +
      `즉 이자 없는 방식이 이자 있는 방식보다 ${eul(won(mgmtTotal - loanInterest))} 더 받는 셈이고, 그런데도 총비용은 ${ga(won(loan.totalCost - rent.totalCost))} 낮은데 취득세 ${wa(won(loan.taxCost))} 보험료 ${ga(won(loan.insuranceCost))} 요금에 포함돼 있기 때문입니다. ` +
      `따라서 장기렌트를 고를 때 비교해야 할 것은 관리료율이 아니라 "포함된 항목을 뺀 뒤의 실질 부담"이며, 보험을 이미 저렴하게 가입한 사람에게는 포함의 값어치가 작아집니다.`,
  };
}

function monthlyRankDiffersFromTotal(): Finding {
  const lease = of({}, "lease");
  const loan = of({}, "loan");
  const rent = of({}, "longTermRent");
  return {
    h2: `리스 월납이 할부의 ${times(lease.monthlyPayment, loan.monthlyPayment)}인 것은 잔가만큼 덜 갚기 때문이다`,
    body:
      `기본 가정에서 월 납입액이 리스 ${won(lease.monthlyPayment)}, 할부 ${won(loan.monthlyPayment)}, 장기렌트 ${ro(won(rent.monthlyPayment))} 계산되어 리스가 가장 가볍습니다. ` +
      `리스가 ${term(LEASE_BASE.termMonths)} 동안 갚는 원금은 차값에서 보증금과 잔가를 뺀 ${manwon(LEASE_BASE.vehiclePrice - lease.deposit - lease.residualValue)}인 반면 할부는 ${manwon(LEASE_BASE.vehiclePrice - loan.deposit)}이라, 월납 차이는 금리가 아니라 원금 차이에서 나옵니다. ` +
      `그래서 월 부담만 보고 리스를 고르면 만기에 잔가 ${won(lease.residualValue)}이 한꺼번에 남고, 그 시점에 인수 자금을 마련하지 못하면 차를 반납하게 됩니다. ` +
      `반대로 장기렌트 월 요금 ${eun(won(rent.monthlyPayment))} 가장 무거워 보이지만 보험료와 세금이 이미 들어 있어, 할부 월납 ${won(loan.monthlyPayment)}에 월 보험료 ${eul(won(loan.insuranceCost / LEASE_BASE.termMonths))} 더한 ${wa(won(loan.monthlyPayment + loan.insuranceCost / LEASE_BASE.termMonths))} 견줘야 공평합니다.`,
  };
}

function priceDoesNotChangeRanking(): Finding {
  const prices = [20_000_000, LEASE_BASE.vehiclePrice, 100_000_000];
  const rows = prices.map((vehiclePrice) => ({
    vehiclePrice,
    order: run({ vehiclePrice }).methods.slice().sort((a, b) => a.totalCost - b.totalCost).map((m) => m.label).join(" < "),
    ratio: of({ vehiclePrice }, "loan").totalCost / of({ vehiclePrice }, "lease").totalCost,
    insurance: of({ vehiclePrice }, "lease").insuranceCost,
    leaseTotal: of({ vehiclePrice }, "lease").totalCost,
  }));
  const [small, , big] = rows;
  return {
    h2: `차값이 5배가 돼도 순위는 그대로지만 배수는 ${times(small.ratio * 100, 100)}에서 ${ro(times(big.ratio * 100, 100))} 벌어진다`,
    body:
      `보증금·잔가·취득세·이자가 모두 차값에 비례하므로 순위는 차값과 무관합니다. 실제로 ${manwon(small.vehiclePrice)}·${manwon(LEASE_BASE.vehiclePrice)}·${manwon(big.vehiclePrice)} 세 가격 모두에서 싼 순서가 "${small.order}"으로 같습니다(다른 조건은 기본 가정 그대로). ` +
      `그런데 배수는 같지 않아서, 할부 총비용이 리스의 ${times(small.ratio * 100, 100)}(${manwon(small.vehiclePrice)})에서 ${times(big.ratio * 100, 100)}(${manwon(big.vehiclePrice)})로 벌어집니다. ` +
      `원인은 연 보험료 ${ga(won(LEASE_BASE.annualInsurance))} 차값과 무관한 정액 입력이라는 데 있는데, 계약 기간 보험료 ${ga(won(small.insurance))} ${manwon(small.vehiclePrice)} 리스 총비용의 ${eul(pct(small.insurance / small.leaseTotal))} 차지하다가 ${manwon(big.vehiclePrice)}에서는 ${ro(pct(big.insurance / big.leaseTotal))} 내려가기 때문입니다. ` +
      `즉 싼 차일수록 세 방식의 상대 격차가 좁아 어느 쪽을 골라도 차이가 작고, 비싼 차일수록 금융 조건 하나가 총액을 크게 흔듭니다.`,
  };
}

export const LEASE_VS_LOAN_DIGEST: Finding[] = [
  whatIsInTheTotal(),
  equalizeWithResidual(),
  leaseRateBoundary(),
  taxRateFlipsLoanAndRent(),
  managementFeeBoundary(),
  longerTermFavorsRent(),
  rentHasNoInterestButFees(),
  monthlyRankDiffersFromTotal(),
  priceDoesNotChangeRanking(),
];
