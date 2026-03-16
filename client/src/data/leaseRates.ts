import type { SourceReference } from "@/types/common";

export type FinanceMethod = "lease" | "loan" | "longTermRent";
export type DepositRateOption = 0 | 0.1 | 0.2 | 0.3;
export type TermMonths = 24 | 36 | 48 | 60;
export type ResidualRateOption = 0.3 | 0.4 | 0.5 | 0.6;

export const LEASE_DATA_UPDATED = "2026-03-11";
export const LEASE_DATA_VERIFIED = "2026-03-11";

export const DEFAULT_LEASE_RATE = 0.055;
export const DEFAULT_LOAN_RATE = 0.05;
export const DEFAULT_ANNUAL_INSURANCE = 800_000;
export const DEFAULT_RENT_MANAGEMENT_RATE = 0.15;

export const FINANCE_METHOD_LABELS: Record<FinanceMethod, string> = {
  lease: "리스",
  loan: "할부",
  longTermRent: "장기렌트",
};

export const DEPOSIT_RATE_LABELS: Record<DepositRateOption, string> = {
  0: "0%",
  0.1: "10%",
  0.2: "20%",
  0.3: "30%",
};

export const TERM_MONTH_LABELS: Record<TermMonths, string> = {
  24: "24개월",
  36: "36개월",
  48: "48개월",
  60: "60개월",
};

export const RESIDUAL_RATE_LABELS: Record<ResidualRateOption, string> = {
  0.3: "30%",
  0.4: "40%",
  0.5: "50%",
  0.6: "60%",
};

export const LEASE_SOURCES: SourceReference[] = [
  {
    name: "현대캐피탈",
    url: "https://www.hyundaicapital.com/cpi/nc/CPINC0301_01.hc",
    basis: "2026년 3월 신차할부 36개월 5.0%, 48개월 5.1%, 60개월 5.2% 기준",
  },
  {
    name: "현대캐피탈 렌트(소유형)",
    url: "https://www.hyundaicapital.com/nwcafn/svrtlc/CPNCSLC0101.hc",
    basis: "취득세·자동차세·공채 비용 포함, 보험은 현대캐피탈 요율 안내",
  },
];
