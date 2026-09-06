// /parking 파생 다이제스트 — 주차 요금 비교의 핵심은 "일 최대요금 상한"이다. 상한이 걸리는 순간
// 시간권은 시간에 비례하기를 멈추고, 세 요금제의 순위가 시간·일수·요율 어디서 뒤집히는지가 정해진다.
// 아래 경계는 전부 엔진(compareParkingOptions)을 구간마다 다시 돌려 찾은 값이다.

import { PARKING_DAILY_CAP, compareParkingOptions } from "@/utils/ownershipCalculator";
import { type Finding, eul, eun, ga, num, pct, ro, times, wa, won } from "./format";

/** 화면(ParkingView) 기본값과 같은 조건: 월 20일, 하루 8시간, 시간당 2,000원, 월주차 180,000원 */
export const PARKING_BASE: { daysPerMonth: number; hoursPerDay: number; hourlyRate: number; monthlyPass: number } =
  { daysPerMonth: 20, hoursPerDay: 8, hourlyRate: 2_000, monthlyPass: 180_000 };
type Patch = Partial<typeof PARKING_BASE>;

function run(patch: Patch = {}) {
  const r = compareParkingOptions({ ...PARKING_BASE, ...patch });
  if (!r.success) throw new Error(`parking digest input rejected: ${r.errorCode}`);
  return r.data;
}
const totalOf = (patch: Patch, key: "hourly" | "daycap" | "monthly") => run(patch).items.find((i) => i.key === key)!.total;
const hours = (value: number) => `${num(value, 1)}시간`;

function baseRanking(): Finding {
  const r = run();
  const hourly = totalOf({}, "hourly");
  const daycap = totalOf({}, "daycap");
  const monthly = totalOf({}, "monthly");
  return {
    h2: `기본 조건에서는 월주차가 시간권보다 연 ${won((hourly - monthly) * 12)} 싸다`,
    body:
      `월 ${PARKING_BASE.daysPerMonth}일, 하루 ${hours(PARKING_BASE.hoursPerDay)}, 시간당 ${won(PARKING_BASE.hourlyRate)}, 월주차권 ${won(PARKING_BASE.monthlyPass)}을 가정하면 월 비용이 시간권 ${won(hourly)}, 일 최대요금 ${won(daycap)}, 월주차 ${ro(won(monthly))} 계산되어 월주차가 가장 쌉니다. ` +
      `가장 비싼 안과 가장 싼 안의 차이는 ${won(r.spread)}이고, 이를 열두 달로 늘리면 ${ga(won(r.spread * 12))} 됩니다. ` +
      `시간권과 일 최대요금의 차이가 ${won(hourly - daycap)}뿐인 이유는 하루 ${hours(PARKING_BASE.hoursPerDay)} 주차비 ${ga(won(PARKING_BASE.hoursPerDay * PARKING_BASE.hourlyRate))} 이미 일 상한 ${won(PARKING_DAILY_CAP)}을 넘겨, 상한이 하루당 ${eul(won(PARKING_BASE.hoursPerDay * PARKING_BASE.hourlyRate - PARKING_DAILY_CAP))} 잘라 내고 있기 때문입니다. ` +
      `따라서 이 조건에서 협상해야 할 대상은 시간 요율이 아니라 월주차권 가격이고, 아래 경계들이 그 판단 기준입니다.`,
  };
}

function capHitTime(): Finding {
  const rates = [1_000, 1_500, PARKING_BASE.hourlyRate, 2_500, 3_000];
  const rows = rates.map((rate) => ({ rate, h: PARKING_DAILY_CAP / rate }));
  const base = rows.find((x) => x.rate === PARKING_BASE.hourlyRate)!;
  return {
    h2: `시간당 ${won(PARKING_BASE.hourlyRate)}이면 하루 ${eul(hours(base.h))} 넘기는 순간 상한이 걸린다`,
    body:
      `일 최대요금 ${won(PARKING_DAILY_CAP)}은 단일 상한이라, 상한이 걸리기 시작하는 시각은 시간 요율로 나누기만 하면 나옵니다(가정 조건은 이 상한이 적용되는 주차장). ` +
      `시간당 ${won(1_000)}이면 ${hours(rows[0].h)}, ${won(1_500)}이면 ${hours(rows[1].h)}, ${won(PARKING_BASE.hourlyRate)}이면 ${hours(base.h)}, ${won(2_500)}이면 ${hours(rows[3].h)}, ${won(3_000)}이면 ${hours(rows[4].h)}부터입니다. ` +
      `요율이 비쌀수록 상한에 빨리 닿기 때문에, 비싼 주차장일수록 오래 대는 사람에게 상대적으로 유리해지는 역설이 생깁니다. ` +
      `즉 시간 요율만 보고 주차장을 고르면 하루 종일 대는 경우의 실제 부담을 잘못 잡게 되고, 비교해야 할 값은 요율이 아니라 "내 주차 시간에서의 하루 요금"입니다.`,
  };
}

