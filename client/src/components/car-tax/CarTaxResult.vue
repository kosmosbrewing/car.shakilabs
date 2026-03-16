<script setup lang="ts">
import SectionShareButton from "@/components/common/SectionShareButton.vue";
import { formatPercent, formatWon } from "@/lib/utils";
import type { CarTaxBreakdown } from "@/utils/calculator";

defineProps<{
  result: CarTaxBreakdown;
}>();

defineEmits<{
  share: [];
}>();
</script>

<template>
  <section class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">예상 등록비용</h2>
      <SectionShareButton @click="$emit('share')" />
    </div>

    <div class="retro-panel-content space-y-4">
      <div class="retro-stat-grid">
        <div class="retro-stat">
          <p class="retro-stat-label">취득세</p>
          <p class="retro-stat-value text-fee">{{ formatWon(result.acquisitionTax) }}</p>
        </div>
        <div class="retro-stat">
          <p class="retro-stat-label">공채비</p>
          <p class="retro-stat-value">{{ formatWon(result.bondCost) }}</p>
        </div>
        <div class="retro-stat">
          <p class="retro-stat-label">부대비용</p>
          <p class="retro-stat-value">{{ formatWon(result.miscCost) }}</p>
        </div>
        <div class="retro-stat">
          <p class="retro-stat-label">총비용</p>
          <p class="retro-stat-value text-primary">{{ formatWon(result.totalCost) }}</p>
        </div>
      </div>

      <div class="retro-board-list">
        <div class="retro-board-item bg-primary/5 font-semibold">
          <span>차량가 대비 총비용</span>
          <strong class="tabular-nums text-primary">
            {{ formatPercent(result.totalCost / result.vehiclePrice, 1) }}
          </strong>
        </div>
        <div class="retro-board-item">
          <span>과세표준</span>
          <strong class="tabular-nums">{{ formatWon(result.taxableBase) }}</strong>
        </div>
        <div class="retro-board-item">
          <span>취득세율</span>
          <strong class="tabular-nums">{{ formatPercent(result.taxRate, 1) }}</strong>
        </div>
        <div class="retro-board-item">
          <span>공채 할인율</span>
          <strong class="tabular-nums">{{ formatPercent(result.bondDiscountRate, 1) }}</strong>
        </div>
      </div>

      <ul class="space-y-1 text-caption text-muted-foreground">
        <li v-for="note in result.notes" :key="note">• {{ note }}</li>
      </ul>
    </div>
  </section>
</template>
