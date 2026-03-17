<script setup lang="ts">
import { Receipt, Landmark, FileText, CircleDollarSign, Percent } from "lucide-vue-next";
import { Card, CardContent } from "@/components/ui/card";
import SectionShareButton from "@/components/common/SectionShareButton.vue";
import { formatPercent, formatWon } from "@/lib/utils";
import type { CarTaxBreakdown } from "@/utils/calculator";

defineProps<{
  result: CarTaxBreakdown;
}>();

defineEmits<{
  share: [];
}>();

const statIcons = [Receipt, Landmark, FileText, CircleDollarSign] as const;
const statIconClasses = [
  "bg-fee/10 text-fee",
  "bg-muted text-muted-foreground",
  "bg-muted text-muted-foreground",
  "bg-primary/10 text-primary",
] as const;
</script>

<template>
  <section class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">예상 등록비용</h2>
      <SectionShareButton @click="$emit('share')" />
    </div>

    <div class="retro-panel-content space-y-4">
      <!-- stat 카드 그리드 -->
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Card
          v-for="(stat, index) in [
            { label: '취득세', value: result.acquisitionTax, cls: 'text-fee' },
            { label: '공채비', value: result.bondCost, cls: '' },
            { label: '부대비용', value: result.miscCost, cls: '' },
            { label: '총비용', value: result.totalCost, cls: 'text-primary' },
          ]"
          :key="stat.label"
          class="border-border/50 bg-muted/30"
        >
          <CardContent class="p-3.5">
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
          </CardContent>
        </Card>
      </div>

      <div class="retro-board-list">
        <div class="retro-board-item bg-primary/5 font-semibold">
          <span class="flex items-center gap-2">
            <Percent class="h-3.5 w-3.5 text-primary" />
            차량가 대비 총비용
          </span>
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
