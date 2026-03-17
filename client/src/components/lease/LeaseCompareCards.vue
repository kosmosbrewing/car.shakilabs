<script setup lang="ts">
import { computed } from "vue";
import { Trophy, Medal } from "lucide-vue-next";
import { Badge } from "@/components/ui/badge";
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

function rankLabel(index: number): string {
  return `${index + 1}위`;
}
</script>

<template>
  <div class="space-y-3 md:hidden">
    <div
      v-for="(method, index) in sortedMethods"
      :key="method.method"
      :class="[
        'overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow duration-200',
        index === 0
          ? 'border-primary/35 shadow-[0_0_0_1px_hsl(var(--primary)/0.12),0_4px_16px_-4px_hsl(var(--primary)/0.14)]'
          : 'border-border/70'
      ]"
    >
      <!-- 카드 헤더 -->
      <div class="flex items-center justify-between gap-2 px-4 py-3">
        <div class="flex items-center gap-2.5">
          <span
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
            :class="index === 0 ? 'bg-primary/12 text-primary' : 'bg-muted text-muted-foreground'"
          >
            <Trophy v-if="index === 0" class="h-4 w-4" />
            <Medal v-else class="h-4 w-4" />
          </span>
          <div>
            <p class="text-tiny font-semibold" :class="index === 0 ? 'text-primary' : 'text-muted-foreground'">
              {{ rankLabel(index) }}
            </p>
            <p class="text-heading font-bold">{{ method.label }}</p>
          </div>
        </div>
        <Badge :variant="index === 0 ? 'default' : 'neutral'" class="shrink-0 rounded-full px-2.5 py-1">
          {{ chipText(method) }}
        </Badge>
      </div>

      <!-- 카드 바디 -->
      <div class="border-t border-border/60">
        <div class="grid grid-cols-[5.5rem_1fr] border-b border-border/40 px-4 py-2.5">
          <span class="text-caption text-muted-foreground">월 납입금</span>
          <span class="text-right font-semibold tabular-nums">{{ formatWon(method.monthlyPayment) }}</span>
        </div>
        <div class="grid grid-cols-[5.5rem_1fr] border-b border-border/40 px-4 py-2.5">
          <span class="text-caption text-muted-foreground">총비용</span>
          <span
            class="text-right font-semibold tabular-nums"
            :class="index === 0 ? 'text-profit' : ''"
          >
            {{ formatWon(method.totalCost) }}
          </span>
        </div>
        <div
          v-if="method.method === 'lease' && method.residualValue > 0"
          class="grid grid-cols-[5.5rem_1fr] border-b border-border/40 px-4 py-2.5"
        >
          <span class="text-caption text-muted-foreground">잔존가치</span>
          <span class="text-right text-caption font-semibold tabular-nums">
            {{ formatWon(method.residualValue) }}
          </span>
        </div>
        <div class="grid grid-cols-[5.5rem_1fr] px-4 py-2.5">
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
