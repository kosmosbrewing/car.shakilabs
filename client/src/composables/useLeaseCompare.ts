import { computed, ref, watch } from "vue";
import type { LocationQuery } from "vue-router";
import { useRoute, useRouter } from "vue-router";
import { buildQuery, isSameQuery, queryFirst } from "@/lib/routeState";
import {
  DEFAULT_LEASE_COMPARE_INPUT,
  sanitizeLeaseCompareInput,
} from "@/lib/validators";
import { calcLeaseCompare, type LeaseCompareInput } from "@/utils/calculator";

function parseQuery(query: LocationQuery): Partial<Record<keyof LeaseCompareInput, unknown>> {
  return {
    vehiclePrice: queryFirst(query.price),
    depositRate: queryFirst(query.deposit),
    termMonths: queryFirst(query.term),
    residualRate: queryFirst(query.residual),
    leaseRate: queryFirst(query.leaseRate),
    loanRate: queryFirst(query.loanRate),
    annualInsurance: queryFirst(query.insurance),
    acquisitionTaxRate: queryFirst(query.taxRate),
    rentManagementRate: queryFirst(query.rentFee),
  };
}

function toQuery(form: LeaseCompareInput): Record<string, string> {
  return buildQuery({
    price: form.vehiclePrice !== DEFAULT_LEASE_COMPARE_INPUT.vehiclePrice ? form.vehiclePrice : null,
    deposit: form.depositRate !== DEFAULT_LEASE_COMPARE_INPUT.depositRate ? form.depositRate : null,
    term: form.termMonths !== DEFAULT_LEASE_COMPARE_INPUT.termMonths ? form.termMonths : null,
    residual: form.residualRate !== DEFAULT_LEASE_COMPARE_INPUT.residualRate ? form.residualRate : null,
    leaseRate: form.leaseRate !== DEFAULT_LEASE_COMPARE_INPUT.leaseRate ? form.leaseRate : null,
    loanRate: form.loanRate !== DEFAULT_LEASE_COMPARE_INPUT.loanRate ? form.loanRate : null,
    insurance: form.annualInsurance !== DEFAULT_LEASE_COMPARE_INPUT.annualInsurance ? form.annualInsurance : null,
    taxRate: form.acquisitionTaxRate !== DEFAULT_LEASE_COMPARE_INPUT.acquisitionTaxRate ? form.acquisitionTaxRate : null,
    rentFee: form.rentManagementRate !== DEFAULT_LEASE_COMPARE_INPUT.rentManagementRate ? form.rentManagementRate : null,
  });
}

export function useLeaseCompare() {
  const route = useRoute();
  const router = useRouter();
  const syncingFromRoute = ref(false);
  const form = ref<LeaseCompareInput>(DEFAULT_LEASE_COMPARE_INPUT);

  function applyRouteQuery(): void {
    syncingFromRoute.value = true;
    form.value = sanitizeLeaseCompareInput({
      ...DEFAULT_LEASE_COMPARE_INPUT,
      ...parseQuery(route.query),
    });
    syncingFromRoute.value = false;
  }

  watch(() => route.query, applyRouteQuery, { immediate: true });

  watch(
    form,
    (value) => {
      if (syncingFromRoute.value) return;
      const nextQuery = toQuery(value);
      if (!isSameQuery(route.query, nextQuery)) {
        void router.replace({ query: nextQuery });
      }
    },
    { deep: true }
  );

  const result = computed(() => calcLeaseCompare(form.value));
  const shareQuery = computed(() => toQuery(form.value));

  return {
    form,
    result,
    shareQuery,
  };
}
