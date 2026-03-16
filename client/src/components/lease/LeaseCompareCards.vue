<script setup lang="ts">
import { computed } from "vue";
import { formatWon } from "@/lib/utils";
import type { FinanceResult, LeaseCompareResult } from "@/utils/calculator";

const props = defineProps<{
  result: LeaseCompareResult;
}>();

const sortedMethods = computed(() =>
  [...props.result.methods].sort((a, b) => a.totalCost - b.totalCost)
);

function chipText(method: FinanceResult): string {
  if (method.method === "lease") return "만기 반납 기준";
  if (method.includesInsurance && method.includesTax) return "보험·세금 포함";
  if (method.includesInsurance) return "보험 포함";
  return "별도 부담";
}
</script>

<template>
  <div class="space-y-3 md:hidden">
    <div
      v-for="(method, index) in sortedMethods"
      :key="method.method"
      class="overflow-hidden rounded-2xl border bg-card"
      :class="index === 0 ? 'border-profit/40' : 'border-border/70'"
    >
      <div class="flex items-center justify-between gap-2 px-4 py-3">
        <div>
          <p class="text-caption text-muted-foreground">{{ index + 1 }}위</p>
          <p class="text-heading font-bold">{{ method.label }}</p>
        </div>
        <span
          class="inline-flex rounded-full px-2.5 py-1 text-tiny font-semibold"
          :class="index === 0 ? 'bg-profit text-white' : 'bg-muted text-muted-foreground'"
        >
          {{ chipText(method) }}
        </span>
      </div>

      <div class="border-t border-border/60">
        <div class="grid grid-cols-[5rem_1fr] border-b border-border/40 px-4 py-2.5">
          <span class="text-caption text-muted-foreground">월 납입금</span>
          <span class="text-right font-semibold tabular-nums">{{ formatWon(method.monthlyPayment) }}</span>
        </div>
        <div class="grid grid-cols-[5rem_1fr] border-b border-border/40 px-4 py-2.5">
          <span class="text-caption text-muted-foreground">총비용</span>
          <span class="text-right font-semibold tabular-nums" :class="index === 0 ? 'text-profit' : ''">
            {{ formatWon(method.totalCost) }}
          </span>
        </div>
        <div
          v-if="method.method === 'lease' && method.residualValue > 0"
          class="grid grid-cols-[5rem_1fr] border-b border-border/40 px-4 py-2.5"
        >
          <span class="text-caption text-muted-foreground">잔존가치</span>
          <span class="text-right text-caption font-semibold tabular-nums">
            {{ formatWon(method.residualValue) }}
          </span>
        </div>
        <div class="grid grid-cols-[5rem_1fr] px-4 py-2.5">
          <span class="text-caption text-muted-foreground">소유권</span>
          <span class="text-right text-caption font-semibold">{{ method.ownership }}</span>
        </div>
        <p class="border-t border-border/40 px-4 py-2 text-tiny text-muted-foreground">
          {{ method.comparisonNote }}
        </p>
      </div>
    </div>
  </div>
</template>
