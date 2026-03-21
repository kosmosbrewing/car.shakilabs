<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Fuel, Zap, TrendingDown, BadgePercent, Car, UserRound, ArrowRightLeft } from "lucide-vue-next";
import FreshBadge from "@/components/common/FreshBadge.vue";
import SEOHead from "@/components/common/SEOHead.vue";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CAR_SERVICE_UPDATED_AT,
  EV_SUBSIDY_UPDATED,
  MODEL_PRESETS,
  REGIONAL_SUBSIDIES,
  EV_SUBSIDY_FAQS,
} from "@/data/ownershipData";
import { formatWon, formatWonShort } from "@/lib/utils";
import { compareEvVsGas, calculateEvSubsidy } from "@/utils/ownershipCalculator";

const seoTitle = "전기차 vs 내연기관 비교 + 보조금 계산기 | 2026";
const seoDescription =
  "전기차와 내연기관차 연간 비용 비교, 2026년 전기차 국고·지자체 보조금까지 한번에 계산합니다.";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: EV_SUBSIDY_FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

// ── EV vs Gas 비교 ──
const annualKm = ref(20_000);
const gasPrice = ref(1_700);
const electricityPrice = ref(180);
const gasEfficiency = ref(11);
const evKwhPerKm = ref(0.18);

const result = computed(() =>
  compareEvVsGas({
    annualKm: annualKm.value,
    gasPrice: gasPrice.value,
    electricityPrice: electricityPrice.value,
    gasEfficiency: gasEfficiency.value,
    evKwhPerKm: evKwhPerKm.value,
  })
);

const barSegments = computed(() => {
  const maxVal = Math.max(result.value.gasTotal, result.value.evTotal) || 1;
  return {
    gasPct: (result.value.gasTotal / maxVal) * 100,
    evPct: (result.value.evTotal / maxVal) * 100,
  };
});

// ── 보조금 계산기 ──
const vehiclePrice = ref(45_000_000);
const selectedModelIdx = ref(0);
const nationalSubsidy = ref<number>(MODEL_PRESETS[0].subsidy);
const selectedRegionIdx = ref(0);
const isYouth = ref(false);
const isConversion = ref(false);

// 모델 프리셋 변경 시 국고보조금 자동 반영
watch(selectedModelIdx, (idx) => {
  const preset = MODEL_PRESETS[idx];
  if (preset && preset.subsidy > 0) {
    nationalSubsidy.value = preset.subsidy;
  }
});

