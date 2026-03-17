<script setup lang="ts">
import { computed, ref } from "vue";
import { ParkingSquare, Trophy } from "lucide-vue-next";
import FreshBadge from "@/components/common/FreshBadge.vue";
import SEOHead from "@/components/common/SEOHead.vue";
import { CAR_SERVICE_UPDATED_AT } from "@/data/ownershipData";
import { formatWon } from "@/lib/utils";
import { compareParkingOptions } from "@/utils/ownershipCalculator";

const seoTitle = "주차비 비교 계산기 | 시간권·일 최대요금·월주차 비교";
const seoDescription = "월 주차 일수와 시간당 요금을 넣으면 어떤 주차 방식이 가장 저렴한지 계산합니다.";

const daysPerMonth = ref(20);
const hoursPerDay = ref(8);
const hourlyRate = ref(2_000);
const monthlyPass = ref(180_000);

const result = computed(() => compareParkingOptions({
  daysPerMonth: daysPerMonth.value,
  hoursPerDay: hoursPerDay.value,
  hourlyRate: hourlyRate.value,
  monthlyPass: monthlyPass.value,
}));
</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" />

  <div class="container space-y-5 py-5">
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">주차비 비교 계산기</h1>
        <FreshBadge :message="`${CAR_SERVICE_UPDATED_AT} 기준`" />
      </div>
      <div class="retro-panel-content grid gap-3 md:grid-cols-2">
        <label class="block space-y-1">
          <span class="text-caption font-semibold text-foreground">월 주차 일수</span>
          <input v-model.number="daysPerMonth" type="number" min="1" max="31" class="retro-input" placeholder="월 주차 일수" />
        </label>
        <label class="block space-y-1">
          <span class="text-caption font-semibold text-foreground">하루 주차 시간</span>
          <input v-model.number="hoursPerDay" type="number" min="1" max="24" class="retro-input" placeholder="하루 주차 시간" />
        </label>
        <label class="block space-y-1">
          <span class="text-caption font-semibold text-foreground">시간당 요금 (원)</span>
          <input v-model.number="hourlyRate" type="number" min="500" class="retro-input" placeholder="시간당 요금" />
        </label>
        <label class="block space-y-1">
          <span class="text-caption font-semibold text-foreground">월주차 요금 (원)</span>
          <input v-model.number="monthlyPass" type="number" min="0" class="retro-input" placeholder="월주차 요금" />
        </label>
      </div>
    </div>

    <!-- 히어로: 최저 비용 결론 -->
    <div class="retro-panel overflow-hidden">
      <div class="space-y-1 bg-gradient-to-br from-primary via-primary to-primary/80 px-4 py-4 sm:px-5 sm:py-5">
        <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-white/80 sm:text-caption">가장 저렴한 방식</p>
        <p class="text-display font-bold leading-none text-white">{{ result.bestOption.label }}</p>
      </div>
      <div class="flex items-center justify-between border-b border-border/40 px-4 py-3 sm:px-5">
        <span class="flex items-center gap-2 text-caption font-semibold text-muted-foreground">
          <span class="h-2 w-2 shrink-0 rounded-full bg-profit" />
          최고/최저 차이
        </span>
        <span class="inline-flex items-center rounded-full bg-profit/12 px-3 py-1 text-heading font-bold tabular-nums text-profit sm:text-h1">
          {{ formatWon(result.spread) }}
        </span>
      </div>
    </div>

    <div class="grid gap-3 md:grid-cols-3">
      <div
        v-for="item in result.items"
        :key="item.key"
        :class="[
          'overflow-hidden rounded-2xl border bg-card p-4 shadow-sm transition-all duration-200',
          item.key === result.bestOption.key
            ? 'border-profit/40 shadow-[0_0_0_1px_hsl(var(--profit)/0.15),0_4px_16px_-4px_hsl(var(--profit)/0.12)]'
            : 'border-border/70 hover:-translate-y-[1px] hover:border-primary/25'
        ]"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-tiny font-semibold text-muted-foreground">{{ item.label }}</p>
            <p
              class="mt-2 text-h1 font-bold tabular-nums"
              :class="item.key === result.bestOption.key ? 'text-profit' : 'text-foreground'"
            >
              {{ formatWon(item.total) }}
            </p>
          </div>
          <span
            class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
            :class="item.key === result.bestOption.key ? 'bg-profit/12 text-profit' : 'bg-muted text-muted-foreground'"
          >
            <Trophy v-if="item.key === result.bestOption.key" class="h-5 w-5" />
            <ParkingSquare v-else class="h-5 w-5" />
          </span>
        </div>
        <span
          v-if="item.key === result.bestOption.key"
          class="mt-3 inline-flex items-center gap-1 rounded-full bg-profit px-2.5 py-0.5 text-[11px] font-semibold text-white"
        >
          <Trophy class="h-3 w-3" />
          가장 저렴
        </span>
      </div>
    </div>
  </div>
</template>
