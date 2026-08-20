import type { SourceReference } from "@/types/common";

export type MileageRange = "3000" | "5000" | "7000" | "10000" | "15000" | "20000";
export type DeductibleLevel =
  | "200000"
  | "300000"
  | "500000"
  | "1000000"
  | "2000000";

export interface ExperienceDiscount {
  minYears: number;
  maxYears: number;
  discountRate: number;
}

export const INSURANCE_DATA_UPDATED = "2026-03-11";
export const INSURANCE_DATA_VERIFIED = "2026-03-11";

export const EXPERIENCE_DISCOUNTS: ExperienceDiscount[] = [
  { minYears: 1, maxYears: 1, discountRate: 0.05 },
  { minYears: 2, maxYears: 2, discountRate: 0.08 },
  { minYears: 3, maxYears: 4, discountRate: 0.12 },
  { minYears: 5, maxYears: 6, discountRate: 0.22 },
  { minYears: 7, maxYears: 9, discountRate: 0.27 },
  { minYears: 10, maxYears: 14, discountRate: 0.3 },
  { minYears: 15, maxYears: 19, discountRate: 0.33 },
  { minYears: 20, maxYears: 99, discountRate: 0.35 },
];

export const ACCIDENT_SURCHARGES: Record<number, number> = {
  0: 0,
  1: 0.1,
  2: 0.3,
  3: 0.5,
};

export const MILEAGE_DISCOUNTS: Record<MileageRange, number> = {
  "3000": 0.17,
  "5000": 0.14,
  "7000": 0.1,
  "10000": 0.07,
  "15000": 0.03,
  "20000": 0,
};

export const BLACKBOX_DISCOUNT = 0.04;

/**
 * 블랙박스 할인을 적용하는 차량 연식 상한(년).
 * 이 값을 넘으면 보수적으로 할인에서 제외한다.
 * 계산 로직·안내 문구·FAQ가 모두 이 상수를 참조해야 한쪽만 낡지 않는다.
 */
export const BLACKBOX_DISCOUNT_MAX_VEHICLE_AGE = 12;

export const DEDUCTIBLE_DISCOUNTS: Record<DeductibleLevel, number> = {
  "200000": 0,
  "300000": 0.02,
  "500000": 0.05,
  "1000000": 0.1,
  "2000000": 0.12,
};

export const DIRECT_DISCOUNT_RATE = 0.19;

export const MILEAGE_LABELS: Record<MileageRange, string> = {
  "3000": "3,000km 이하",
  "5000": "5,000km 이하",
  "7000": "7,000km 이하",
  "10000": "10,000km 이하",
  "15000": "15,000km 이하",
  "20000": "20,000km 이하",
};

export const DEDUCTIBLE_LABELS: Record<DeductibleLevel, string> = {
  "200000": "20만원",
  "300000": "30만원",
  "500000": "50만원",
  "1000000": "100만원",
  "2000000": "200만원",
};

export const INSURANCE_SOURCES: SourceReference[] = [
  {
    name: "보험개발원",
    url: "https://www.kidi.or.kr",
    basis: "자동차보험 할인·할증 제도 참고",
  },
  // 기존 링크(/promotion/direct_car.html)는 404가 됐다. 출처가 깨지면 근거가 아니라 역효과다.
  // 인용 수치가 실제로 적혀 있는 현행 페이지로 나눠 교체했다 (2026-08-11 무쿠키 GET 200 확인).
  {
    name: "삼성화재 다이렉트 — 블랙박스 특약 할인",
    url: "https://direct.samsungfire.com/mall/PP030103_001.html",
    basis: "자사 오프라인 대비 평균 18.8% 저렴, 블랙박스 장착 시 4% 특약 할인 명시",
  },
  {
    name: "삼성화재 다이렉트 — 마일리지 특약 할인",
    url: "https://direct.samsungfire.com/mall/PP030102_001.html",
    basis: "연간 1천~1만5천km 주행거리 구간별 마일리지 특약 할인 구간표",
  },
  {
    name: "KB손해보험 다이렉트",
    url: "https://direct.kbinsure.co.kr/home/app/views/common/DS03_COMN_4012M.html",
    basis: "평균 19.1% 다이렉트 할인, 마일리지·블랙박스 특약 공개 수치 참고",
  },
];
