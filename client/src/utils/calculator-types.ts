import type {
  DisplacementRange,
  Region,
  VehicleCondition,
  VehicleType,
} from "@/data/carTaxRates";
import type {
  DeductibleLevel,
  MileageRange,
} from "@/data/insuranceRates";
import type {
  DepositRateOption,
  FinanceMethod,
  ResidualRateOption,
  TermMonths,
} from "@/data/leaseRates";

export interface TaxItem {
  label: string;
  value: number;
}

export interface SavingItem {
  label: string;
  rate: number;
  amount: number;
  kind: "discount" | "surcharge";
}

export interface CarTaxInput {
  vehiclePrice: number;
  vehicleType: VehicleType;
  condition: VehicleCondition;
  modelYearAge: number;
  displacementRange: DisplacementRange;
  region: Region;
  isDisabledOwner: boolean;
  applyPlateAgencyFee: boolean;
}

export interface CarTaxBreakdown {
  vehiclePrice: number;
  taxableBase: number;
  residualRate: number;
  taxRate: number;
  acquisitionTax: number;
  bondPurchaseRate: number;
  bondPurchaseAmount: number;
  bondDiscountRate: number;
  bondCost: number;
  miscCost: number;
  totalCost: number;
  items: TaxItem[];
  notes: string[];
}

export interface InsuranceInput {
  currentPremium: number;
  experienceYears: number;
  accidentCount: number;
  mileageRange: MileageRange;
  hasBlackbox: boolean;
  vehicleAgeYears: number;
  deductibleLevel: DeductibleLevel;
}

export interface InsuranceBreakdown {
  currentPremium: number;
  estimatedPremium: number;
  finalPremium: number;
  savingsAmount: number;
  directDiscountAmount: number;
  totalSavingsWithDirect: number;
  totalDiscountRate: number;
  items: SavingItem[];
  notes: string[];
}

export interface LeaseCompareInput {
  vehiclePrice: number;
  depositRate: DepositRateOption;
  termMonths: TermMonths;
  residualRate: ResidualRateOption;
  leaseRate: number;
  loanRate: number;
  annualInsurance: number;
  acquisitionTaxRate: number;
  rentManagementRate: number;
}

export interface FinanceResult {
  method: FinanceMethod;
  label: string;
  monthlyPayment: number;
  deposit: number;
  totalInstallment: number;
  insuranceCost: number;
  taxCost: number;
  residualValue: number;
  totalCost: number;
  ownership: string;
  comparisonNote: string;
  includesInsurance: boolean;
  includesTax: boolean;
}

export interface LeaseCompareResult {
  methods: FinanceResult[];
  bestMethod: FinanceMethod;
  bestResult: FinanceResult;
  spread: number;
  runnerUpGap: number;
}
