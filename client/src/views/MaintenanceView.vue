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
        <input v-model.number="annualKm" type="number" min="1000" class="retro-input" placeholder="연 주행거리" />
        <input v-model.number="vehicleAge" type="number" min="0" max="20" class="retro-input" placeholder="차량 연식(년)" />
        <select v-model="fuelType" class="retro-input">
          <option v-for="(item, key) in maintenanceProfiles" :key="key" :value="key">{{ item.label }}</option>
        </select>
      </div>
    </div>

    <div class="grid gap-3 md:grid-cols-3">
      <div class="retro-panel-muted px-4 py-4">
        <p class="text-tiny text-muted-foreground">연간 총 유지비</p>
        <p class="mt-2 text-h2 font-bold text-primary">{{ formatWon(result.total) }}</p>
      </div>
      <div class="retro-panel-muted px-4 py-4">
        <p class="text-tiny text-muted-foreground">월 평균</p>
        <p class="mt-2 text-h2 font-bold text-foreground">{{ formatWon(result.monthlyAverage) }}</p>
      </div>
      <div class="retro-panel-muted px-4 py-4">
        <p class="text-tiny text-muted-foreground">보험+세금</p>
        <p class="mt-2 text-h2 font-bold text-foreground">{{ formatWon(result.insurance + result.tax) }}</p>
      </div>
    </div>

    <div class="retro-panel px-4 py-4 text-caption leading-relaxed text-foreground">
      소모품 {{ formatWon(result.consumables) }}, 오일 {{ formatWon(result.oil) }}, 타이어 {{ formatWon(result.tires) }}를 포함한 추정치입니다.
    </div>
  </div>
</template>
