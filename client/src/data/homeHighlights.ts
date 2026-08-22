// 홈(/) 전용 데이터.
//
// 왜 별도 파일인가: /all(CarToolsView)은 "도구 디렉터리"로서 각 계산기의 사용법을
// 서술하고, 홈은 "질문 → 계산기" 진입과 2026년 기준 숫자 요약을 맡는다. 두 화면이
// 같은 문장을 쓰면 중복 블록 감사에 걸리므로 표현 계층을 파일 단위로 분리한다.
//
// 수치는 literal로 적지 않고 계산기가 쓰는 상수를 그대로 가져온다 — 세율이 바뀌었을 때
// 계산 결과와 홈 요약표가 어긋나는 사고를 원천 차단한다.
import {
  ACQUISITION_TAX_RATES,
  BOND_PURCHASE_RATES,
  LIGHT_CAR_TAX_EXEMPT_LIMIT,
  MISC_COSTS,
  RESIDUAL_VALUE_RATES,
  CAR_TAX_DATA_UPDATED,
} from "@/data/carTaxRates";
import {
  CONVERSION_BONUS,
  NATIONAL_SUBSIDY_MAX,
  YOUTH_BONUS_RATE,
  maintenanceProfiles,
} from "@/data/ownershipData";
import type { CarToolKey } from "@/data/carNavigation";

export const CAR_HOME_UPDATED = CAR_TAX_DATA_UPDATED;

export interface HomeIntent {
  key: CarToolKey;
  question: string;
  path: string;
  action: string;
}

/** "지금 궁금한 질문"에서 계산기로 진입시키는 목록 (6개 계산기 전부 연결) */
export const HOME_INTENTS: readonly HomeIntent[] = [
  {
    key: "tax",
    question: "계약서에 적힌 차값 말고, 등록까지 마치면 얼마가 더 나가나요?",
    path: "/tax",
    action: "취득·등록세 계산",
  },
  {
    key: "lease-vs-loan",
    question: "할부·리스·장기렌트 중에 결국 어느 쪽이 덜 나가나요?",
    path: "/lease-vs-loan",
    action: "조달 방식 총비용 비교",
  },
  {
    key: "insurance",
    question: "갱신 안내가 왔는데, 이 보험료를 더 깎을 여지가 있나요?",
    path: "/insurance",
    action: "보험 절감액 확인",
  },
  {
    key: "maintenance",
    question: "지금 타는 차를 1년 더 굴리면 유지비가 얼마나 드나요?",
    path: "/maintenance",
    action: "연간 유지비 계산",
  },
  {
    key: "parking",
    question: "출퇴근 주차, 시간제와 월주차 중 어느 쪽이 이득인가요?",
    path: "/parking",
    action: "주차비 비교",
  },
  {
    key: "ev-vs-gas",
    question: "전기차로 갈아타면 몇 년쯤 지나야 본전이 되나요?",
    path: "/ev-vs-gas",
    action: "전기차 손익분기 계산",
  },
];

export interface HomeCostRow {
  item: string;
  value: string;
  note: string;
}

const percent = (rate: number): string => `${Number((rate * 100).toFixed(1))}%`;
const manwon = (won: number): string => `${(won / 10_000).toLocaleString("ko-KR")}만원`;

/**
 * 홈에만 있는 2026년 기준 요약표.
 * 계산기별 상세 페이지에 흩어진 숫자를 한 화면에서 훑을 수 있게 모은 것으로,
 * 값은 전부 계산 로직이 쓰는 상수에서 파생된다.
 */
export const HOME_COST_TABLE: readonly HomeCostRow[] = [
  {
    item: "취득세율 (비영업 승용차)",
    value: percent(ACQUISITION_TAX_RATES.passenger),
    note: `경차 ${percent(ACQUISITION_TAX_RATES.light)}, 승합·화물차 ${percent(
      ACQUISITION_TAX_RATES.van
    )}, 이륜차 ${percent(ACQUISITION_TAX_RATES.motorcycle)}`,
  },
  {
    item: "경차 취득세 감면 한도",
    value: manwon(LIGHT_CAR_TAX_EXEMPT_LIMIT),
    note: "한도까지 전액 면제되고 초과분만 납부합니다",
  },
  {
    item: "공채매입률 (서울·2,000cc 초과)",
    value: percent(BOND_PURCHASE_RATES.seoul.over2000.purchaseRate),
    note: `매입 직후 되팔면 할인율 ${percent(
      BOND_PURCHASE_RATES.seoul.over2000.discountRate
    )}만 실부담으로 남습니다`,
  },
  {
    item: "등록 부대비용",
    value: manwon(
      MISC_COSTS.stampDuty + MISC_COSTS.certificateStamp + MISC_COSTS.plateAgencyFee
    ),
    note: "인지대·증지대와 번호판 대행 수수료를 합친 금액입니다",
  },
  {
    item: "중고차 잔존가치율 (3년 / 5년)",
    value: `${percent(RESIDUAL_VALUE_RATES[3])} / ${percent(RESIDUAL_VALUE_RATES[5])}`,
    note: "중고차 취득세는 이 비율로 계산한 시가표준액에 매겨집니다",
  },
  {
    item: "연간 자동차세 (가솔린 기준)",
    value: manwon(maintenanceProfiles.gasoline.tax),
    note: `하이브리드 ${manwon(maintenanceProfiles.hybrid.tax)}, 전기차 ${manwon(
      maintenanceProfiles.ev.tax
    )}`,
  },
  {
    item: "전기차 국고보조금 상한",
    value: manwon(NATIONAL_SUBSIDY_MAX),
    note: "차량가 5,000만원 미만은 전액, 8,500만원까지는 절반만 지급됩니다",
  },
  {
    item: "전기차 전환지원금",
    value: manwon(CONVERSION_BONUS),
    note: "타던 내연기관차를 폐차하거나 매도하고 구매할 때 더해집니다",
  },
  {
    item: "청년 생애 첫 차 가산",
    value: `+${percent(YOUTH_BONUS_RATE)}`,
    note: "19~34세가 생애 첫 차로 전기차를 살 때 보조금에 가산됩니다",
  },
];

export interface HomeUsageNote {
  key: string;
  title: string;
  body: string;
}

/** 홈에서만 설명하는 서비스 운영 방식 */
export const HOME_USAGE_NOTES: readonly HomeUsageNote[] = [
  {
    key: "sourced",
    title: "숫자마다 근거를 답니다",
    body: "취득세율과 잔존가치율은 지방세법과 지자체 시가표준액 자료, 보조금은 환경부 보급사업 공고를 출처로 답니다. 결과를 그대로 믿지 말고 링크를 눌러 직접 확인해 보셔도 됩니다.",
  },
  {
    key: "dated",
    title: "기준일이 화면에 남습니다",
    body: "계산기마다 어느 시점의 고시를 반영했는지 배지로 표시합니다. 연식이나 세율이 바뀌는 항목이 많아, 오래된 숫자로 계산해 놓고 모르는 상황을 줄이기 위해서입니다.",
  },
  {
    key: "local",
    title: "차값을 서버로 보내지 않습니다",
    body: "견적 금액이나 보험료처럼 남에게 보이고 싶지 않은 숫자를 다루는 도구입니다. 계산은 전부 이 브라우저 안에서 끝나고, 저장되는 값도 없습니다.",
  },
];
