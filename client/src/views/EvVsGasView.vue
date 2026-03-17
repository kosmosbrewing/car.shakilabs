<script setup lang="ts">
import { computed, ref } from "vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import SEOHead from "@/components/common/SEOHead.vue";
import { CAR_SERVICE_UPDATED_AT } from "@/data/ownershipData";
import { formatWon } from "@/lib/utils";
import { compareEvVsGas } from "@/utils/ownershipCalculator";

const seoTitle = "전기차 vs 내연기관 비교 | 연간 연료비와 유지비 차이";
const seoDescription = "연 주행거리와 연료 단가를 기준으로 전기차와 내연기관차의 연간 총비용을 비교합니다.";

const annualKm = ref(20_000);
const gasPrice = ref(1_700);
const electricityPrice = ref(180);
const gasEfficiency = ref(11);
const evKwhPerKm = ref(0.18);

const result = computed(() => compareEvVsGas({
  annualKm: annualKm.value,
  gasPrice: gasPrice.value,
  electricityPrice: electricityPrice.value,
  gasEfficiency: gasEfficiency.value,
  evKwhPerKm: evKwhPerKm.value,
}));
</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" />

  <div class="container space-y-5 py-5">
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">전기차 vs 내연기관 비교</h1>
        <FreshBadge :message="`${CAR_SERVICE_UPDATED_AT} 기준`" />
      </div>
      <div class="retro-panel-content grid gap-3 md:grid-cols-3">
        <input v-model.number="annualKm" type="number" min="1000" class="retro-input" placeholder="연 주행거리" />
        <input v-model.number="gasPrice" type="number" min="1000" class="retro-input" placeholder="휘발유 단가" />
        <input v-model.number="electricityPrice" type="number" min="100" class="retro-input" placeholder="전기 단가" />
        <input v-model.number="gasEfficiency" type="number" min="5" step="0.1" class="retro-input" placeholder="내연기관 연비" />
        <input v-model.number="evKwhPerKm" type="number" min="0.08" step="0.01" class="retro-input md:col-span-2" placeholder="전기차 전비(kWh/km)" />
      </div>
    </div>

    <div class="grid gap-3 md:grid-cols-2">
      <div class="retro-panel-muted px-4 py-4">
        <p class="text-tiny text-muted-foreground">내연기관 연간 총비용</p>
        <p class="mt-2 text-h2 font-bold text-foreground">{{ formatWon(result.gasTotal) }}</p>
        <p class="mt-1 text-tiny text-muted-foreground">연료비 {{ formatWon(result.gasFuel) }}</p>
      </div>
      <div class="retro-panel-muted px-4 py-4">
        <p class="text-tiny text-muted-foreground">전기차 연간 총비용</p>
        <p class="mt-2 text-h2 font-bold text-primary">{{ formatWon(result.evTotal) }}</p>
        <p class="mt-1 text-tiny text-muted-foreground">전기요금 {{ formatWon(result.evFuel) }}</p>
      </div>
    </div>

    <div class="retro-panel px-4 py-4 text-caption text-foreground">
      현재 입력 기준 더 유리한 쪽은 {{ result.winner === "ev" ? "전기차" : "내연기관" }}이며 연간 {{ formatWon(result.gap) }} 차이입니다.
    </div>
  </div>
</template>
