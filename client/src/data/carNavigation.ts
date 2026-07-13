export type CarToolKey =
  | "tax"
  | "insurance"
  | "lease-vs-loan"
  | "parking"
  | "maintenance"
  | "ev-vs-gas";

export interface CarToolLink {
  key: CarToolKey;
  path: string;
  navigationLabel: string;
  title: string;
  description: string;
}

export const CAR_TOOLS: readonly CarToolLink[] = [
  {
    key: "tax",
    path: "/tax",
    navigationLabel: "취등록세",
    title: "자동차 취득·등록세",
    description: "차량 가격과 차종을 기준으로 취득 단계의 세금과 비용을 계산합니다.",
  },
  {
    key: "insurance",
    path: "/insurance",
    navigationLabel: "보험 절약",
    title: "자동차 보험 절약",
    description: "현재 보험료와 할인 조건을 비교해 예상 절감액을 확인합니다.",
  },
  {
    key: "lease-vs-loan",
    path: "/lease-vs-loan",
    navigationLabel: "리스·할부·렌트",
    title: "리스·할부·렌트 비교",
    description: "구매 방식별 월 부담과 총비용을 같은 조건으로 비교합니다.",
  },
  {
    key: "parking",
    path: "/parking",
    navigationLabel: "주차비 비교",
    title: "주차비 비교",
    description: "주차 시간과 요금 조건에 따른 예상 비용을 비교합니다.",
  },
  {
    key: "maintenance",
    path: "/maintenance",
    navigationLabel: "유지비 계산",
    title: "차량 유지비 계산",
    description: "연료비와 정비비 등 보유 기간의 반복 비용을 계산합니다.",
  },
  {
    key: "ev-vs-gas",
    path: "/ev-vs-gas",
    navigationLabel: "전기차 비교",
    title: "전기차·내연기관차 비교",
    description: "구매비와 운행비를 합산해 차량 유형별 비용 차이를 비교합니다.",
  },
] as const;
