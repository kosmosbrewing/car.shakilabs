<script setup lang="ts">
import { computed, ref } from "vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import SEOHead from "@/components/common/SEOHead.vue";
import SeoRichGuide from "@/components/common/SeoRichGuide.vue";
import BreakdownStackedBar from "@/components/result-visualization/BreakdownStackedBar.vue";
import { CAR_MAINTENANCE_GUIDE } from "@/data/seoGuides";
import { CAR_SERVICE_UPDATED_AT, maintenanceProfiles } from "@/data/ownershipData";
import { formatWon } from "@/lib/utils";
import { calculateMaintenanceBudget } from "@/utils/ownershipCalculator";
import CalculatorPageHeader from "@/components/car/CalculatorPageHeader.vue";

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
  return [
    { key: "consumables", label: "소모품", value: result.value.consumables, tone: "fee" as const },
    { key: "oil", label: "오일", value: result.value.oil, tone: "primary" as const },
    { key: "tires", label: "타이어", value: result.value.tires, tone: "muted" as const },
    { key: "fixed", label: "보험+세금", value: result.value.insurance + result.value.tax, tone: "info" as const },
  ];
});
</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" />

  <div class="container space-y-5 py-5">
    <CalculatorPageHeader title="차량 유지비 계산기" />

    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h2 class="retro-title">유지비 조건 입력</h2>
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
        <p class="car-result-amount font-bold tabular-nums text-white">{{ formatWon(result.total) }}</p>
      </div>
      <div class="maintenance-metric-grid grid grid-cols-2 divide-x divide-border/40">
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

    <BreakdownStackedBar label="연간 유지비 구성" :segments="chartSegments" :format-value="formatWon" />

    <SeoRichGuide
      :title="CAR_MAINTENANCE_GUIDE.title"
      :intro="CAR_MAINTENANCE_GUIDE.intro"
      :sections="CAR_MAINTENANCE_GUIDE.sections"
      :checklist="CAR_MAINTENANCE_GUIDE.checklist"
      :faqs="CAR_MAINTENANCE_GUIDE.faqs"
      :disclaimer="CAR_MAINTENANCE_GUIDE.disclaimer"
    />
  </div>
</template>
