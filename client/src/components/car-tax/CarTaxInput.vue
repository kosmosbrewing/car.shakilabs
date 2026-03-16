<script setup lang="ts">
import { computed } from "vue";
import {
  DISPLACEMENT_LABELS,
  REGION_LABELS,
  VEHICLE_TYPE_LABELS,
  type DisplacementRange,
  type Region,
  type VehicleType,
} from "@/data/carTaxRates";
import { TAX_PRICE_PRESETS } from "@/data/pricePresets";
import { formatNumber } from "@/lib/utils";
import { CAR_PRICE_MAX, CAR_PRICE_MIN } from "@/lib/validators";
import type { CarTaxInput } from "@/utils/calculator";

const props = defineProps<{
  modelValue: CarTaxInput;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: CarTaxInput];
}>();

const vehicleTypes = Object.keys(VEHICLE_TYPE_LABELS) as VehicleType[];
const displacementRanges = Object.keys(DISPLACEMENT_LABELS) as DisplacementRange[];
const regions = Object.keys(REGION_LABELS) as Region[];
const ageOptions = Array.from({ length: 15 }, (_, index) => index + 1);

const formattedPrice = computed(() => formatNumber(props.modelValue.vehiclePrice));
const showDisplacementRange = computed(() => props.modelValue.vehicleType !== "motorcycle");
const fixedDisplacementRange = computed<DisplacementRange | null>(() =>
  ["light", "motorcycle"].includes(props.modelValue.vehicleType) ? "under1000" : null
);
const visibleDisplacementRanges = computed<DisplacementRange[]>(() =>
  fixedDisplacementRange.value ? [fixedDisplacementRange.value] : displacementRanges
);

function patch(partial: Partial<CarTaxInput>): void {
  const next = { ...props.modelValue, ...partial };

  if (next.vehicleType === "light" || next.vehicleType === "motorcycle") {
    next.displacementRange = "under1000";
  }

  emit("update:modelValue", next);
}

function onPriceInput(event: Event): void {
  const raw = (event.target as HTMLInputElement).value.replace(/[^0-9]/g, "");
  const next = Number.parseInt(raw || "0", 10);
  patch({
    vehiclePrice: Math.min(CAR_PRICE_MAX, Math.max(CAR_PRICE_MIN, next || CAR_PRICE_MIN)),
  });
}

function optionClass(active: boolean): string {
  return active
    ? "border-primary bg-primary text-primary-foreground"
    : "border-border text-muted-foreground hover:border-primary/45 hover:text-foreground";
}

function selectVehicleType(vehicleType: VehicleType): void {
  patch({ vehicleType });
}
</script>

<template>
  <section class="space-y-4">
    <div class="space-y-2">
      <label class="block text-caption font-semibold text-foreground">차량 가격 (원)</label>
      <div class="relative">
        <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-heading font-bold text-muted-foreground">₩</span>
        <input
          :value="formattedPrice"
          type="text"
          inputmode="numeric"
          class="retro-input pl-8 text-heading font-bold tabular-nums"
          @input="onPriceInput"
        />
      </div>
      <input
        :value="modelValue.vehiclePrice"
        type="range"
        class="retro-range"
        :min="CAR_PRICE_MIN"
        :max="100000000"
        step="500000"
        @input="patch({ vehiclePrice: Number(($event.target as HTMLInputElement).value) })"
      />
      <div class="flex flex-wrap gap-2">
        <button
          v-for="preset in TAX_PRICE_PRESETS"
          :key="preset"
          type="button"
          class="retro-button-subtle min-h-11 px-3 py-1.5 text-caption"
          @click="patch({ vehiclePrice: preset })"
        >
          {{ formatNumber(preset) }}원
        </button>
      </div>
    </div>

    <div class="space-y-2">
      <span class="block text-caption font-semibold text-foreground">차종</span>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="vehicleType in vehicleTypes"
          :key="vehicleType"
          type="button"
          class="touch-target rounded-xl border px-3 py-2 text-left text-caption font-semibold transition-colors"
          :class="optionClass(modelValue.vehicleType === vehicleType)"
          @click="selectVehicleType(vehicleType)"
        >
          {{ VEHICLE_TYPE_LABELS[vehicleType] }}
        </button>
      </div>
    </div>

    <div class="space-y-2">
      <span class="block text-caption font-semibold text-foreground">신차 / 중고차</span>
      <div class="grid grid-cols-2 gap-2">
        <button
          type="button"
          class="touch-target rounded-xl border px-3 py-2 text-caption font-semibold transition-colors"
          :class="optionClass(modelValue.condition === 'new')"
          @click="patch({ condition: 'new', modelYearAge: 1 })"
        >
          신차
        </button>
        <button
          type="button"
          class="touch-target rounded-xl border px-3 py-2 text-caption font-semibold transition-colors"
          :class="optionClass(modelValue.condition === 'used')"
          @click="patch({ condition: 'used' })"
        >
          중고차
        </button>
      </div>

      <label v-if="modelValue.condition === 'used'" class="block space-y-1">
        <span class="text-caption text-muted-foreground">중고차 경과연수</span>
        <select
          :value="modelValue.modelYearAge"
          class="retro-input"
          @change="patch({ modelYearAge: Number(($event.target as HTMLSelectElement).value) })"
        >
          <option v-for="age in ageOptions" :key="age" :value="age">{{ age }}년</option>
        </select>
      </label>
    </div>

    <div v-if="showDisplacementRange" class="space-y-2">
      <span class="block text-caption font-semibold text-foreground">배기량 구간</span>
      <p
        v-if="fixedDisplacementRange === 'under1000'"
        class="text-caption text-muted-foreground"
      >
        {{ modelValue.vehicleType === "light" ? "경차는" : "이륜차는" }} 배기량 구간을
        1,000cc 미만으로 고정해 계산합니다.
      </p>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="range in visibleDisplacementRanges"
          :key="range"
          type="button"
          class="touch-target rounded-xl border px-3 py-2 text-left text-caption font-semibold transition-colors"
          :class="optionClass(modelValue.displacementRange === range)"
          :disabled="fixedDisplacementRange != null"
          @click="patch({ displacementRange: range })"
        >
          {{ DISPLACEMENT_LABELS[range] }}
        </button>
      </div>
    </div>

    <div class="space-y-2">
      <span class="block text-caption font-semibold text-foreground">등록 지역</span>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="region in regions"
          :key="region"
          type="button"
          class="touch-target rounded-xl border px-3 py-2 text-caption font-semibold transition-colors"
          :class="optionClass(modelValue.region === region)"
          @click="patch({ region })"
        >
          {{ REGION_LABELS[region] }}
        </button>
      </div>
    </div>

    <div class="space-y-2">
      <span class="block text-caption font-semibold text-foreground">감면 / 부대 옵션</span>
      <label class="flex items-center gap-2 rounded-xl border border-border/70 px-3 py-2 text-caption">
        <input
          :checked="modelValue.isDisabledOwner"
          type="checkbox"
          class="retro-checkbox"
          @change="patch({ isDisabledOwner: ($event.target as HTMLInputElement).checked })"
        />
        <span>장애인 취득세 감면 가정 적용</span>
      </label>
      <label class="flex items-center gap-2 rounded-xl border border-border/70 px-3 py-2 text-caption">
        <input
          :checked="modelValue.applyPlateAgencyFee"
          type="checkbox"
          class="retro-checkbox"
          @change="patch({ applyPlateAgencyFee: ($event.target as HTMLInputElement).checked })"
        />
        <span>번호판 대행 수수료 포함</span>
      </label>
    </div>
  </section>
</template>