function timeIsFreeAfterCap(): Finding {
  const at8 = totalOf({}, "daycap");
  const at24 = totalOf({ hoursPerDay: 24 }, "daycap");
  const hourly24 = totalOf({ hoursPerDay: 24 }, "hourly");
  const at7 = totalOf({ hoursPerDay: 7 }, "daycap");
  return {
    h2: `상한이 걸린 뒤에는 ${hours(8)}과 ${hours(24)}의 주차비가 똑같다`,
    body:
      `월 ${PARKING_BASE.daysPerMonth}일, 시간당 ${won(PARKING_BASE.hourlyRate)}(가정)에서 하루 ${hours(8)}을 대면 일 최대요금 기준 월 ${won(at8)}인데, 하루 ${ro(hours(24))} 세 배를 늘려도 여전히 ${won(at24)}입니다. ` +
      `상한 ${ga(won(PARKING_DAILY_CAP))} 이미 걸려 있어서 추가 시간의 한계비용이 0원이 되기 때문입니다. ` +
      `반면 상한이 없는 시간권으로 계산하면 같은 ${ga(hours(24))} ${won(hourly24)}, 즉 ${eul(times(hourly24, at24))} 내게 됩니다. ` +
      `상한 아래인 하루 ${hours(7)}에서는 사정이 반대라 일 최대요금이 ${ro(won(at7))} 내려가 시간권과 완전히 같아지므로, "일 최대요금이 있는 주차장"의 값어치는 오래 댈 때만 생깁니다.`,
  };
}

function rateBoundary(): Finding {
  // 시간권과 일 최대요금이 갈라지는 요율을 10원 단위로 엔진에서 찾는다
  let rate = 500;
  while (rate < 20_000 && totalOf({ hourlyRate: rate }, "hourly") === totalOf({ hourlyRate: rate }, "daycap")) rate += 1;
  const boundary = rate - 1;
  return {
    h2: `시간당 ${won(boundary)}까지는 일 최대요금이 있으나 마나다`,
    body:
      `하루 ${hours(PARKING_BASE.hoursPerDay)}, 월 ${PARKING_BASE.daysPerMonth}일(가정)을 고정하고 시간 요율을 10원씩 올려 가며 두 요금제를 다시 계산하면, 시간당 ${won(boundary)}까지는 시간권과 일 최대요금이 ${ro(won(totalOf({ hourlyRate: boundary }, "hourly")))} 완전히 같습니다. ` +
      `하루 주차비가 상한 ${won(PARKING_DAILY_CAP)}에 닿지 않아 상한이 아무 일도 하지 않기 때문인데, 요율이 ${eul(won(rate))} 넘는 순간 시간권만 ${ro(won(totalOf({ hourlyRate: rate }, "hourly")))} 올라가고 일 최대요금은 ${won(totalOf({ hourlyRate: rate }, "daycap"))}에서 멈춥니다. ` +
      `이 경계는 상한을 하루 주차 시간으로 나눈 값이라, 주차 시간이 길어질수록 더 낮은 요율에서도 상한이 작동합니다. ` +
      `그래서 "일 최대요금 있음"이라는 안내만 보고 안심하기보다, 내 요율과 시간이 이 경계의 어느 쪽인지 계산기에 넣어 확인하는 편이 확실합니다.`,
  };
}

