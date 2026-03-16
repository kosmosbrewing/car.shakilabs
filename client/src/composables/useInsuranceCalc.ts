import { computed, ref, watch } from "vue";
import type { LocationQuery } from "vue-router";
import { useRoute, useRouter } from "vue-router";
import { buildQuery, isSameQuery, queryFirst } from "@/lib/routeState";
import {
  DEFAULT_INSURANCE_INPUT,
  sanitizeInsuranceInput,
} from "@/lib/validators";
import { calcInsurance, type InsuranceInput } from "@/utils/calculator";

function parseQuery(query: LocationQuery): Partial<Record<keyof InsuranceInput, unknown>> {
  return {
    currentPremium: queryFirst(query.premium),
    experienceYears: queryFirst(query.years),
    accidentCount: queryFirst(query.accidents),
    mileageRange: queryFirst(query.mileage),
    hasBlackbox: queryFirst(query.blackbox),
    vehicleAgeYears: queryFirst(query.vehicleAge),
    deductibleLevel: queryFirst(query.deductible),
  };
}

function toQuery(form: InsuranceInput): Record<string, string> {
  return buildQuery({
    premium: form.currentPremium !== DEFAULT_INSURANCE_INPUT.currentPremium ? form.currentPremium : null,
    years: form.experienceYears !== DEFAULT_INSURANCE_INPUT.experienceYears ? form.experienceYears : null,
    accidents: form.accidentCount !== DEFAULT_INSURANCE_INPUT.accidentCount ? form.accidentCount : null,
    mileage: form.mileageRange !== DEFAULT_INSURANCE_INPUT.mileageRange ? form.mileageRange : null,
    blackbox: !form.hasBlackbox ? 0 : null,
    vehicleAge: form.vehicleAgeYears !== DEFAULT_INSURANCE_INPUT.vehicleAgeYears ? form.vehicleAgeYears : null,
    deductible: form.deductibleLevel !== DEFAULT_INSURANCE_INPUT.deductibleLevel ? form.deductibleLevel : null,
  });
}

export function useInsuranceCalc() {
  const route = useRoute();
  const router = useRouter();
  const syncingFromRoute = ref(false);
  const form = ref<InsuranceInput>(DEFAULT_INSURANCE_INPUT);

  function applyRouteQuery(): void {
    syncingFromRoute.value = true;
    form.value = sanitizeInsuranceInput({
      ...DEFAULT_INSURANCE_INPUT,
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

  const result = computed(() => calcInsurance(form.value));
  const shareQuery = computed(() => toQuery(form.value));

  return {
    form,
    result,
    shareQuery,
  };
}
