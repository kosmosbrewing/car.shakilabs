<script setup lang="ts">
import SectionShareButton from "@/components/common/SectionShareButton.vue";
import { formatPercent, formatWon } from "@/lib/utils";
import type { InsuranceBreakdown } from "@/utils/calculator";

defineProps<{
  result: InsuranceBreakdown;
}>();

defineEmits<{
  share: [];
}>();
</script>

<template>
  <section class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">절약 시뮬레이션 결과</h2>
      <SectionShareButton @click="$emit('share')" />
    </div>

    <div class="retro-panel-content space-y-4">
      <div class="retro-stat-grid">
        <div class="retro-stat">
          <p class="retro-stat-label">현재 보험료</p>
          <p class="retro-stat-value">{{ formatWon(result.currentPremium) }}</p>
        </div>
        <div class="retro-stat">
          <p class="retro-stat-label">특약 적용 후</p>
          <p class="retro-stat-value">{{ formatWon(result.estimatedPremium) }}</p>
        </div>
        <div class="retro-stat">
          <p class="retro-stat-label">절약액</p>
          <p class="retro-stat-value" :class="result.savingsAmount >= 0 ? 'text-profit' : 'text-fee'">
            {{ formatWon(result.savingsAmount) }}
          </p>
        </div>
        <div class="retro-stat">
          <p class="retro-stat-label">다이렉트 추가 절약</p>
          <p class="retro-stat-value text-profit">{{ formatWon(result.directDiscountAmount) }}</p>
        </div>
      </div>

      <div class="rounded-2xl border border-profit/20 bg-profit/5 p-4">
        <p class="text-caption font-semibold text-muted-foreground">다이렉트 포함 예상 보험료</p>
        <p class="mt-1 text-display font-bold text-profit tabular-nums">{{ formatWon(result.finalPremium) }}</p>
        <p class="mt-1 text-caption text-muted-foreground">
          총 절감률 {{ formatPercent(result.totalDiscountRate, 1) }} · 누적 절약액 {{ formatWon(result.totalSavingsWithDirect) }}
        </p>
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
