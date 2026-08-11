<script setup lang="ts">
import { computed, ref } from "vue";
import { ParkingSquare, Trophy } from "lucide-vue-next";
import FreshBadge from "@/components/common/FreshBadge.vue";
import SEOHead from "@/components/common/SEOHead.vue";
import CalculatorInteractionTracker from "@/components/analytics/CalculatorInteractionTracker.vue";
import SeoRichGuide from "@/components/common/SeoRichGuide.vue";
import RankedBars from "@/components/result-visualization/RankedBars.vue";
import { CAR_PARKING_GUIDE } from "@/data/seoGuides";
import { CAR_SERVICE_UPDATED_AT } from "@/data/ownershipData";
import { formatWon } from "@/lib/utils";
import { compareParkingOptions, PARKING_DAILY_CAP, PARKING_INPUT_LIMITS } from "@/utils/ownershipCalculator";
import CalculatorPageHeader from "@/components/car/CalculatorPageHeader.vue";
import { useSafeCalculation } from "@/composables/useSafeCalculation";

const seoTitle = "주차비 비교 계산기 | 시간권·일 최대요금·월주차 비교";
const seoDescription = "월 주차 일수와 시간당 요금을 넣으면 어떤 주차 방식이 가장 저렴한지 계산합니다.";

const daysPerMonth = ref(20);
const hoursPerDay = ref(8);
const hourlyRate = ref(2_000);
const monthlyPass = ref(180_000);

const { result, validationError } = useSafeCalculation(
  () => compareParkingOptions({
    daysPerMonth: daysPerMonth.value,
    hoursPerDay: hoursPerDay.value,
    hourlyRate: hourlyRate.value,
    monthlyPass: monthlyPass.value,
  }),
  compareParkingOptions({ daysPerMonth: 20, hoursPerDay: 8, hourlyRate: 2_000, monthlyPass: 180_000 }),
);
const costItems = computed(() => result.value.items.map((item) => ({
  key: item.key,
  label: item.label,
  value: item.total,
  highlight: item.key === result.value.bestOption.key,
})));

const dailyHourlyCost = computed(() => hoursPerDay.value * hourlyRate.value);
const cappedDailyCost = computed(() => Math.min(dailyHourlyCost.value, PARKING_DAILY_CAP));

