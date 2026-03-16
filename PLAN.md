# 05.car — car.shakilabs.com 구현 계획서

> 작성일: 2026-03-11
> 서브도메인: car.shakilabs.com
> 테마: teal-600 (#0D9488)
> DEV_PORT: 6106
> 기준 프로젝트: 03.seller/client/ 복사

---

## Context

PLAN.md P1 항목 — car.shakilabs.com 신규 프론트엔드 프로젝트 구축.
자동차 구매·보험·이용방식 비용을 비교하는 계산기 3개 탭 서비스.
03.seller/client/ 보일러플레이트 복사 후 도메인 로직만 교체하는 방식.

---

## 탭 구성 (3개)

| 경로 | 이름 | 설명 |
|------|------|------|
| `/tax` | 자동차 취등록세 계산기 | 신차·중고차 취등록세 + 공채 + 부대비용 |
| `/insurance` | 보험 갱신 절약 시뮬레이터 | 할인 특약별 절약 금액 추정 |
| `/lease-vs-loan` | 리스 vs 할부 vs 렌트 비교 | 3가지 이용방식 총비용 비교 |

기본 랜딩: `/` → `/tax` 리다이렉트 (가장 범용적)

---

## 웹 검색 필요 항목 (구현 전 확인)

> 아래 항목은 법령·고시·보험사 기준으로 정확한 수치 확인이 필요합니다.
> 구현 시 검색 후 `src/data/` 상수에 반영하세요.

### TAX (취등록세) — 10개

| # | 검색 주제 | 검색 키워드 | 현재 추정값 | 반영 파일 |
|---|----------|------------|------------|----------|
| T1 | 중고차 잔존가치율 표 (경과년수별) | `지방세법 시행령 별표 잔존가치율 2026` `중고차 취등록세 잔가율표` | 1년 0.826, 2년 0.681, … 15년 0.056 | `carTaxRates.ts` |
| T2 | 서울시 공채매입 비율 (배기량별) | `서울시 공채매입 비율 2026` `자동차 등록 지역개발공채 서울` | 2000cc↑ 20%, 1600~2000 9%, ~1600 면제 | `carTaxRates.ts` |
| T3 | 경기도 공채매입 비율 | `경기도 공채매입 비율 자동차 등록` | 2000cc↑ 12%, 1600~2000 5%, ~1600 면제 | `carTaxRates.ts` |
| T4 | 기타 지역 공채매입 비율 | `지방 공채매입 비율 자동차 등록 2025 2026` | 2000cc↑ 5%, 나머지 0~3% | `carTaxRates.ts` |
| T5 | 공채 할인매각율 (시세) | `지역개발공채 할인율 현재 시세` `공채 할인매각 손실률` | 서울 5%, 경기 6%, 기타 7% | `carTaxRates.ts` |
| T6 | 경차 취득세 면제 한도 및 유효기간 | `조세특례제한법 75조 경차 취득세 면제 2026` | 75만원 한도 면제, 2026년까지 유효 | `carTaxRates.ts` |
| T7 | 장애인 자동차 취득세 면제 조건 | `장애인 자동차 취득세 면제 조건 2026 배기량` | 2000cc 이하 승용 또는 전기차 면제 | `carTaxRates.ts` |
| T8 | 이륜차 취득세율 | `이륜차 오토바이 취득세율` | 2% | `carTaxRates.ts` |
| T9 | 인지세·증지대 금액 | `자동차 등록 인지세 증지대 2026` | 인지세 3,000원, 증지대 1,000원 | `carTaxRates.ts` |
| T10 | 번호판 대행 수수료 시세 | `자동차 번호판 대행 수수료 2026` | 약 30,000원 | `carTaxRates.ts` |

### INSURANCE (보험 절약) — 6개

| # | 검색 주제 | 검색 키워드 | 현재 추정값 | 반영 파일 |
|---|----------|------------|------------|----------|
| I1 | 무사고 할인 요율 (경력별) | `자동차보험 무사고 할인율 경력별 2026` `보험개발원 경력요율` | 1년 -5% ~ 20년+ -35% | `insuranceRates.ts` |
| I2 | 사고 할증 요율 (건수별) | `자동차보험 사고할증 요율 2026` `사고건수별 보험료 할증` | 1건 +10%, 2건 +30%, 3건 +50% | `insuranceRates.ts` |
| I3 | 마일리지 특약 할인율 (구간별) | `마일리지 특약 할인율 주행거리별 2026` `KB 삼성 마일리지보험` | 3천km -17% ~ 2만km 0% | `insuranceRates.ts` |
| I4 | 블랙박스 할인율 | `자동차보험 블랙박스 할인율 2026` | 약 2~3% | `insuranceRates.ts` |
| I5 | 자기부담금별 보험료 할인율 | `자동차보험 자기부담금 높이면 할인 비율` | 20만 기본, 50만 +5%, 100만 +10% | `insuranceRates.ts` |
| I6 | 다이렉트 보험 전환 평균 절약 비율 | `다이렉트 자동차보험 절약 비율 2026` `온라인 보험 할인` | 약 15~20% (중앙값 17%) | `insuranceRates.ts` |

### LEASE (리스 vs 할부 vs 렌트) — 3개

| # | 검색 주제 | 검색 키워드 | 현재 추정값 | 반영 파일 |
|---|----------|------------|------------|----------|
| L1 | 현재 자동차 리스 평균 금리 | `자동차 리스 금리 2026` `캐피탈 리스 이자율` | 기본값 5.5% | `leaseRates.ts` |
| L2 | 현재 자동차 할부 평균 금리 | `자동차 할부 금리 2026` `캐피탈 할부 이자율` | 기본값 6.5% | `leaseRates.ts` |
| L3 | 장기렌트 월납입금 산정 기준 | `장기렌트 월납입금 계산 방식` `렌트 관리비 비율` | 관리비 약 15% 포함 추정 | `leaseRates.ts` |

**총 19개 검색 항목** — 구현 Phase 1(데이터 레이어) 시작 전에 검색 완료 권장.

---

## 구현 Phase 별 계획

### Phase 0: 프로젝트 스캐폴딩

**03.seller/client/ → 05.car/client/ 복사 후 설정 변경**

#### 그대로 복사 (수정 없음, ~30개 파일)
```
src/lib/analytics.ts, api.ts, apiCache.ts, routeState.ts, utils.ts, kakaoSdk.ts, buildMeta.ts
src/composables/useAlert.ts, useSEO.ts, useModal.ts, useShare.ts, usePageShare.ts
src/stores/auth.ts, constants.ts
src/types/api.ts
src/components/ui/* (alert, button, card, loading, accordion, badge, table)
src/components/common/SEOHead.vue, FreshBadge.vue, TickerBar.vue, WittyState.vue,
  SummaryBanner.vue, AdSlot.vue, CompareHint.vue, CompareSourceFooter.vue,
  CopyTableButton.vue, SectionShareButton.vue
src/components/share/ShareModal.vue
tsconfig.json, src/vite-env.d.ts
public/fonts/*
scripts/build.mjs
```

#### 수정 대상 (8개 파일)

| 파일 | 수정 내용 |
|------|-----------|
| `package.json` | `name: "car-calculator"` |
| `vite.config.ts` | `__APP_ID__: "car-calculator"`, `port: 6106`, SSG routes 변경 |
| `tailwind.config.ts` | seller 브랜드 컬러 제거, teal 계열로 교체 |
| `vercel.json` | `05.car/client` 경로 |
| `index.html` | teal CSS 변수, OG 태그, title, theme-color |
| `src/lib/site.ts` | `DEFAULT_SITE_URL = "https://car.shakilabs.com"` |
| `src/main.ts` | constants fallback 수정 |
| `src/assets/css/main.css` | seller 전용 스타일 제거 |

#### index.html CSS 변수 (teal-600)
```css
:root {
  --primary: 175 84% 32%;
  --primary-foreground: 0 0% 100%;
  --ring: 175 84% 32%;
}
.dark {
  --primary: 172 66% 50%;
  --primary-foreground: 175 80% 10%;
  --ring: 172 66% 50%;
}
```

#### seller 전용 삭제 대상
- `src/data/marketFees.ts`, `paymentGateways.ts`, `shippingRates.ts` 등 seller 데이터 전체
- `src/components/compare/` 디렉토리 (seller 전용 비교 컴포넌트)
- `src/composables/useMarketFeeCalc.ts`, `useHeadlineMessages.ts`
- `src/views/HomeView.vue`, `OpenMarketCompareView.vue` 등 seller 뷰 전체

---

### Phase 1: 데이터 레이어

> ⚠️ 이 단계 시작 전에 위 검색 항목 19개 확인 완료할 것

#### 생성 파일 8개

**1. `src/data/carTaxRates.ts`** — 취등록세 상수
```typescript
// 타입 정의
export type VehicleType = "passenger" | "passengerBiz" | "van" | "vanBiz" | "truck" | "special" | "light" | "motorcycle";
export type VehicleCondition = "new" | "used";
export type DisplacementRange = "under1000" | "1000to1600" | "1600to2000" | "over2000";
export type Region = "seoul" | "gyeonggi" | "other";

// 취득세율 표
export const ACQUISITION_TAX_RATES: Record<VehicleType, number>;

// T1: 중고차 잔존가치율 (연식 1~15년)
export const RESIDUAL_VALUE_RATES: Record<number, number>;

// T2~T4: 공채매입 비율 (지역별 × 배기량별)
export const BOND_PURCHASE_RATES: Record<Region, Record<DisplacementRange, BondRate>>;

// T9~T10: 부대비용
export const MISC_COSTS: { stampDuty, certificateStamp, plateAgencyFee };

// T6: 경차 면제한도
export const LIGHT_CAR_TAX_EXEMPT_LIMIT = 750_000;

// 차종·지역 UI 라벨 매핑
export const VEHICLE_TYPE_LABELS: Record<VehicleType, string>;
export const REGION_LABELS: Record<Region, string>;
export const DISPLACEMENT_LABELS: Record<DisplacementRange, string>;
```

**2. `src/data/insuranceRates.ts`** — 보험 요율 상수
```typescript
export type MileageRange = "3000" | "5000" | "7000" | "10000" | "15000" | "20000";
export type DeductibleLevel = "200000" | "300000" | "500000" | "1000000" | "2000000";

// I1: 무사고 경력 할인
export const EXPERIENCE_DISCOUNTS: ExperienceDiscount[];
// I2: 사고 할증
export const ACCIDENT_SURCHARGES: Record<number, number>;
// I3: 마일리지 할인
export const MILEAGE_DISCOUNTS: Record<MileageRange, number>;
// I4: 블랙박스 할인
export const BLACKBOX_DISCOUNT: number;
// I5: 자기부담금 할인
export const DEDUCTIBLE_DISCOUNTS: Record<DeductibleLevel, number>;
// I6: 다이렉트 전환 할인
export const DIRECT_DISCOUNT_RATE: number;

export const INSURANCE_DATA_UPDATED = "2026-03-11";
```

**3. `src/data/leaseRates.ts`** — 리스/할부/렌트 상수
```typescript
export type FinanceMethod = "lease" | "loan" | "longTermRent";
export type DepositRateOption = 0 | 0.1 | 0.2 | 0.3;
export type TermMonths = 24 | 36 | 48 | 60;
export type ResidualRateOption = 0.3 | 0.4 | 0.5 | 0.6;

// L1~L2: 기본 금리
export const DEFAULT_LEASE_RATE = 0.055;
export const DEFAULT_LOAN_RATE = 0.065;
export const DEFAULT_ANNUAL_INSURANCE = 800_000;
```

**4. `src/data/pricePresets.ts`** — 빠른 선택 버튼 프리셋
```typescript
export const TAX_PRICE_PRESETS = [2000만, 3000만, 5000만, 8000만];
export const INSURANCE_PRESETS = [30만, 50만, 70만, 100만];
export const LEASE_PRICE_PRESETS = [3000만, 5000만, 7000만, 1억];
```

**5. `src/data/tickerMessages.ts`** — 롤링 배너
```typescript
export const tickerMessages: readonly string[] = [
  "같은 차인데 등록 지역만 바꿔도 수십만 원 차이가 납니다",
  "중고차 취등록세, 연식에 따라 잔가율이 크게 줄어듭니다",
  "경차는 취득세 75만원까지 면제 — 모르면 손해입니다",
  "보험 갱신 전 마일리지 특약만 추가해도 최대 17% 절약",
  "리스 vs 할부 vs 렌트, 총비용으로 비교하면 답이 달라집니다",
  "다이렉트 보험 전환만으로 약 15~20% 보험료 절약 가능",
  "자기부담금을 올리면 보험료가 확 줄어듭니다",
  "무사고 10년이면 보험료 30% 할인 — 경력이 곧 돈입니다",
];
```

**6. `src/utils/calculator.ts`** — 핵심 계산 엔진 (순수 함수)
```typescript
// 탭 1
export function calcCarTax(input: CarTaxInput): CarTaxBreakdown;

// 탭 2
export function calcInsurance(input: InsuranceInput): InsuranceBreakdown;

// 탭 3
export function calcLeaseCompare(input: LeaseCompareInput): LeaseCompareResult;
export function calcLease(input: LeaseCompareInput): FinanceResult;
export function calcLoan(input: LeaseCompareInput): FinanceResult;
export function calcLongTermRent(input: LeaseCompareInput): FinanceResult;
export function calcEqualPayment(principal: number, annualRate: number, months: number): number;
```

200줄 초과 시 → `calculator-tax.ts`, `calculator-insurance.ts`, `calculator-lease.ts` 분리.

**7. `src/utils/calculator.test.ts`** — vitest 테스트 15개 (아래 §테스트 참조)

**8. `src/lib/validators.ts`** — Zod 스키마
```typescript
export const carTaxInputSchema = z.object({ ... });
export const insuranceInputSchema = z.object({ ... });
export const leaseCompareInputSchema = z.object({ ... });
export function sanitizeCarTaxInput(input): CarTaxInput;
export function sanitizeInsuranceInput(input): InsuranceInput;
export function sanitizeLeaseCompareInput(input): LeaseCompareInput;
```

---

### Phase 2: 레이아웃 + 라우터

#### 수정/생성 파일 5개

**1. `src/components/layout/AppHeader.vue`** — 로고 "CAR", 테마키 `car:theme:v1`
**2. `src/components/layout/AppFooter.vue`** — `car.shakilabs.com`
**3. `src/components/layout/AppLayout.vue`** — teal 그라디언트
**4. `src/components/common/TabNavigation.vue`** — 3개 탭:
```typescript
const tabs = [
  { path: "/tax", label: "취등록세", icon: Receipt },
  { path: "/insurance", label: "보험 절약", icon: Shield },
  { path: "/lease-vs-loan", label: "리스·할부·렌트", icon: Car },
];
```
**5. `src/router/index.ts`** — 라우트 정의 (lazy-load, SSG routes 포함)

---

### Phase 3: 탭 1 — 취등록세 계산기

#### 생성 파일 6개

**1. `src/composables/useCarTaxCalc.ts`**
- reactive 입력값 + URL 동기화 (routeState)
- computed 결과 → `calcCarTax()` 호출
- 기본값: 승용차, 신차, 3000만원, 서울, 1600~2000cc

**2. `src/components/car-tax/CarTaxInput.vue`**
- 차량 가격 (retro-input + 프리셋 4개)
- 차종 (retro-radio 8개)
- 신차/중고차 (retro-radio 2개)
- [조건부] 중고차 연식 (select 1~15년)
- 배기량 구간 (retro-radio 4개)
- 지역 (retro-radio 3개)
- 감면 옵션 (retro-checkbox)

**3. `src/components/car-tax/CarTaxResult.vue`**
- retro-stat-grid 4칸: 취득세, 공채비, 부대비용, 총비용
- 양수/음수 color 처리

**4. `src/components/car-tax/CarTaxBreakdown.vue`**
- 항목별 상세 테이블 (TaxItem[] 렌더링)

**5. `src/components/car-tax/CarTaxFAQ.vue`**
- Accordion 5개 (Q&A)

**6. `src/views/CarTaxView.vue`**
```
SEOHead → retro-panel(입력) → SummaryBanner → retro-panel(결과) → AdSlot → FAQ
```

---

### Phase 4: 탭 2 — 보험 절약 시뮬레이터

#### 생성 파일 5개

**1. `src/composables/useInsuranceCalc.ts`**
- 기본값: 현재 70만원, 5년 경력, 무사고, 1만km, 자기부담금 20만

**2. `src/components/insurance/InsuranceInput.vue`**
- 현재 보험료 (retro-input + 프리셋 4개)
- 보험 가입 경력 (select 1~20년)
- 최근 3년 사고 (retro-radio 0~3건)
- 마일리지 특약 (retro-radio 6개)
- 블랙박스 (retro-checkbox)
- 차량 연식 (select)
- 자기부담금 (retro-radio 5개)

**3. `src/components/insurance/InsuranceResult.vue`**
- retro-stat-grid: 현재 보험료, 예상 보험료, 절약액, 다이렉트 추가 절약
- 할인/할증 항목 테이블 (SavingItem[] 렌더링)
- 다이렉트 전환 카드 (별도 강조)

**4. `src/components/insurance/InsuranceFAQ.vue`**
- Accordion 4개

**5. `src/views/InsuranceView.vue`**
```
SEOHead → retro-panel(입력) → SummaryBanner → retro-panel(결과) → CompareSourceFooter → AdSlot → FAQ
```

---

### Phase 5: 탭 3 — 리스 vs 할부 vs 렌트 비교

#### 생성 파일 6개

**1. `src/composables/useLeaseCompare.ts`**
- 기본값: 5000만원, 선수금 20%, 36개월, 잔존가치 40%
- computed → `calcLeaseCompare()` 호출

**2. `src/components/lease/LeaseCompareInput.vue`**
- 차량 가격 + 프리셋 4개
- 선수금 비율 (retro-radio 4개)
- 이용기간 (retro-radio 4개)
- 잔존가치율 (retro-radio 4개)
- retro-details(상세 설정): 리스 금리, 할부 금리, 렌트 월납입, 연간 보험료, 취등록세율

**3. `src/components/lease/LeaseCompareCards.vue`** — 모바일 카드 리스트
- `div.space-y-3.md:hidden`
- 3개 카드 (리스/할부/렌트), 1위 border-profit 강조
- 각 카드: 월 납입, 총비용, 포함 항목 표시

**4. `src/components/lease/LeaseCompareTable.vue`** — 데스크톱 테이블
- `div.hidden.md:block`
- 3열 비교 (CopyTableButton 포함)
- 행: 월 납입금, 선수금, 총 납입금, 보험료, 취등록세, 총비용, 소유권
- 1위 열 highlight

**5. `src/components/lease/LeaseGuide.vue`** — "나에게 맞는 방식" 가이드
- Accordion 4개:
  - 소유가 중요하면 → 할부
  - 초기 부담 줄이려면 → 리스
  - 관리 귀찮으면 → 장기렌트
  - 법인/사업자라면 → 리스 (비용처리)

**6. `src/views/LeaseVsLoanView.vue`**
```
SEOHead → retro-panel(입력) → SummaryBanner → Dual Layout(Cards+Table) → LeaseGuide → CompareSourceFooter → AdSlot
```

---

### Phase 6: 유틸리티 + SEO + 마무리

#### 생성/수정 파일
- `src/views/AboutView.vue` — car 서비스 안내
- `src/views/TermsView.vue` — 이용약관 (seller 복사 + 도메인 변경)
- `src/views/PrivacyView.vue` — 개인정보처리방침 (seller 복사 + 도메인 변경)
- `src/views/NotFoundView.vue` — 404 (seller 복사)
- `public/robots.txt`
- `public/sitemap.xml` (6개 경로)
- `.env.example`

---

### Phase 7: 검증

```bash
cd 05.car/client
npm install
npm run typecheck    # 타입 에러 0
npm run test         # vitest 전부 통과
npm run build        # 빌드 에러/경고 0
```

3번 실패 시 중단 + 리포트.

---

## SEO 메타데이터

| 페이지 | title (60자 이내) | description (155자 이내) |
|--------|-------------------|--------------------------|
| `/tax` | 자동차 취등록세 계산기 — 신차·중고차 총비용 \| shakilabs | 신차·중고차 취등록세, 공채매입비, 부대비용을 한번에 계산합니다. 차종·지역·연식별 정확한 비용을 무료로 확인하세요. |
| `/insurance` | 자동차보험 갱신 절약 시뮬레이터 — 할인 항목별 절감액 \| shakilabs | 마일리지, 블랙박스, 자기부담금 등 할인 특약별 절약 금액을 한눈에 비교합니다. |
| `/lease-vs-loan` | 리스 vs 할부 vs 장기렌트 비교 — 총비용으로 비교 \| shakilabs | 같은 차를 리스·할부·장기렌트로 이용할 때 월 납입금과 총비용 차이를 한눈에 비교합니다. |

**index.html OG:**
```html
<title>자동차 비교 계산기 — 취등록세·보험·리스 vs 할부 | shakilabs</title>
<meta property="og:title" content="자동차 비교 계산기 — 취등록세·보험·리스 vs 할부 | shakilabs" />
<meta name="theme-color" content="#0D9488" />
```

---

## 테스트 계획 (15개)

### 취등록세 (5개)
1. 비영업 승용 신차 3000만원 → 취득세 = 210만원
2. 경차 1500만원 → 취득세 60만원 < 75만원 면제한도 → 0원
3. 중고차 5년 → 과세표준 = 가격 × 0.382
4. 서울 2000cc↑ → 공채매입 20%
5. 장애인 감면 → 취득세 0원

### 보험 절약 (5개)
6. 5년 경력 무사고 → 할인 22%
7. 사고 2건 → 할증 30%
8. 마일리지 3천km + 블랙박스 복합 할인
9. 자기부담금 100만원 → 할인 10%
10. 다이렉트 전환 → 추가 17% 절약

### 리스·할부·렌트 (5개)
11. 원리금균등상환 PMT 공식 정확성 (5000만 6.5% 36개월)
12. 리스 월납입금 계산 (5000만, 20% 선수금, 40% 잔가, 36개월)
13. 렌트 총비용에 보험·취등록세 별도 미포함 확인
14. 3개 방식 비교 시 bestMethod 판별 정확성
15. 엣지 케이스: 차량가 최소값

---

## 파일 수 요약

| 구분 | 파일 수 |
|------|--------|
| 복사 (변경 없음) | ~30개 |
| 수정 (설정/레이아웃) | ~12개 |
| 새로 작성 | ~25개 |
| **합계** | **~67개** |

---

## 수동 확인 필요 항목 (구현 완료 후)

- [ ] 검색 항목 19개 데이터 정확성 교차 검증
- [ ] 모바일 375px 실기기 확인
- [ ] 다크모드 전환 시 teal 컬러 가독성
- [ ] Vercel 배포 + car.shakilabs.com 도메인 연결
- [ ] OG 이미지 생성 (1200×630)
- [ ] sitemap.xml GSC 등록
