import type { SourceReference } from "@/types/common";

export type VehicleType =
  | "passenger"
  | "passengerBiz"
  | "van"
  | "vanBiz"
  | "truck"
  | "special"
  | "light"
  | "motorcycle";
export type VehicleCondition = "new" | "used";
export type DisplacementRange =
  | "under1000"
  | "1000to1600"
  | "1600to2000"
  | "over2000";
export type Region = "seoul" | "gyeonggi" | "other";

export interface BondRate {
  purchaseRate: number;
  discountRate: number;
}

export const CAR_TAX_DATA_UPDATED = "2026-03-11";
export const CAR_TAX_DATA_VERIFIED = "2026-03-11";

export const ACQUISITION_TAX_RATES: Record<VehicleType, number> = {
  passenger: 0.07,
  passengerBiz: 0.05,
  van: 0.05,
  vanBiz: 0.04,
  truck: 0.05,
  special: 0.05,
  light: 0.04,
  motorcycle: 0.02,
};

export const RESIDUAL_VALUE_RATES: Record<number, number> = {
  1: 0.826,
  2: 0.681,
  3: 0.579,
  4: 0.485,
  5: 0.404,
  6: 0.334,
  7: 0.276,
  8: 0.228,
  9: 0.188,
  10: 0.155,
  11: 0.128,
  12: 0.105,
  13: 0.087,
  14: 0.072,
  15: 0.056,
};

export const BOND_PURCHASE_RATES: Record<Region, Record<DisplacementRange, BondRate>> = {
  seoul: {
    under1000: { purchaseRate: 0, discountRate: 0.05 },
    "1000to1600": { purchaseRate: 0, discountRate: 0.05 },
    "1600to2000": { purchaseRate: 0.09, discountRate: 0.05 },
    over2000: { purchaseRate: 0.2, discountRate: 0.05 },
  },
  gyeonggi: {
    under1000: { purchaseRate: 0, discountRate: 0.06 },
    "1000to1600": { purchaseRate: 0, discountRate: 0.06 },
    "1600to2000": { purchaseRate: 0.05, discountRate: 0.06 },
    over2000: { purchaseRate: 0.12, discountRate: 0.06 },
  },
  other: {
    under1000: { purchaseRate: 0, discountRate: 0.07 },
    "1000to1600": { purchaseRate: 0, discountRate: 0.07 },
    "1600to2000": { purchaseRate: 0.03, discountRate: 0.07 },
    over2000: { purchaseRate: 0.05, discountRate: 0.07 },
  },
};

export const MISC_COSTS = {
  stampDuty: 3_000,
  certificateStamp: 1_000,
  plateAgencyFee: 30_000,
} as const;

export const LIGHT_CAR_TAX_EXEMPT_LIMIT = 750_000;

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  passenger: "비영업 승용차",
  passengerBiz: "영업용 승용차",
  van: "비영업 승합차",
  vanBiz: "영업용 승합차",
  truck: "화물차",
  special: "특수차",
  light: "경차",
  motorcycle: "이륜차",
};

export const VEHICLE_CONDITION_LABELS: Record<VehicleCondition, string> = {
  new: "신차",
  used: "중고차",
};

export const REGION_LABELS: Record<Region, string> = {
  seoul: "서울",
  gyeonggi: "경기",
  other: "기타 지역",
};

export const DISPLACEMENT_LABELS: Record<DisplacementRange, string> = {
  under1000: "1,000cc 미만",
  "1000to1600": "1,000cc~1,600cc",
  "1600to2000": "1,600cc~2,000cc",
  over2000: "2,000cc 초과",
};

export const CAR_TAX_SOURCES: SourceReference[] = [
  {
    name: "국가법령정보 / 지방세법",
    url: "https://www.law.go.kr",
    basis: "취득세율 및 자동차 과세 기준",
  },
  {
    name: "찾기쉬운 생활법령정보",
    url: "https://www.easylaw.go.kr",
    basis: "경차·장애인 취득세 감면 안내",
  },
  {
    name: "강원특별자치도 차량 취득세 자료",
    url: "https://state.gwd.go.kr",
    basis: "중고차 시가표준액 잔존가치율표",
  },
];