function monthlyBreakEvenDays(): Finding {
  const find = (pass: number) => {
    let d = 1;
    while (d <= 31 && run({ daysPerMonth: d, monthlyPass: pass }).bestOption.key !== "monthly") d += 1;
    return d;
  };
  const base = find(PARKING_BASE.monthlyPass);
  const cheap = find(120_000);
  const pricey = find(240_000);
  return {
    h2: `월주차권 ${won(PARKING_BASE.monthlyPass)}은 한 달 ${base}일부터 이득이다`,
    body:
      `하루 ${hours(PARKING_BASE.hoursPerDay)}, 시간당 ${won(PARKING_BASE.hourlyRate)}(가정)에서 주차 일수를 하루씩 늘려 가며 가장 싼 요금제를 다시 고르면, 월주차가 처음 1위가 되는 지점이 ${base}일입니다. ` +
      `${base - 1}일에서는 일 최대요금이 ${won(totalOf({ daysPerMonth: base - 1 }, "daycap"))}으로 월주차권 ${wa(won(PARKING_BASE.monthlyPass))} 같아져 아직 이득이 없고, 하루를 더 대는 순간 ${ro(won(totalOf({ daysPerMonth: base }, "daycap")))} 넘어섭니다. ` +
      `월주차권이 ${won(120_000)}이면 이 경계가 ${cheap}일로 당겨지고 ${won(240_000)}이면 ${pricey}일로 밀리는데, 경계 일수는 대략 월주차권을 상한 ${won(PARKING_DAILY_CAP)}으로 나눈 값이기 때문입니다. ` +
      `따라서 재택근무가 섞여 출근이 주 3일 안팎이라면 월 ${num(12)}일 남짓이라 월주차권이 손해가 될 수 있으니, 실제 출근 일수를 넣어 확인해야 합니다.`,
  };
}

function passPriceBoundary(): Finding {
  const daycap = totalOf({}, "daycap");
  const justUnder = run({ monthlyPass: daycap - 10_000 });
  const justOver = run({ monthlyPass: daycap + 10_000 });
  return {
    h2: `월주차권이 ${won(daycap)}을 넘으면 1위가 일 최대요금으로 넘어간다`,
    body:
      `월 ${PARKING_BASE.daysPerMonth}일, 하루 ${hours(PARKING_BASE.hoursPerDay)}, 시간당 ${won(PARKING_BASE.hourlyRate)}(가정)에서 일 최대요금 기준 월 비용은 ${won(daycap)}으로 고정되어 있으므로, 월주차권의 가치는 이 값 하나와만 견주면 됩니다. ` +
      `월주차권이 ${won(daycap - 10_000)}이면 가장 싼 선택지가 ${eun(justUnder.bestOption.label)} 그대로지만, ${ro(won(daycap + 10_000))} 오르는 순간 1위가 ${ro(justOver.bestOption.label)} 넘어가고 월주차는 더 이상 아무것도 아끼지 못합니다. ` +
      `기본 조건의 월주차권 ${won(PARKING_BASE.monthlyPass)}은 이 상한선의 ${eul(pct(PARKING_BASE.monthlyPass / daycap))} 쓰고 있어, ${eul(won(daycap - PARKING_BASE.monthlyPass))} 더 올려 받아도 아직 손해가 아닙니다. ` +
      `즉 월주차권 인상 통보를 받았을 때 따져야 할 숫자는 인상률이 아니라 이 ${won(daycap)}이라는 절대 상한이고, 이 값은 상한 ${wa(won(PARKING_DAILY_CAP))} 주차 일수만으로 정해집니다.`,
  };
}

function capSavesPerMonth(): Finding {
  const uncapped = PARKING_BASE.hoursPerDay * PARKING_BASE.hourlyRate;
  const perDay = uncapped - PARKING_DAILY_CAP;
  const hourly = totalOf({}, "hourly");
  const daycap = totalOf({}, "daycap");
  return {
    h2: `상한이 하루 ${won(perDay)}을 잘라 월 ${won(hourly - daycap)}을 줄인다`,
    body:
      `하루 ${eul(hours(PARKING_BASE.hoursPerDay))} 시간당 ${won(PARKING_BASE.hourlyRate)}에 대면 상한이 없을 때 ${won(uncapped)}이지만, 상한 ${won(PARKING_DAILY_CAP)}이 걸려 실제로는 ${won(PARKING_DAILY_CAP)}만 냅니다(가정 조건은 상한이 적용되는 주차장). ` +
      `하루 ${won(perDay)}, 월 ${PARKING_BASE.daysPerMonth}일이면 ${won(hourly - daycap)}이 잘려 나가는 셈이고, 비율로는 시간권 대비 ${eul(pct(1 - daycap / hourly))} 줄입니다. ` +
      `절감폭이 크지 않아 보이는 이유는 하루 주차 시간이 상한 도달 시각을 겨우 넘겼기 때문인데, 하루 ${eul(hours(12))} 대면 같은 상한이 월 ${eul(won(totalOf({ hoursPerDay: 12 }, "hourly") - totalOf({ hoursPerDay: 12 }, "daycap")))} 잘라 냅니다. ` +
      `그래서 상한의 값어치는 상한 금액이 아니라 "내 주차 시간이 상한을 얼마나 넘기는가"로 정해집니다.`,
  };
}

