<script setup lang="ts">
import { computed } from "vue";
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
import { CAR_PRICE_MAX, CAR_PRICE_MIN } from "@/lib/validators";
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
const formattedPrice = computed(() => formatNumber(props.modelValue.vehiclePrice));

function patch(partial: Partial<LeaseCompareInput>): void {
  emit("update:modelValue", { ...props.modelValue, ...partial });
}

function optionClass(active: boolean): string {
  return active
    ? "border-primary bg-primary text-primary-foreground"
    : "border-border text-muted-foreground hover:border-primary/45 hover:text-foreground";
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
          v-for="preset in LEASE_PRICE_PRESETS"
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
      <span class="block text-caption font-semibold text-foreground">선수금 비율</span>
      <div class="grid grid-cols-4 gap-2">
        <button
          v-for="deposit in depositOptions"
          :key="deposit"
          type="button"
          class="touch-target rounded-xl border px-3 py-2 text-caption font-semibold transition-colors"
          :class="optionClass(modelValue.depositRate === deposit)"
          @click="patch({ depositRate: deposit })"
        >
          {{ DEPOSIT_RATE_LABELS[deposit] }}
        </button>
      </div>
    </div>

    <div class="space-y-2">
      <span class="block text-caption font-semibold text-foreground">이용 기간</span>
      <div class="grid grid-cols-4 gap-2">
        <button
          v-for="term in termOptions"
          :key="term"
          type="button"
          class="touch-target rounded-xl border px-3 py-2 text-caption font-semibold transition-colors"
          :class="optionClass(modelValue.termMonths === term)"
          @click="patch({ termMonths: term })"
        >
          {{ TERM_MONTH_LABELS[term] }}
        </button>
      </div>
    </div>

    <div class="space-y-2">
      <span class="block text-caption font-semibold text-foreground">잔존가치율</span>
      <div class="grid grid-cols-4 gap-2">
        <button
          v-for="residual in residualOptions"
          :key="residual"
          type="button"
          class="touch-target rounded-xl border px-3 py-2 text-caption font-semibold transition-colors"
          :class="optionClass(modelValue.residualRate === residual)"
          @click="patch({ residualRate: residual })"
        >
          {{ RESIDUAL_RATE_LABELS[residual] }}
        </button>
      </div>
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