// 월주차권이 시간권보다 싸지는 최소 주차 일수. 하루 요금이 0이면 판단 불가.
const breakEvenDays = computed(() => {
  const daily = cappedDailyCost.value;
  if (!Number.isFinite(daily) || daily <= 0) return null;
  return Math.ceil(monthlyPass.value / daily);
});
</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" />

  <div class="container space-y-5 py-5">
    <CalculatorPageHeader title="주차비 비교 계산기" />

    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h2 class="retro-title">주차 조건 입력</h2>
        <FreshBadge :message="`${CAR_SERVICE_UPDATED_AT} 기준`" />
      </div>
      <CalculatorInteractionTracker calculator-id="parking" page-path="/car/parking">
      <div class="retro-panel-content grid gap-3 md:grid-cols-2" role="group" :aria-describedby="validationError ? 'parking-error' : undefined">
        <label class="block space-y-1">
          <span class="text-caption font-semibold text-foreground">월 주차 일수</span>
          <input
            v-model.number="daysPerMonth"
            type="number"
            :min="PARKING_INPUT_LIMITS.daysPerMonth.min"
            :max="PARKING_INPUT_LIMITS.daysPerMonth.max"
            class="retro-input"
            placeholder="월 주차 일수"
          />
        </label>
        <label class="block space-y-1">
          <span class="text-caption font-semibold text-foreground">하루 주차 시간</span>
          <input
            v-model.number="hoursPerDay"
            type="number"
            :min="PARKING_INPUT_LIMITS.hoursPerDay.min"
            :max="PARKING_INPUT_LIMITS.hoursPerDay.max"
            class="retro-input"
            placeholder="하루 주차 시간"
          />
        </label>
        <label class="block space-y-1">
          <span class="text-caption font-semibold text-foreground">시간당 요금 (원)</span>
          <input
            v-model.number="hourlyRate"
            type="number"
            :min="PARKING_INPUT_LIMITS.hourlyRate.min"
            :max="PARKING_INPUT_LIMITS.hourlyRate.max"
            class="retro-input"
            placeholder="시간당 요금"
          />
        </label>
        <label class="block space-y-1">
          <span class="text-caption font-semibold text-foreground">월주차 요금 (원)</span>
          <input
            v-model.number="monthlyPass"
            type="number"
            :min="PARKING_INPUT_LIMITS.monthlyPass.min"
            :max="PARKING_INPUT_LIMITS.monthlyPass.max"
            class="retro-input"
            placeholder="월주차 요금"
          />
        </label>
        <p v-if="validationError" id="parking-error" class="text-caption font-semibold text-destructive md:col-span-2" role="alert">
          {{ validationError }}
        </p>
      </div>
      </CalculatorInteractionTracker>
    </div>

    <!-- 히어로: 최저 비용 결론 -->
    <div class="retro-panel overflow-hidden">
      <div class="space-y-1 bg-primary px-4 py-4 sm:px-5 sm:py-5">
        <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-foreground/80 sm:text-caption">가장 저렴한 방식</p>
        <p class="text-display font-bold leading-none text-primary-foreground">{{ result.bestOption.label }}</p>
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

    <RankedBars
      title="주차 방식별 월 비용"
      note="동일한 이용 일수와 시간 기준이며 막대가 짧을수록 예상 월 비용이 낮습니다."
      :items="costItems"
      :format-value="formatWon"
    />

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
          class="mt-3 inline-flex items-center gap-1 rounded-full bg-profit px-2.5 py-0.5 text-[11px] font-semibold text-profit-foreground"
        >
          <Trophy class="h-3 w-3" />
          가장 저렴
        </span>
      </div>
    </div>

    <!-- 계산 근거 공개: 세 방식의 산식과 일 최대요금 상한을 화면에서 밝힌다.
         상한 금액은 계산 모듈이 export하는 PARKING_DAILY_CAP을 그대로 렌더한다 —
         로직만 고치고 설명이 남는 사고를 막으려면 화면에 숫자를 다시 적으면 안 된다. -->
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h2 class="retro-title">이 결과는 이렇게 계산했습니다</h2>
      </div>
      <div class="retro-panel-content space-y-3">
        <p class="text-body text-muted-foreground">
          같은 주차 습관을 세 가지 요금제로 각각 환산해 월 비용을 비교합니다.
          입력한 조건은 월 {{ daysPerMonth }}일 · 하루 {{ hoursPerDay }}시간 · 시간당 {{ formatWon(hourlyRate) }}이며,
          이때 하루 시간권 요금은 {{ formatWon(dailyHourlyCost) }}입니다.
        </p>
        <ul class="list-inside list-disc space-y-1 text-body text-muted-foreground">
          <li>
            <span class="font-semibold text-foreground">시간권</span> — 하루 주차 시간 × 시간당 요금 × 월 주차 일수.
            상한 없이 세운 시간만큼 그대로 누적한 경우입니다.
          </li>
          <li>
            <span class="font-semibold text-foreground">일 최대요금</span> — 하루 요금에
            {{ formatWon(PARKING_DAILY_CAP) }}의 상한을 적용한 뒤 월 주차 일수를 곱합니다.
            입력 조건에서는 하루 {{ formatWon(cappedDailyCost) }}이 적용됐습니다.
            상한 금액은 주차장마다 다르므로 실제 안내판의 일 최대요금과 비교해 보세요.
          </li>
          <li>
            <span class="font-semibold text-foreground">월주차</span> — 이용 일수와 무관한 정액 월정기권 요금입니다.
          </li>
        </ul>
        <p v-if="breakEvenDays" class="text-body text-muted-foreground">
          월주차 요금 {{ formatWon(monthlyPass) }}을 하루 {{ formatWon(cappedDailyCost) }}(상한 적용 후)으로 나누면
          손익분기는 <span class="font-semibold text-foreground">월 {{ breakEvenDays }}일</span>입니다.
          실제로 차를 세우는 날이 이보다 적으면 정기권을 끊지 않는 편이 유리하고, 많으면 정기권이 유리합니다.
          휴가·출장·재택으로 세우지 않는 날을 빼고 세어 보세요.
        </p>
        <p class="text-caption text-muted-foreground">
          경차·전기차는 공영주차장에서 50% 감면을 받는 경우가 많고, 다자녀·장애인 감면이 중복 적용되는 지자체도 있습니다.
          감면 대상이라면 위 결과에서 해당 비율만큼 낮춰 해석하세요.
        </p>
      </div>
    </div>

    <SeoRichGuide
      :title="CAR_PARKING_GUIDE.title"
      :intro="CAR_PARKING_GUIDE.intro"
      :sections="CAR_PARKING_GUIDE.sections"
      :faqs="CAR_PARKING_GUIDE.faqs"
      :disclaimer="CAR_PARKING_GUIDE.disclaimer"
    />
  </div>
</template>
