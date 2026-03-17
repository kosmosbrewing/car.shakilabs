<script setup lang="ts">
import { computed, ref } from "vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import SEOHead from "@/components/common/SEOHead.vue";
import { CAR_SERVICE_UPDATED_AT, maintenanceProfiles } from "@/data/ownershipData";
import { formatWon } from "@/lib/utils";
import { calculateMaintenanceBudget } from "@/utils/ownershipCalculator";

const seoTitle = "차량 유지비 계산기 | 연간 정비·보험·세금 예산";
const seoDescription = "연 주행거리와 연식, 연료 종류를 기준으로 연간 차량 유지비를 계산합니다.";

const annualKm = ref(15_000);
const vehicleAge = ref(5);
const fuelType = ref<keyof typeof maintenanceProfiles>("gasoline");
const result = computed(() => calculateMaintenanceBudget({
  annualKm: annualKm.value,
  vehicleAge: vehicleAge.value,
  fuelType: fuelType.value,
}));

const chartSegments = computed(() => {
  const total = result.value.total || 1;
  return [
    { label: "소모품", value: result.value.consumables, pct: (result.value.consumables / total) * 100, color: "bg-fee" },
    { label: "오일", value: result.value.oil, pct: (result.value.oil / total) * 100, color: "bg-primary/70" },
    { label: "타이어", value: result.value.tires, pct: (result.value.tires / total) * 100, color: "bg-muted-foreground/50" },
    { label: "보험+세금", value: result.value.insurance + result.value.tax, pct: ((result.value.insurance + result.value.tax) / total) * 100, color: "bg-status-info/60" },
  ];
});
</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" />

  <div class="container space-y-5 py-5">
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">차량 유지비 계산기</h1>
        <FreshBadge :message="`${CAR_SERVICE_UPDATED_AT} 기준`" />
      </div>
      <div class="retro-panel-content grid gap-3 md:grid-cols-3">
        <label class="block space-y-1">
          <span class="text-caption font-semibold text-foreground">연 주행거리 (km)</span>
          <input v-model.number="annualKm" type="number" min="1000" class="retro-input" placeholder="연 주행거리" />
        </label>
        <label class="block space-y-1">
          <span class="text-caption font-semibold text-foreground">차량 연식 (년)</span>
          <input v-model.number="vehicleAge" type="number" min="0" max="20" class="retro-input" placeholder="차량 연식(년)" />
        </label>
        <label class="block space-y-1">
          <span class="text-caption font-semibold text-foreground">연료 종류</span>
          <select v-model="fuelType" class="retro-input">
            <option v-for="(item, key) in maintenanceProfiles" :key="key" :value="key">{{ item.label }}</option>
          </select>
        </label>
      </div>
    </div>

    <!-- 히어로: 연간 총 유지비 -->
    <div class="retro-panel overflow-hidden">
      <div class="space-y-1 bg-gradient-to-br from-primary via-primary to-primary/80 px-4 py-4 sm:px-5 sm:py-5">
        <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-white/80 sm:text-caption">연간 총 유지비</p>
        <p class="text-display font-bold leading-none tabular-nums text-white">{{ formatWon(result.total) }}</p>
      </div>
      <div class="grid grid-cols-2 divide-x divide-border/40">
        <div class="px-4 py-3 sm:px-5">
          <p class="text-[11px] font-semibold text-muted-foreground">월 평균</p>
          <p class="mt-1 text-heading font-bold tabular-nums text-foreground">{{ formatWon(result.monthlyAverage) }}</p>
        </div>
        <div class="px-4 py-3 sm:px-5">
          <p class="text-[11px] font-semibold text-muted-foreground">보험+세금</p>
          <p class="mt-1 text-heading font-bold tabular-nums text-foreground">{{ formatWon(result.insurance + result.tax) }}</p>
        </div>
      </div>
    </div>

    <!-- 비율 차트 -->
    <div class="space-y-3 rounded-2xl border border-border/60 bg-muted/20 p-4 shadow-sm">
      <p class="text-caption font-semibold text-foreground">비용 구성</p>
      <div class="flex h-5 gap-px overflow-hidden rounded-lg border border-border/40">
        <div
          v-for="seg in chartSegments"
          :key="seg.label"
          :class="seg.color"
          class="transition-all duration-300"
          :style="{ width: seg.pct + '%' }"
        />
      </div>
      <div class="grid grid-cols-2 gap-2 text-caption sm:grid-cols-4">
        <div v-for="seg in chartSegments" :key="seg.label" class="space-y-0.5">
          <span class="flex items-center gap-1.5">
            <span class="h-2.5 w-2.5 shrink-0 rounded-sm" :class="seg.color" />
            <span class="text-muted-foreground">{{ seg.label }}</span>
          </span>
          <span class="block font-semibold tabular-nums">{{ formatWon(seg.value) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