function marginalHour(): Finding {
  const h7 = totalOf({ hoursPerDay: 7 }, "daycap");
  const h75 = totalOf({ hoursPerDay: 7.5 }, "daycap");
  const h8 = totalOf({ hoursPerDay: 8 }, "daycap");
  const hourly7 = totalOf({ hoursPerDay: 7 }, "hourly");
  const hourly8 = totalOf({ hoursPerDay: 8 }, "hourly");
  return {
    h2: `한 시간을 더 대는 값이 상한 앞에서는 월 ${won(hourly8 - hourly7)}, 뒤에서는 0원이다`,
    body:
      `월 ${PARKING_BASE.daysPerMonth}일, 시간당 ${won(PARKING_BASE.hourlyRate)}(가정)을 고정하고 하루 주차 시간만 늘리면 일 최대요금 기준 월 비용이 ${hours(7)} ${won(h7)}, ${hours(7.5)} ${won(h75)}, ${hours(8)} ${ro(won(h8))} 움직입니다. ` +
      `${hours(7)}에서 ${hours(7.5)}까지는 ${ga(won(h75 - h7))} 붙지만 ${eul(hours(7.5))} 지나면 한 푼도 늘지 않는데, 그 지점이 하루 요금이 상한에 정확히 닿는 시각이기 때문입니다. ` +
      `같은 구간을 시간권으로 계산하면 ${hours(7)} ${won(hourly7)}에서 ${hours(8)} ${ro(won(hourly8))} ${ga(won(hourly8 - hourly7))} 그대로 붙어, 두 요금제의 한계비용이 여기서 갈립니다. ` +
      `따라서 "조금 더 있다 갈까"라는 판단의 답은 지금 시각이 상한 도달선의 앞인지 뒤인지에 달려 있고, 뒤라면 남은 하루는 비용이 들지 않습니다.`,
  };
}

function spreadWidens(): Finding {
  const pricey = run({ hourlyRate: 3_000 });
  const cheap = run({ hourlyRate: 1_000 });
  return {
    h2: `요율이 ${ro(won(3_000))} 오르면 요금제를 잘못 고른 대가가 ${ga(times(pricey.spread, cheap.spread))} 된다`,
    body:
      `요금제를 잘못 고를 때 물어야 하는 대가는 요율을 따라 커집니다. 다른 입력은 기본 가정으로 두고 요율만 바꿔 최고안과 최저안의 차이를 재면 시간당 ${won(1_000)}에서 ${won(cheap.spread)}, ${won(3_000)}에서 ${ga(won(pricey.spread))} 나옵니다. ` +
      `싼 요율에서 격차가 좁은 것은 상한이 작동하지 않아 시간권과 일 최대요금이 ${ro(won(cheap.items[0].total))} 붙어 버리고, 실질 선택지가 둘로 줄기 때문입니다. ` +
      `요율이 비싸지면 사정이 달라져 시간권만 ${won(pricey.items[pricey.items.length - 1].total)}까지 치솟고 일 최대요금은 ${won(pricey.items.find((i) => i.key === "daycap")!.total)}에 묶이므로, 습관대로 시간권을 쓰면 매달 ${eul(won(pricey.spread))} 더 내게 됩니다. ` +
      `오히려 비싼 주차장에서 요금제를 한 번 확인하는 일의 값어치가 큰 셈이고, 열두 달로 환산하면 ${ga(won(pricey.spread * 12))} 걸린 판단이 됩니다.`,
  };
}

export const PARKING_DIGEST: Finding[] = [
  baseRanking(),
  capHitTime(),
  timeIsFreeAfterCap(),
  rateBoundary(),
  monthlyBreakEvenDays(),
  passPriceBoundary(),
  capSavesPerMonth(),
  marginalHour(),
  spreadWidens(),
];
