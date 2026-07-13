<script setup lang="ts">
import { computed } from "vue";
import { Receipt, Landmark, FileText, Percent } from "lucide-vue-next";
import { ShBreakdownBar } from "@shakilabs/ui";
import { Badge } from "@/components/ui/badge";
import SectionShareButton from "@/components/common/SectionShareButton.vue";
import { formatPercent, formatWon } from "@/lib/utils";
import type { CarTaxBreakdown } from "@/utils/calculator";

const props = defineProps<{
  result: CarTaxBreakdown;
}>();

defineEmits<{
  share: [];
}>();

const chartSegments = computed(() => {
  return [
    { key: "tax", label: "취득세", value: props.result.acquisitionTax, tone: "danger" as const },
    { key: "bond", label: "공채비", value: props.result.bondCost, tone: "muted" as const },
    { key: "misc", label: "부대비용", value: props.result.miscCost, tone: "primary" as const },
  ];
});

const statItems = computed(() => [
  { label: "취득세", value: props.result.acquisitionTax, icon: Receipt, iconCls: "bg-fee/10 text-fee" },
  { label: "공채비", value: props.result.bondCost, icon: Landmark, iconCls: "bg-muted text-muted-foreground" },
  { label: "부대비용", value: props.result.miscCost, icon: FileText, iconCls: "bg-muted text-muted-foreground" },
]);
</script>

<template>
  <section class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">예상 등록비용</h2>
      <SectionShareButton @click="$emit('share')" />
    </div>

    <div class="retro-panel-content space-y-4">
      <!-- 히어로: 총 등록비용 -->
      <div class="car-result-hero flex items-start justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/8 p-4">
        <div>
          <p class="text-caption font-semibold text-muted-foreground">예상 총 등록비용</p>
          <p class="mt-1 text-display font-bold tabular-nums text-primary">
            {{ formatWon(result.totalCost) }}
          </p>
          <p class="mt-1 text-caption text-muted-foreground">
            차량가 대비
            <strong class="font-semibold tabular-nums text-primary">
              {{ formatPercent(result.totalCost / result.vehiclePrice, 1) }}
            </strong>
          </p>
        </div>
        <Badge variant="default" class="shrink-0 rounded-full border-transparent bg-primary text-white">
          총비용
        </Badge>
      </div>

      <!-- stat 카드 그리드 (모바일 1열 → sm 3열) -->
      <div class="grid gap-2 sm:grid-cols-3">
        <div
          v-for="stat in statItems"
          :key="stat.label"
          class="rounded-2xl border border-border/50 bg-muted/30 p-3.5"
        >
          <div class="flex items-center gap-2">
            <span
              class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
              :class="stat.iconCls"
            >
              <component :is="stat.icon" class="h-3.5 w-3.5" />
            </span>
            <p class="truncate text-caption uppercase tracking-wide text-muted-foreground">{{ stat.label }}</p>
          </div>
          <p class="mt-2 text-heading font-bold tabular-nums">
            {{ formatWon(stat.value) }}
          </p>
        </div>
      </div>

      <ShBreakdownBar
        label="등록비용 구성"
        :segments="chartSegments"
        :format-value="formatWon"
        surface="outlined"
      />

      <!-- 상세 지표 -->
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
