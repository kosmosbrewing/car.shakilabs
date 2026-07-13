<script setup lang="ts">
import { ref, watch } from "vue";
import { BadgePercent, Car, UserRound, ArrowRightLeft } from "lucide-vue-next";
import FreshBadge from "@/components/common/FreshBadge.vue";
import SEOHead from "@/components/common/SEOHead.vue";
import FaqAccordionPanel from "@/components/common/FaqAccordionPanel.vue";
import SeoRichGuide from "@/components/common/SeoRichGuide.vue";
import EvAnnualCostComparison from "@/components/ownership/EvAnnualCostComparison.vue";
import { CAR_EV_VS_GAS_GUIDE } from "@/data/seoGuides";
import {
  CAR_SERVICE_UPDATED_AT,
  EV_SUBSIDY_UPDATED,
  EV_SUBSIDY_SOURCE_URL,
  MODEL_PRESETS,
  REGIONAL_SUBSIDIES,
  EV_SUBSIDY_FAQS,
} from "@/data/ownershipData";
import { formatWon, formatWonShort } from "@/lib/utils";
import { compareEvVsGas, calculateEvSubsidy } from "@/utils/ownershipCalculator";
import CalculatorPageHeader from "@/components/car/CalculatorPageHeader.vue";
import { useSafeCalculation } from "@/composables/useSafeCalculation";

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

const annualKm = ref(20_000);
const gasPrice = ref(1_700);
const electricityPrice = ref(180);
const gasEfficiency = ref(11);
const evKwhPerKm = ref(0.18);

const { result, validationError } = useSafeCalculation(
  () => compareEvVsGas({
    annualKm: annualKm.value,
    gasPrice: gasPrice.value,
    electricityPrice: electricityPrice.value,
    gasEfficiency: gasEfficiency.value,
    evKwhPerKm: evKwhPerKm.value,
  }),
  compareEvVsGas({ annualKm: 20_000, gasPrice: 1_700, electricityPrice: 180, gasEfficiency: 11, evKwhPerKm: 0.18 }),
);

// ── 보조금 계산기 ──
const vehiclePrice = ref(45_000_000);
const selectedModelIdx = ref(0);
const nationalSubsidy = ref<number>(MODEL_PRESETS[0].subsidy);
const selectedRegionIdx = ref(0);
const isYouth = ref(false);
const isConversion = ref(false);

watch(selectedModelIdx, (idx) => {
  const preset = MODEL_PRESETS[idx];
  if (preset && preset.subsidy > 0) {
    nationalSubsidy.value = preset.subsidy;
  }
});

const { result: subsidyResult, validationError: subsidyValidationError } = useSafeCalculation(
  () => calculateEvSubsidy({
    vehiclePrice: vehiclePrice.value,
    nationalSubsidy: nationalSubsidy.value,
    localSubsidy: REGIONAL_SUBSIDIES[selectedRegionIdx.value]?.subsidy ?? REGIONAL_SUBSIDIES[0].subsidy,
    isYouth: isYouth.value,
    isConversion: isConversion.value,
  }),
  calculateEvSubsidy({ vehiclePrice: 45_000_000, nationalSubsidy: MODEL_PRESETS[0].subsidy, localSubsidy: REGIONAL_SUBSIDIES[0].subsidy, isYouth: false, isConversion: false }),
);
</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" :json-ld="faqJsonLd" />

  <div class="container space-y-5 py-5">
    <CalculatorPageHeader title="전기차·내연기관 비교" />

    <!-- ===== EV vs Gas 비교 ===== -->
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h2 class="retro-title">주행 조건 입력</h2>
        <FreshBadge :message="`${CAR_SERVICE_UPDATED_AT} 기준`" />
      </div>
      <div class="retro-panel-content grid gap-3 md:grid-cols-3" role="group" :aria-describedby="validationError ? 'ev-gas-error' : undefined">
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
        <p v-if="validationError" id="ev-gas-error" class="text-caption font-semibold text-destructive md:col-span-3" role="alert">
          {{ validationError }}
        </p>
      </div>
    </div>

    <EvAnnualCostComparison :result="result" />

    <div id="subsidy" class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h2 class="retro-title">2026 전기차 보조금 계산기</h2>
        <FreshBadge :message="`${EV_SUBSIDY_UPDATED} 기준`" />
      </div>
      <div class="retro-panel-content space-y-4" role="group" :aria-describedby="subsidyValidationError ? 'ev-subsidy-error' : undefined">
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
        <p class="text-[11px] leading-relaxed text-muted-foreground">
          지자체 금액은 차종·시군구·접수 시점에 따라 달라집니다. 범위가 있는 지역은 보수적으로 최솟값을 적용했으며,
          최종 신청 전
          <a :href="EV_SUBSIDY_SOURCE_URL" target="_blank" rel="noopener noreferrer" class="retro-link">무공해차 통합누리집</a>에서 확인하세요.
        </p>
        <p v-if="subsidyValidationError" id="ev-subsidy-error" class="text-caption font-semibold text-destructive" role="alert">
          {{ subsidyValidationError }}
        </p>
      </div>
    </div>

    <div class="retro-panel overflow-hidden">
      <div class="space-y-1 bg-gradient-to-br from-primary via-primary to-primary/80 px-4 py-4 sm:px-5 sm:py-5">
        <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-white/80 sm:text-caption">보조금 적용 실구매가</p>
        <p class="car-result-amount font-bold text-white tabular-nums">{{ formatWon(subsidyResult.effectivePrice) }}</p>
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

    <FaqAccordionPanel :items="EV_SUBSIDY_FAQS" />

    <SeoRichGuide
      :title="CAR_EV_VS_GAS_GUIDE.title"
      :intro="CAR_EV_VS_GAS_GUIDE.intro"
      :sections="CAR_EV_VS_GAS_GUIDE.sections"
      :faqs="CAR_EV_VS_GAS_GUIDE.faqs"
      :disclaimer="CAR_EV_VS_GAS_GUIDE.disclaimer"
    />
  </div>
</template>
