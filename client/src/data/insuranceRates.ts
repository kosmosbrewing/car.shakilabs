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
  {
    name: "삼성화재 다이렉트",
    url: "https://direct.samsungfire.com/promotion/direct_car.html",
    basis: "평균 18.8% 다이렉트 할인, 1만km 이하 15~23% 마일리지, 블랙박스 4% 안내",
  },
  {
    name: "KB손해보험 다이렉트",
    url: "https://direct.kbinsure.co.kr/home/app/views/common/DS03_COMN_4012M.html",
    basis: "평균 19.1% 다이렉트 할인, 마일리지·블랙박스 특약 공개 수치 참고",
  },
];
