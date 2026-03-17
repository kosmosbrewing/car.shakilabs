<script setup lang="ts">
import { computed, ref } from "vue";
import { Fuel, Zap, TrendingDown } from "lucide-vue-next";
import { Badge } from "@/components/ui/badge";
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

const barSegments = computed(() => {
  const maxVal = Math.max(result.value.gasTotal, result.value.evTotal) || 1;
  return {
    gasPct: (result.value.gasTotal / maxVal) * 100,
    evPct: (result.value.evTotal / maxVal) * 100,
  };
});
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
        <label class="block space-y-1">
          <span class="text-caption font-semibold text-foreground">연 주행거리 (km)</span>
          <input v-model.number="annualKm" type="number" min="1000" class="retro-input" placeholder="연 주행거리" />
        </label>
        <label class="block space-y-1">
          <span class="text-caption font-semibold text-foreground">휘발유 단가 (원/L)</span>
          <input v-model.number="gasPrice" type="number" min="1000" class="retro-input" placeholder="휘발유 단가" />
        </label>
        <label class="block space-y-1">
          <span class="text-caption font-semibold text-foreground">전기 단가 (원/kWh)</span>
          <input v-model.number="electricityPrice" type="number" min="100" class="retro-input" placeholder="전기 단가" />
        </label>
        <label class="block space-y-1">
          <span class="text-caption font-semibold text-foreground">내연기관 연비 (km/L)</span>
          <input v-model.number="gasEfficiency" type="number" min="5" step="0.1" class="retro-input" placeholder="내연기관 연비" />
        </label>
        <label class="block space-y-1 md:col-span-2">
          <span class="text-caption font-semibold text-foreground">전기차 전비 (kWh/km)</span>
          <input v-model.number="evKwhPerKm" type="number" min="0.08" step="0.01" class="retro-input" placeholder="전기차 전비(kWh/km)" />
        </label>
      </div>
    </div>

    <div class="grid gap-3 md:grid-cols-2">
      <!-- 내연기관 카드 -->
      <div
        :class="[
          'overflow-hidden rounded-2xl border bg-card p-4 shadow-sm transition-shadow duration-200',
          result.winner === 'gas'
            ? 'border-profit/40 shadow-[0_0_0_1px_hsl(var(--profit)/0.15),0_4px_16px_-4px_hsl(var(--profit)/0.12)]'
            : 'border-border/70'
        ]"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-tiny font-semibold text-muted-foreground">내연기관 연간 총비용</p>
            <p class="mt-2 text-h1 font-bold tabular-nums" :class="result.winner === 'gas' ? 'text-profit' : 'text-foreground'">
              {{ formatWon(result.gasTotal) }}
            </p>
            <p class="mt-1 text-tiny text-muted-foreground">연료비 {{ formatWon(result.gasFuel) }}</p>
          </div>
          <span
            class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
            :class="result.winner === 'gas' ? 'bg-profit/12 text-profit' : 'bg-muted text-muted-foreground'"
          >
            <Fuel class="h-5 w-5" />
          </span>
        </div>
        <Badge v-if="result.winner === 'gas'" variant="default" class="mt-3 rounded-full border-transparent bg-profit text-white">
          더 유리
        </Badge>
      </div>

      <!-- 전기차 카드 -->
      <div
        :class="[
          'overflow-hidden rounded-2xl border bg-card p-4 shadow-sm transition-shadow duration-200',
          result.winner === 'ev'
            ? 'border-profit/40 shadow-[0_0_0_1px_hsl(var(--profit)/0.15),0_4px_16px_-4px_hsl(var(--profit)/0.12)]'
            : 'border-border/70'
        ]"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-tiny font-semibold text-muted-foreground">전기차 연간 총비용</p>
            <p class="mt-2 text-h1 font-bold tabular-nums" :class="result.winner === 'ev' ? 'text-profit' : 'text-foreground'">
              {{ formatWon(result.evTotal) }}
            </p>
            <p class="mt-1 text-tiny text-muted-foreground">전기요금 {{ formatWon(result.evFuel) }}</p>
          </div>
          <span
            class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
            :class="result.winner === 'ev' ? 'bg-profit/12 text-profit' : 'bg-muted text-muted-foreground'"
          >
            <Zap class="h-5 w-5" />
          </span>
        </div>
        <Badge v-if="result.winner === 'ev'" variant="default" class="mt-3 rounded-full border-transparent bg-profit text-white">
          더 유리
        </Badge>
      </div>
    </div>

    <!-- 비교 바 차트 -->
    <div class="space-y-3 rounded-2xl border border-border/60 bg-muted/20 p-4 shadow-sm">
      <p class="text-caption font-semibold text-foreground">연간 비용 비교</p>
      <div class="space-y-2">
        <div class="space-y-1">
          <div class="flex items-center justify-between text-caption">
            <span class="flex items-center gap-1.5">
              <span class="h-2.5 w-2.5 shrink-0 rounded-sm bg-fee" />
              <span class="text-muted-foreground">내연기관</span>
            </span>
            <span class="font-semibold tabular-nums">{{ formatWon(result.gasTotal) }}</span>
          </div>
          <div class="h-4 w-full overflow-hidden rounded-lg bg-muted">
            <div class="h-full rounded-lg bg-fee transition-all duration-300" :style="{ width: barSegments.gasPct + '%' }" />
          </div>
        </div>
        <div class="space-y-1">
          <div class="flex items-center justify-between text-caption">
            <span class="flex items-center gap-1.5">
              <span class="h-2.5 w-2.5 shrink-0 rounded-sm bg-primary" />
              <span class="text-muted-foreground">전기차</span>
            </span>
            <span class="font-semibold tabular-nums">{{ formatWon(result.evTotal) }}</span>
          </div>
          <div class="h-4 w-full overflow-hidden rounded-lg bg-muted">
            <div class="h-full rounded-lg bg-primary transition-all duration-300" :style="{ width: barSegments.evPct + '%' }" />
          </div>
        </div>
      </div>
    </div>

    <!-- 결론 카드 -->
    <div class="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/8 p-4">
      <span class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
        <TrendingDown class="h-4 w-4" />
      </span>
      <p class="text-caption text-foreground">
        현재 입력 기준 더 유리한 쪽은
        <strong class="font-bold text-profit">{{ result.winner === "ev" ? "전기차" : "내연기관" }}</strong>이며
        연간 <strong class="font-bold tabular-nums text-profit">{{ formatWon(result.gap) }}</strong> 차이입니다.
      </p>
    </div>
  </div>
</template>
