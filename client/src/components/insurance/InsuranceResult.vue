<script setup lang="ts">
import { Banknote, PiggyBank, TrendingDown, Shield } from "lucide-vue-next";
import { Badge } from "@/components/ui/badge";
import SectionShareButton from "@/components/common/SectionShareButton.vue";
import { formatPercent, formatWon } from "@/lib/utils";
import type { InsuranceBreakdown } from "@/utils/calculator";

defineProps<{
  result: InsuranceBreakdown;
}>();

defineEmits<{
  share: [];
}>();

const statIcons = [Banknote, TrendingDown, PiggyBank, Shield] as const;
const statIconClasses = [
  "bg-muted text-muted-foreground",
  "bg-muted text-muted-foreground",
  "bg-profit/10 text-profit",
  "bg-profit/10 text-profit",
] as const;
</script>

<template>
  <section class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">절약 시뮬레이션 결과</h2>
      <SectionShareButton @click="$emit('share')" />
    </div>

    <div class="retro-panel-content space-y-4">
      <!-- stat 카드 그리드 -->
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div
          v-for="(stat, index) in [
            { label: '현재 보험료', value: result.currentPremium, cls: '' },
            { label: '특약 적용 후', value: result.estimatedPremium, cls: '' },
            { label: '절약액', value: result.savingsAmount, cls: result.savingsAmount >= 0 ? 'text-profit' : 'text-fee' },
            { label: '다이렉트 추가 절약', value: result.directDiscountAmount, cls: 'text-profit' },
          ]"
          :key="stat.label"
          class="rounded-2xl border border-border/50 bg-muted/30 p-3.5"
        >
          <div class="flex items-center gap-2">
            <span
              class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
              :class="statIconClasses[index]"
            >
              <component :is="statIcons[index]" class="h-3.5 w-3.5" />
            </span>
            <p class="truncate text-caption uppercase tracking-wide text-muted-foreground">{{ stat.label }}</p>
          </div>
          <p class="mt-2 text-heading font-bold tabular-nums" :class="stat.cls">
            {{ formatWon(stat.value) }}
          </p>
        </div>
      </div>

      <!-- 하이라이트: 다이렉트 포함 예상 보험료 -->
      <div class="flex items-start justify-between gap-3 rounded-2xl border border-profit/20 bg-profit/5 p-4">
        <div>
          <p class="text-caption font-semibold text-muted-foreground">다이렉트 포함 예상 보험료</p>
          <p class="mt-1 text-display font-bold tabular-nums text-profit">{{ formatWon(result.finalPremium) }}</p>
          <p class="mt-1 text-caption text-muted-foreground">
            총 절감률 {{ formatPercent(result.totalDiscountRate, 1) }} · 누적 절약액 {{ formatWon(result.totalSavingsWithDirect) }}
          </p>
        </div>
        <Badge variant="default" class="shrink-0 rounded-full border-transparent bg-profit text-white">
          최종 예상
        </Badge>
      </div>

      <div class="retro-board-list">
        <div
          v-for="item in result.items"
          :key="item.label"
          class="retro-board-item"
        >
          <span>{{ item.label }}</span>
          <strong
            class="tabular-nums"
            :class="item.kind === 'discount' ? 'text-profit' : 'text-fee'"
          >
            {{ formatWon(item.amount) }}
          </strong>
        </div>
      </div>

      <ul class="space-y-1 text-caption text-muted-foreground">
        <li v-for="note in result.notes" :key="note">• {{ note }}</li>
      </ul>
    </div>
  </section>
</template>
