<script setup lang="ts">
import { computed } from "vue";
import { ShPresetGroup, ShSlider } from "@shakilabs/ui";
import {
  DEPOSIT_RATE_LABELS,
  RESIDUAL_RATE_LABELS,
  TERM_MONTH_LABELS,
  type DepositRateOption,
  type ResidualRateOption,
  type TermMonths,
} from "@/data/leaseRates";
import { LEASE_PRICE_PRESETS } from "@/data/pricePresets";
import { formatNumber } from "@/lib/utils";
import { CAR_PRICE_MAX, CAR_PRICE_MIN, CAR_PRICE_SLIDER_MAX } from "@/lib/validators";
import type { LeaseCompareInput } from "@/utils/calculator";

const props = defineProps<{
  modelValue: LeaseCompareInput;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: LeaseCompareInput];
}>();

const depositOptions = Object.keys(DEPOSIT_RATE_LABELS).map(Number) as DepositRateOption[];
const termOptions = Object.keys(TERM_MONTH_LABELS).map(Number) as TermMonths[];
const residualOptions = Object.keys(RESIDUAL_RATE_LABELS).map(Number) as ResidualRateOption[];
const depositPresetOptions = depositOptions.map((value) => ({ label: DEPOSIT_RATE_LABELS[value], value }));
const termPresetOptions = termOptions.map((value) => ({ label: TERM_MONTH_LABELS[value], value }));
const residualPresetOptions = residualOptions.map((value) => ({ label: RESIDUAL_RATE_LABELS[value], value }));
const formattedPrice = computed(() => formatNumber(props.modelValue.vehiclePrice));
const pricePresets = LEASE_PRICE_PRESETS.map((value) => ({
  label: `${formatNumber(value)}원`,
  value,
}));

function patch(partial: Partial<LeaseCompareInput>): void {
  emit("update:modelValue", { ...props.modelValue, ...partial });
}

function onPriceInput(event: Event): void {
  const raw = (event.target as HTMLInputElement).value.replace(/[^0-9]/g, "");
  const next = Number.parseInt(raw || "0", 10);
  patch({
    vehiclePrice: Math.min(CAR_PRICE_MAX, Math.max(CAR_PRICE_MIN, next || CAR_PRICE_MIN)),
  });
}
</script>

<template>
  <section class="space-y-4">
    <div class="space-y-2">
      <label class="block text-caption font-semibold text-foreground">차량 가격 (원)</label>
      <div class="relative">
        <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-heading font-bold text-muted-foreground">₩</span>
        <input
          aria-label="차량 가격"
          :value="formattedPrice"
          type="text"
          inputmode="numeric"
          class="retro-input pl-8 text-heading font-bold tabular-nums"
          @input="onPriceInput"
        />
      </div>
      <ShSlider
        :model-value="Math.min(modelValue.vehiclePrice, CAR_PRICE_SLIDER_MAX)"
        :min="CAR_PRICE_MIN"
        :max="CAR_PRICE_SLIDER_MAX"
        :step="500000"
        :value-text="`차량 가격 ${formatNumber(Math.min(modelValue.vehiclePrice, CAR_PRICE_SLIDER_MAX))}원`"
        aria-label="차량 가격 슬라이더"
        @update:model-value="patch({ vehiclePrice: $event })"
      />
      <ShPresetGroup
        :model-value="modelValue.vehiclePrice"
        :options="pricePresets"
        label="차량 가격 빠른 선택"
        @update:model-value="patch({ vehiclePrice: $event })"
      />
    </div>

    <div class="space-y-2">
      <span class="block text-caption font-semibold text-foreground">선수금 비율</span>
      <ShPresetGroup
        :model-value="modelValue.depositRate"
        :options="depositPresetOptions"
        label="선수금 비율 선택"
        @update:model-value="patch({ depositRate: $event })"
      />
    </div>

    <div class="space-y-2">
      <span class="block text-caption font-semibold text-foreground">이용 기간</span>
      <ShPresetGroup
        :model-value="modelValue.termMonths"
        :options="termPresetOptions"
        label="이용 기간 선택"
        @update:model-value="patch({ termMonths: $event })"
      />
    </div>

    <div class="space-y-2">
      <span class="block text-caption font-semibold text-foreground">잔존가치율</span>
      <ShPresetGroup
        :model-value="modelValue.residualRate"
        :options="residualPresetOptions"
        label="잔존가치율 선택"
        @update:model-value="patch({ residualRate: $event })"
      />
    </div>

    <details class="retro-details">
      <summary class="retro-details-summary">
        <span>상세 설정 보기</span>
        <span class="retro-details-chevron" aria-hidden="true">▾</span>
      </summary>
      <div class="grid gap-3 p-3 sm:grid-cols-2">
        <label class="space-y-1">
          <span class="text-caption text-muted-foreground">리스 금리 <span class="text-[10px] text-muted-foreground/70">(소수, 예: 5.5% → 0.055)</span></span>
          <input
            :value="modelValue.leaseRate"
            type="number"
            step="0.001"
            min="0"
            max="0.2"
            class="retro-input"
            @input="patch({ leaseRate: Number(($event.target as HTMLInputElement).value) })"
          />
        </label>
        <label class="space-y-1">
          <span class="text-caption text-muted-foreground">할부 금리 <span class="text-[10px] text-muted-foreground/70">(소수, 예: 5.5% → 0.055)</span></span>
          <input
            :value="modelValue.loanRate"
            type="number"
            step="0.001"
            min="0"
            max="0.2"
            class="retro-input"
            @input="patch({ loanRate: Number(($event.target as HTMLInputElement).value) })"
          />
        </label>
        <label class="space-y-1">
          <span class="text-caption text-muted-foreground">연간 보험료</span>
          <input
            :value="modelValue.annualInsurance"
            type="number"
            inputmode="numeric"
            min="0"
            class="retro-input"
            @input="patch({ annualInsurance: Number(($event.target as HTMLInputElement).value) })"
          />
        </label>
        <label class="space-y-1">
          <span class="text-caption text-muted-foreground">취등록세율</span>
          <input
            :value="modelValue.acquisitionTaxRate"
            type="number"
            step="0.001"
            min="0"
            max="0.2"
            class="retro-input"
            @input="patch({ acquisitionTaxRate: Number(($event.target as HTMLInputElement).value) })"
          />
        </label>
        <label class="space-y-1 sm:col-span-2">
          <span class="text-caption text-muted-foreground">렌트 관리비 비율</span>
          <input
            :value="modelValue.rentManagementRate"
            type="number"
            step="0.01"
            min="0"
            max="0.5"
            class="retro-input"
            @input="patch({ rentManagementRate: Number(($event.target as HTMLInputElement).value) })"
          />
        </label>
      </div>
    </details>
  </section>
</template>