const subsidyResult = computed(() =>
  calculateEvSubsidy({
    vehiclePrice: vehiclePrice.value,
    nationalSubsidy: nationalSubsidy.value,
    localSubsidy: REGIONAL_SUBSIDIES[selectedRegionIdx.value].subsidy,
    isYouth: isYouth.value,
    isConversion: isConversion.value,
  })
);
</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" :json-ld="faqJsonLd" />

  <div class="container space-y-5 py-5">
    <!-- ===== EV vs Gas 비교 ===== -->
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

    <!-- 히어로: 비교 결과 -->
    <div class="retro-panel overflow-hidden">
      <div class="space-y-1 bg-gradient-to-br from-primary via-primary to-primary/80 px-4 py-4 sm:px-5 sm:py-5">
        <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-white/80 sm:text-caption">더 유리한 쪽</p>
        <p class="text-display font-bold leading-none text-white">{{ result.winner === "ev" ? "전기차" : "내연기관" }}</p>
      </div>
      <div class="flex items-center justify-between border-b border-border/40 px-4 py-3 sm:px-5">
        <span class="flex items-center gap-2 text-caption font-semibold text-muted-foreground">
          <span class="h-2 w-2 shrink-0 rounded-full bg-profit" />
          연간 절감 차이
        </span>
        <span class="inline-flex items-center rounded-full bg-profit/12 px-3 py-1 text-heading font-bold tabular-nums text-profit sm:text-h1">
          {{ formatWon(result.gap) }}
        </span>
      </div>
    </div>

    <div class="grid gap-3 md:grid-cols-2">
      <!-- 내연기관 카드 -->
      <div
        :class="[
          'overflow-hidden rounded-2xl border bg-card p-4 shadow-sm transition-all duration-200',
          result.winner === 'gas'
            ? 'border-profit/40 shadow-[0_0_0_1px_hsl(var(--profit)/0.15),0_4px_16px_-4px_hsl(var(--profit)/0.12)]'
            : 'border-border/70 hover:-translate-y-[1px] hover:border-primary/25'
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
        <span
          v-if="result.winner === 'gas'"
          class="mt-3 inline-flex items-center gap-1 rounded-full bg-profit px-2.5 py-0.5 text-[11px] font-semibold text-white"
        >
          <TrendingDown class="h-3 w-3" />
          더 유리
        </span>
      </div>

      <!-- 전기차 카드 -->
      <div
        :class="[
          'overflow-hidden rounded-2xl border bg-card p-4 shadow-sm transition-all duration-200',
          result.winner === 'ev'
            ? 'border-profit/40 shadow-[0_0_0_1px_hsl(var(--profit)/0.15),0_4px_16px_-4px_hsl(var(--profit)/0.12)]'
            : 'border-border/70 hover:-translate-y-[1px] hover:border-primary/25'
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
        <span
          v-if="result.winner === 'ev'"
          class="mt-3 inline-flex items-center gap-1 rounded-full bg-profit px-2.5 py-0.5 text-[11px] font-semibold text-white"
        >
          <TrendingDown class="h-3 w-3" />
          더 유리
        </span>
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

    <!-- ===== 전기차 보조금 계산기 ===== -->
    <div id="subsidy" class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h2 class="retro-title">2026 전기차 보조금 계산기</h2>
        <FreshBadge :message="`${EV_SUBSIDY_UPDATED} 기준`" />
      </div>
      <div class="retro-panel-content space-y-4">
        <div class="grid gap-3 md:grid-cols-2">
          <label class="block space-y-1">
            <span class="text-caption font-semibold text-foreground">차량 출고가 (원)</span>
            <input v-model.number="vehiclePrice" type="number" min="0" step="1000000" class="retro-input" placeholder="차량 출고가" />
          </label>
          <label class="block space-y-1">
            <span class="text-caption font-semibold text-foreground">차종 선택</span>
            <select v-model.number="selectedModelIdx" class="retro-input">
              <option v-for="(m, idx) in MODEL_PRESETS" :key="m.label" :value="idx">
                {{ m.label }}{{ m.subsidy > 0 ? ` (${formatWonShort(m.subsidy)})` : '' }}
              </option>
            </select>
          </label>
        </div>

        <div class="grid gap-3 md:grid-cols-2">
          <label class="block space-y-1">
            <span class="text-caption font-semibold text-foreground">국고보조금 (원)</span>
            <input v-model.number="nationalSubsidy" type="number" min="0" max="5800000" class="retro-input" placeholder="국고보조금" />
            <span class="text-[11px] text-muted-foreground">차종별 성능보조금 (최대 580만원)</span>
          </label>
          <label class="block space-y-1">
            <span class="text-caption font-semibold text-foreground">지자체</span>
            <select v-model.number="selectedRegionIdx" class="retro-input">
              <option v-for="(r, idx) in REGIONAL_SUBSIDIES" :key="r.key" :value="idx">
                {{ r.label }} ({{ formatWonShort(r.subsidy) }})
              </option>
            </select>
          </label>
        </div>

        <div class="flex flex-wrap gap-3">
          <label class="inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-caption transition-colors" :class="isYouth ? 'border-primary/50 bg-primary/8 text-primary' : 'border-border/60 text-muted-foreground'">
            <input v-model="isYouth" type="checkbox" class="sr-only" />
            <UserRound class="h-4 w-4" />
            <span class="font-semibold">청년 (19~34세) 생애 첫 차</span>
          </label>
          <label class="inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-caption transition-colors" :class="isConversion ? 'border-primary/50 bg-primary/8 text-primary' : 'border-border/60 text-muted-foreground'">
            <input v-model="isConversion" type="checkbox" class="sr-only" />
            <ArrowRightLeft class="h-4 w-4" />
            <span class="font-semibold">내연차 전환 (3년+ 폐차·매도)</span>
          </label>
        </div>
      </div>
    </div>

    <!-- 보조금 결과: 히어로 -->
    <div class="retro-panel overflow-hidden">
      <div class="space-y-1 bg-gradient-to-br from-primary via-primary to-primary/80 px-4 py-4 sm:px-5 sm:py-5">
        <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-white/80 sm:text-caption">보조금 적용 실구매가</p>
        <p class="text-display font-bold leading-none text-white">{{ formatWon(subsidyResult.effectivePrice) }}</p>
      </div>
      <div class="flex items-center justify-between border-b border-border/40 px-4 py-3 sm:px-5">
        <span class="flex items-center gap-2 text-caption font-semibold text-muted-foreground">
          <BadgePercent class="h-4 w-4" />
          총 보조금
        </span>
        <span class="inline-flex items-center rounded-full bg-profit/12 px-3 py-1 text-heading font-bold tabular-nums text-profit sm:text-h1">
          {{ formatWon(subsidyResult.totalSubsidy) }}
        </span>
      </div>
      <div v-if="subsidyResult.priceRate === 0" class="bg-destructive/8 px-4 py-3 text-caption font-semibold text-destructive sm:px-5">
        {{ subsidyResult.priceRateLabel }} — 보조금 대상에서 제외됩니다.
      </div>
      <div v-else-if="subsidyResult.priceRate < 1" class="bg-warning/8 px-4 py-3 text-caption font-semibold text-warning sm:px-5">
        {{ subsidyResult.priceRateLabel }}
      </div>
    </div>

    <!-- 보조금 상세 내역 -->
    <div class="space-y-2 rounded-2xl border border-border/60 bg-muted/20 p-4 shadow-sm">
      <p class="text-caption font-semibold text-foreground">보조금 상세 내역</p>
      <div class="divide-y divide-border/40">
        <div class="flex items-center justify-between py-2">
          <span class="flex items-center gap-2 text-caption text-muted-foreground">
            <Car class="h-4 w-4" />
            국고보조금 (가격 조정)
          </span>
          <span class="text-caption font-semibold tabular-nums">{{ formatWon(subsidyResult.adjustedNational) }}</span>
        </div>
        <div class="flex items-center justify-between py-2">
          <span class="flex items-center gap-2 text-caption text-muted-foreground">
            <BadgePercent class="h-4 w-4" />
            지자체 보조금 (가격 조정)
          </span>
          <span class="text-caption font-semibold tabular-nums">{{ formatWon(subsidyResult.adjustedLocal) }}</span>
        </div>
        <div v-if="subsidyResult.youthBonus > 0" class="flex items-center justify-between py-2">
          <span class="flex items-center gap-2 text-caption text-muted-foreground">
            <UserRound class="h-4 w-4" />
            청년 가산 (국고 20%)
          </span>
          <span class="text-caption font-semibold tabular-nums text-profit">+{{ formatWon(subsidyResult.youthBonus) }}</span>
        </div>
        <div v-if="subsidyResult.conversionBonus > 0" class="flex items-center justify-between py-2">
          <span class="flex items-center gap-2 text-caption text-muted-foreground">
            <ArrowRightLeft class="h-4 w-4" />
            전환지원금
          </span>
          <span class="text-caption font-semibold tabular-nums text-profit">+{{ formatWon(subsidyResult.conversionBonus) }}</span>
        </div>
        <div class="flex items-center justify-between py-2">
          <span class="text-caption font-bold text-foreground">총 보조금 합계</span>
          <span class="text-body font-bold tabular-nums text-profit">{{ formatWon(subsidyResult.totalSubsidy) }}</span>
        </div>
      </div>
    </div>

    <!-- FAQ -->
    <div class="space-y-3 rounded-2xl border border-border/60 bg-muted/20 p-4 shadow-sm">
      <p class="text-caption font-semibold text-foreground">자주 묻는 질문</p>
      <Accordion type="single" collapsible>
        <AccordionItem v-for="(faq, idx) in EV_SUBSIDY_FAQS" :key="idx" :value="`faq-${idx}`">
          <AccordionTrigger class="text-left text-caption font-semibold">{{ faq.q }}</AccordionTrigger>
          <AccordionContent class="text-caption text-muted-foreground">{{ faq.a }}</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  </div>
</template>
