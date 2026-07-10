export const CAR_SERVICE_UPDATED_AT = "2026-03-16";

export const maintenanceProfiles = {
  gasoline: { label: "가솔린", oilIntervalKm: 10_000, oilCost: 110_000, tireCost: 700_000, wearPerKm: 22, tax: 520_000 },
  hybrid: { label: "하이브리드", oilIntervalKm: 12_000, oilCost: 120_000, tireCost: 720_000, wearPerKm: 19, tax: 420_000 },
  ev: { label: "전기차", oilIntervalKm: 20_000, oilCost: 40_000, tireCost: 760_000, wearPerKm: 15, tax: 130_000 },
} as const;

// ── 2026 전기차 보조금 상수 ──────────────────────────────
// 근거: 환경부 2026년 전기차 보급 사업 공고 (2025.12.31)
export const EV_SUBSIDY_UPDATED = "2026-07-10";

export const EV_SUBSIDY_SOURCE_URL = "https://www.ev.or.kr/nportal/buySupprt/initBuySubsidySupprtAction.do";

/** 국고보조금 최대 (성능보조금) */
export const NATIONAL_SUBSIDY_MAX = 5_800_000;

/** 전환지원금 (내연차 폐차·매도 후 전기차 구매) */
export const CONVERSION_BONUS = 1_000_000;

/** 청년 가산 비율 (19~34세, 생애 첫 차) */
export const YOUTH_BONUS_RATE = 0.2;

/** 차량 가격 구간별 보조금 지급률 */
export const PRICE_TIERS = [
  { maxPrice: 50_000_000, rate: 1.0, label: "5,000만원 미만 — 100%" },
  { maxPrice: 85_000_000, rate: 0.5, label: "5,000~8,500만원 — 50%" },
  { maxPrice: Infinity, rate: 0, label: "8,500만원 이상 — 미지원" },
] as const;

/** 인기 차종별 국고보조금 (2026년 확정 고시 기준, 만원) */
export const MODEL_PRESETS = [
  { label: "현대 아이오닉 6 2WD 롱레인지 18인치", subsidy: 5_700_000 },
  { label: "현대 아이오닉 5 2WD 롱레인지 19인치", subsidy: 5_640_000 },
  { label: "기아 EV6 2WD 롱레인지 19인치", subsidy: 5_700_000 },
  { label: "기아 EV3 롱레인지 2WD 17인치", subsidy: 5_550_000 },
  { label: "현대 캐스퍼 일렉트릭 롱레인지", subsidy: 4_900_000 },
  { label: "기아 EV9 롱레인지 2WD 19인치", subsidy: 2_700_000 },
  { label: "KGM 토레스 EVX 18인치 (2026)", subsidy: 3_610_000 },
  { label: "테슬라 모델 3 프리미엄 롱레인지 RWD", subsidy: 2_100_000 },
  { label: "테슬라 모델 Y 프리미엄 롱레인지", subsidy: 2_100_000 },
  { label: "직접 입력", subsidy: 0 },
] as const;

/** 지자체 보조금 (2026 확정 기준, 만원 단위 → 원) */
export const REGIONAL_SUBSIDIES = [
  { key: "seoul", label: "서울특별시", subsidy: 1_940_000 },
  { key: "busan", label: "부산광역시", subsidy: 1_940_000 },
  { key: "daegu", label: "대구광역시", subsidy: 1_940_000 },
  { key: "incheon", label: "인천광역시", subsidy: 1_940_000 },
  { key: "gwangju", label: "광주광역시", subsidy: 1_940_000 },
  { key: "daejeon", label: "대전광역시", subsidy: 1_940_000 },
  { key: "ulsan", label: "울산광역시", subsidy: 2_210_000 },
  { key: "sejong", label: "세종특별자치시", subsidy: 1_940_000 },
  { key: "gyeonggi", label: "경기도 (194~615만원 중 최소)", subsidy: 1_940_000 },
  { key: "gangwon", label: "강원특별자치도", subsidy: 3_240_000 },
  { key: "chungbuk", label: "충청북도", subsidy: 6_480_000 },
  { key: "chungnam", label: "충청남도", subsidy: 6_000_000 },
  { key: "jeonbuk", label: "전북특별자치도", subsidy: 7_030_000 },
  { key: "jeonnam", label: "전라남도 (324~972만원 중 최소)", subsidy: 3_240_000 },
  { key: "gyeongbuk", label: "경상북도 (667~1,224만원 중 최소)", subsidy: 6_670_000 },
  { key: "gyeongnam", label: "경상남도 (194~715만원 중 최소)", subsidy: 1_940_000 },
  { key: "jeju", label: "제주특별자치도", subsidy: 4_470_000 },
] as const;

export type RegionKey = (typeof REGIONAL_SUBSIDIES)[number]["key"];

/** FAQ 항목 */
export const EV_SUBSIDY_FAQS = [
  {
    q: "2026년 전기차 국고보조금은 얼마인가요?",
    a: "2026년 전기승용차 국고보조금은 차량 성능(주행거리, 에너지 효율, 배터리)에 따라 차등 지급되며, 최대 580만원입니다. 여기에 내연차 전환지원금 최대 100만원이 추가되어 총 최대 680만원까지 받을 수 있습니다.",
  },
  {
    q: "차량 가격에 따라 보조금이 달라지나요?",
    a: "네. 출고가 5,000만원 미만이면 보조금 100% 지급, 5,000~8,500만원이면 50%만 지급, 8,500만원 이상은 보조금 대상에서 제외됩니다. 2026년부터 기준이 5,300만원에서 5,000만원으로 하향 조정되었습니다.",
  },
  {
    q: "전환지원금은 어떤 조건에서 받을 수 있나요?",
    a: "출고 후 3년 이상 경과한 내연기관차(하이브리드 제외)를 폐차하거나 매도한 후 전기차 신차를 구매하면 최대 100만원의 전환지원금을 추가로 받을 수 있습니다.",
  },
  {
    q: "청년 가산은 어떻게 적용되나요?",
    a: "만 19~34세이며 생애 최초로 차량을 구매하는 경우, 국고보조금의 20%를 추가로 가산받습니다. 예를 들어 국고보조금이 300만원이면 60만원이 추가되어 360만원을 받게 됩니다.",
  },
] as const;
