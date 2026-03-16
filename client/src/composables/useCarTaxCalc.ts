import { computed, ref, watch } from "vue";
import type { LocationQuery } from "vue-router";
import { useRoute, useRouter } from "vue-router";
import { buildQuery, isSameQuery, queryFirst } from "@/lib/routeState";
import {
  DEFAULT_CAR_TAX_INPUT,
  sanitizeCarTaxInput,
} from "@/lib/validators";
import { calcCarTax, type CarTaxInput } from "@/utils/calculator";

function parseQuery(query: LocationQuery): Partial<Record<keyof CarTaxInput, unknown>> {
  return {
    vehiclePrice: queryFirst(query.price),
    vehicleType: queryFirst(query.type),
    condition: queryFirst(query.condition),
    modelYearAge: queryFirst(query.age),
    displacementRange: queryFirst(query.cc),
    region: queryFirst(query.region),
    isDisabledOwner: queryFirst(query.disabled),
    applyPlateAgencyFee: queryFirst(query.plate),
  };
}

function toQuery(form: CarTaxInput): Record<string, string> {
  return buildQuery({
    price: form.vehiclePrice !== DEFAULT_CAR_TAX_INPUT.vehiclePrice ? form.vehiclePrice : null,
    type: form.vehicleType !== DEFAULT_CAR_TAX_INPUT.vehicleType ? form.vehicleType : null,
    condition: form.condition !== DEFAULT_CAR_TAX_INPUT.condition ? form.condition : null,
    age: form.condition === "used" ? form.modelYearAge : null,
    cc: form.displacementRange !== DEFAULT_CAR_TAX_INPUT.displacementRange ? form.displacementRange : null,
    region: form.region !== DEFAULT_CAR_TAX_INPUT.region ? form.region : null,
    disabled: form.isDisabledOwner ? 1 : null,
    plate: !form.applyPlateAgencyFee ? 0 : null,
  });
}

export function useCarTaxCalc() {
  const route = useRoute();
  const router = useRouter();
  const syncingFromRoute = ref(false);
  const form = ref<CarTaxInput>(DEFAULT_CAR_TAX_INPUT);

  function applyRouteQuery(): void {
    syncingFromRoute.value = true;
    form.value = sanitizeCarTaxInput({
      ...DEFAULT_CAR_TAX_INPUT,
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

  const result = computed(() => calcCarTax(form.value));
  const shareQuery = computed(() => toQuery(form.value));

  return {
    form,
    result,
    shareQuery,
  };
}
