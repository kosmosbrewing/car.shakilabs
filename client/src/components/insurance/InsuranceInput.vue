<script setup lang="ts">
import { computed } from "vue";
import {
  DEDUCTIBLE_LABELS,
  MILEAGE_LABELS,
  type DeductibleLevel,
  type MileageRange,
} from "@/data/insuranceRates";
import { INSURANCE_PRESETS } from "@/data/pricePresets";
import { formatNumber } from "@/lib/utils";
import {
  INSURANCE_PREMIUM_MAX,
  INSURANCE_PREMIUM_MIN,
} from "@/lib/validators";
import type { InsuranceInput } from "@/utils/calculator";

const props = defineProps<{
  modelValue: InsuranceInput;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: InsuranceInput];
}>();

const mileageRanges = Object.keys(MILEAGE_LABELS) as MileageRange[];
const deductibleLevels = Object.keys(DEDUCTIBLE_LABELS) as DeductibleLevel[];
const experienceYearOptions = Array.from({ length: 20 }, (_, index) => index + 1);
const vehicleAgeOptions = Array.from({ length: 21 }, (_, index) => index);
const accidentOptions = [0, 1, 2, 3] as const;
const formattedPremium = computed(() => formatNumber(props.modelValue.currentPremium));

function patch(partial: Partial<InsuranceInput>): void {
  emit("update:modelValue", { ...props.modelValue, ...partial });
}

function onPremiumInput(event: Event): void {
  const raw = (event.target as HTMLInputElement).value.replace(/[^0-9]/g, "");
  const next = Number.parseInt(raw || "0", 10);
  patch({
    currentPremium: Math.min(
      INSURANCE_PREMIUM_MAX,
      Math.max(INSURANCE_PREMIUM_MIN, next || INSURANCE_PREMIUM_MIN)
    ),
  });
}

function optionClass(active: boolean): string {
  return active
    ? "border-primary bg-primary text-primary-foreground"
    : "border-border text-muted-foreground hover:border-primary/45 hover:text-foreground";
}
</script>

<template>
  <section class="space-y-4">
    <div class="space-y-2">
      <label class="block text-caption font-semibold text-foreground">현재 자동차보험료 (원)</label>
      <input
        :value="formattedPremium"
        type="text"
        inputmode="numeric"
        class="retro-input text-heading font-bold tabular-nums"
        @input="onPremiumInput"
      />
      <input
        :value="modelValue.currentPremium"
        type="range"
        class="retro-range"
        :min="INSURANCE_PREMIUM_MIN"
        :max="INSURANCE_PREMIUM_MAX"
        step="10000"
        @input="patch({ currentPremium: Number(($event.target as HTMLInputElement).value) })"
      />
      <div class="flex flex-wrap gap-2">
        <button
          v-for="preset in INSURANCE_PRESETS"
          :key="preset"
          type="button"
          class="retro-button-subtle min-h-9 px-3 py-1.5 text-caption"
          @click="patch({ currentPremium: preset })"
        >
          {{ formatNumber(preset) }}원
        </button>
      </div>
    </div>

    <div class="grid gap-3 sm:grid-cols-2">
      <label class="space-y-1">
        <span class="text-caption font-semibold text-foreground">보험 가입 경력</span>
        <select
          :value="modelValue.experienceYears"
          class="retro-input"
          @change="patch({ experienceYears: Number(($event.target as HTMLSelectElement).value) })"
        >
          <option v-for="year in experienceYearOptions" :key="year" :value="year">{{ year }}년</option>
        </select>
      </label>

      <label class="space-y-1">
        <span class="text-caption font-semibold text-foreground">차량 연식</span>
        <select
          :value="modelValue.vehicleAgeYears"
          class="retro-input"
          @change="patch({ vehicleAgeYears: Number(($event.target as HTMLSelectElement).value) })"
        >
          <option v-for="year in vehicleAgeOptions" :key="year" :value="year">{{ year === 0 ? '신차' : `${year}년` }}</option>
        </select>
      </label>
    </div>

    <div class="space-y-2">
      <span class="block text-caption font-semibold text-foreground">최근 3년 사고 건수</span>
      <div class="grid grid-cols-4 gap-2">
        <button
          v-for="count in accidentOptions"
          :key="count"
          type="button"
          class="touch-target rounded-xl border px-3 py-2 text-caption font-semibold transition-colors"
          :class="optionClass(modelValue.accidentCount === count)"
          @click="patch({ accidentCount: count })"
        >
          {{ count }}건
        </button>
      </div>
    </div>

    <div class="space-y-2">
      <span class="block text-caption font-semibold text-foreground">마일리지 특약</span>
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <button
          v-for="range in mileageRanges"
          :key="range"
          type="button"
          class="touch-target rounded-xl border px-3 py-2 text-left text-caption font-semibold transition-colors"
          :class="optionClass(modelValue.mileageRange === range)"
          @click="patch({ mileageRange: range })"
        >
          {{ MILEAGE_LABELS[range] }}
        </button>
      </div>
    </div>

    <label class="flex items-center gap-2 rounded-xl border border-border/70 px-3 py-2 text-caption">
      <input
        :checked="modelValue.hasBlackbox"
        type="checkbox"
        class="retro-checkbox"
        @change="patch({ hasBlackbox: ($event.target as HTMLInputElement).checked })"
      />
      <span>블랙박스 장착 할인 적용</span>
    </label>

    <div class="space-y-2">
      <span class="block text-caption font-semibold text-foreground">자기부담금</span>
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-5">
        <button
          v-for="deductible in deductibleLevels"
          :key="deductible"
          type="button"
          class="touch-target rounded-xl border px-3 py-2 text-caption font-semibold transition-colors"
          :class="optionClass(modelValue.deductibleLevel === deductible)"
          @click="patch({ deductibleLevel: deductible })"
        >
          {{ DEDUCTIBLE_LABELS[deductible] }}
        </button>
      </div>
    </div>
  </section>
</template>
