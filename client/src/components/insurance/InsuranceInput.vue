<script setup lang="ts">
import { computed } from "vue";
import { ShPresetGroup, ShSlider } from "@shakilabs/ui";
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
const accidentPresetOptions = accidentOptions.map((value) => ({ label: `${value}건`, value }));
const mileagePresetOptions = mileageRanges.map((value) => ({ label: MILEAGE_LABELS[value], value }));
const deductiblePresetOptions = deductibleLevels.map((value) => ({ label: DEDUCTIBLE_LABELS[value], value }));
const formattedPremium = computed(() => formatNumber(props.modelValue.currentPremium));
const premiumPresets = INSURANCE_PRESETS.map((value) => ({
  label: `${formatNumber(value)}원`,
  value,
}));

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

</script>

<template>
  <section class="space-y-4">
    <div class="space-y-2">
      <label class="block text-caption font-semibold text-foreground">현재 자동차보험료 (원)</label>
      <div class="relative">
        <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-heading font-bold text-muted-foreground">₩</span>
        <input
          aria-label="현재 자동차보험료"
          :value="formattedPremium"
          type="text"
          inputmode="numeric"
          class="retro-input pl-8 text-heading font-bold tabular-nums"
          @input="onPremiumInput"
        />
      </div>
      <ShSlider
        :model-value="modelValue.currentPremium"
        :min="INSURANCE_PREMIUM_MIN"
        :max="INSURANCE_PREMIUM_MAX"
        :step="10000"
        :value-text="`현재 자동차보험료 ${formatNumber(modelValue.currentPremium)}원`"
        aria-label="현재 자동차보험료 슬라이더"
        @update:model-value="patch({ currentPremium: $event })"
      />
      <ShPresetGroup
        :model-value="modelValue.currentPremium"
        :options="premiumPresets"
        label="현재 자동차보험료 빠른 선택"
        @update:model-value="patch({ currentPremium: $event })"
      />
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
      <ShPresetGroup
        :model-value="modelValue.accidentCount"
        :options="accidentPresetOptions"
        label="최근 3년 사고 건수 선택"
        @update:model-value="patch({ accidentCount: $event })"
      />
    </div>

    <div class="space-y-2">
      <span class="block text-caption font-semibold text-foreground">마일리지 특약</span>
      <ShPresetGroup
        :model-value="modelValue.mileageRange"
        :options="mileagePresetOptions"
        label="마일리지 특약 선택"
        @update:model-value="patch({ mileageRange: $event })"
      />
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
      <ShPresetGroup
        :model-value="modelValue.deductibleLevel"
        :options="deductiblePresetOptions"
        label="자기부담금 선택"
        @update:model-value="patch({ deductibleLevel: $event })"
      />
    </div>
  </section>
</template>
