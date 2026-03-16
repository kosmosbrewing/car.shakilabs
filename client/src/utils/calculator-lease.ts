import { FINANCE_METHOD_LABELS } from "@/data/leaseRates";
import type {
  FinanceResult,
  LeaseCompareInput,
  LeaseCompareResult,
} from "./calculator-types";
import { roundWon } from "./calculator-helpers";

function annualInsuranceForTerm(annualInsurance: number, termMonths: number): number {
  return roundWon((annualInsurance / 12) * termMonths);
}

export function calcEqualPayment(principal: number, annualRate: number, months: number): number {
  if (months <= 0) return 0;
  if (principal <= 0) return 0;
  if (annualRate <= 0) {
    return principal / months;
  }

  const monthlyRate = annualRate / 12;
  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * factor) / (factor - 1);
}

export function calcLease(input: LeaseCompareInput): FinanceResult {
  const deposit = roundWon(input.vehiclePrice * input.depositRate);
  const residualValue = roundWon(input.vehiclePrice * input.residualRate);
  const financedAmount = Math.max(0, input.vehiclePrice - deposit - residualValue);
  const monthlyPayment = roundWon(calcEqualPayment(financedAmount, input.leaseRate, input.termMonths));
  const totalInstallment = monthlyPayment * input.termMonths;
  const insuranceCost = annualInsuranceForTerm(input.annualInsurance, input.termMonths);
  const taxCost = roundWon(input.vehiclePrice * input.acquisitionTaxRate);

  return {
    method: "lease",
    label: FINANCE_METHOD_LABELS.lease,
    monthlyPayment,
    deposit,
    totalInstallment,
    insuranceCost,
    taxCost,
    residualValue,
    totalCost: deposit + totalInstallment + insuranceCost + taxCost,
    ownership: "반납 또는 잔존가치 인수",
    comparisonNote: "만기 반납 기준 · 잔존가치 인수비용 제외",
    includesInsurance: false,
    includesTax: false,
  };
}

export function calcLoan(input: LeaseCompareInput): FinanceResult {
  const deposit = roundWon(input.vehiclePrice * input.depositRate);
  const financedAmount = Math.max(0, input.vehiclePrice - deposit);
  const monthlyPayment = roundWon(calcEqualPayment(financedAmount, input.loanRate, input.termMonths));
  const totalInstallment = monthlyPayment * input.termMonths;
  const insuranceCost = annualInsuranceForTerm(input.annualInsurance, input.termMonths);
  const taxCost = roundWon(input.vehiclePrice * input.acquisitionTaxRate);

  return {
    method: "loan",
    label: FINANCE_METHOD_LABELS.loan,
    monthlyPayment,
    deposit,
    totalInstallment,
    insuranceCost,
    taxCost,
    residualValue: 0,
    totalCost: deposit + totalInstallment + insuranceCost + taxCost,
    ownership: "즉시 본인 명의",
    comparisonNote: "계약기간 현금유출 기준 · 차량 잔존가치 제외",
    includesInsurance: false,
    includesTax: false,
  };
}

export function calcLongTermRent(input: LeaseCompareInput): FinanceResult {
  const deposit = roundWon(input.vehiclePrice * input.depositRate);
  const financedAmount = Math.max(0, input.vehiclePrice - deposit);
  const baseMonthly = financedAmount / input.termMonths;
  const managementFee = baseMonthly * input.rentManagementRate;
  const insuranceBundle = input.annualInsurance / 12;
  const monthlyPayment = roundWon(baseMonthly + managementFee + insuranceBundle);
  const totalInstallment = monthlyPayment * input.termMonths;

  return {
    method: "longTermRent",
    label: FINANCE_METHOD_LABELS.longTermRent,
    monthlyPayment,
    deposit,
    totalInstallment,
    insuranceCost: 0,
    taxCost: 0,
    residualValue: 0,
    totalCost: deposit + totalInstallment,
    ownership: "회사 명의 / 반납",
    comparisonNote: "계약기간 현금유출 기준 · 보험·세금 포함",
    includesInsurance: true,
    includesTax: true,
  };
}

export function calcLeaseCompare(input: LeaseCompareInput): LeaseCompareResult {
  const methods = [calcLease(input), calcLoan(input), calcLongTermRent(input)];
  const sorted = [...methods].sort((a, b) => a.totalCost - b.totalCost);

  return {
    methods,
    bestMethod: sorted[0].method,
    bestResult: sorted[0],
    spread: sorted[sorted.length - 1].totalCost - sorted[0].totalCost,
    runnerUpGap: (sorted[1]?.totalCost ?? sorted[0].totalCost) - sorted[0].totalCost,
  };
}
