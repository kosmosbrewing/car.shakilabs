<script setup lang="ts">
import { computed } from "vue";
import AdSlot from "@/components/common/AdSlot.vue";
import CompareSourceFooter from "@/components/common/CompareSourceFooter.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import SEOHead from "@/components/common/SEOHead.vue";
import ShareModal from "@/components/share/ShareModal.vue";
import SummaryBanner from "@/components/common/SummaryBanner.vue";
import CarTaxBreakdown from "@/components/car-tax/CarTaxBreakdown.vue";
import CarTaxFAQ from "@/components/car-tax/CarTaxFAQ.vue";
import CarTaxInput from "@/components/car-tax/CarTaxInput.vue";
import CarTaxResult from "@/components/car-tax/CarTaxResult.vue";
import { CAR_TAX_DATA_UPDATED, CAR_TAX_SOURCES } from "@/data/carTaxRates";
import { useCarTaxCalc } from "@/composables/useCarTaxCalc";
import { useShare } from "@/composables/useShare";
import { formatPercent, formatWon } from "@/lib/utils";

const seoTitle = "자동차 취등록세 계산기 — 신차·중고차 총비용";
const seoDescription =
  "신차·중고차 취등록세, 공채매입비, 부대비용을 한번에 계산합니다. 차종·지역·연식별 초기 등록비용을 빠르게 확인하세요.";

const faqItems = [
  {
    q: "중고차 취등록세는 왜 연식에 따라 줄어드나요?",
    a: "중고차는 경과연수별 잔존가치율을 적용해 과세표준을 낮춥니다. 그래서 같은 가격이라도 연식이 오래될수록 취득세가 줄어듭니다.",
  },
  {
    q: "경차는 항상 취득세가 0원인가요?",
    a: "경차는 취득세 75만원 한도까지 감면됩니다. 세액이 75만원을 넘으면 초과분만 부담합니다.",
  },
  {
    q: "공채비는 실제 납부액과 왜 다를 수 있나요?",
    a: "지역별 매입비율과 할인매각 손실률을 단순화한 추정값입니다. 실제 창구 할인율과 등록 대행 여부에 따라 달라질 수 있습니다.",
  },
  {
    q: "장애인 감면은 누구나 적용되나요?",
    a: "아닙니다. 실제로는 차량 종류와 등록 요건이 있습니다. 이 계산기는 대표 조건을 보수적으로 단순화한 참고용 시뮬레이터입니다.",
  },
  {
    q: "번호판 대행 수수료를 빼도 되나요?",
    a: "직접 등록하면 대행 수수료를 아낄 수 있습니다. 실제 등록 방식에 맞게 체크를 끄면 됩니다.",
  },
] as const;

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.a,
    },
  })),
};

const { form, result, shareQuery } = useCarTaxCalc();
const share = useShare({
  title: computed(() => `자동차 취등록세 계산기 | 총 ${formatWon(result.value.totalCost)}`),
  description: seoDescription,
  summaryText: computed(
    () => `차량가 ${formatWon(form.value.vehiclePrice)} 기준 예상 등록비용 ${formatWon(result.value.totalCost)}`
  ),
  path: "/tax",
  query: shareQuery,
});

const summaryFacts = computed(() => [
  { label: "취득세", value: formatWon(result.value.acquisitionTax) },
  { label: "공채비", value: formatWon(result.value.bondCost) },
  { label: "부대비용", value: formatWon(result.value.miscCost) },
]);
</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" :json-ld="faqJsonLd" />

  <div class="container space-y-5 py-5">
    <SummaryBanner
      title="차량가와 등록 지역 기준의 예상 초기 등록비용입니다."
      leader-label="예상 총 등록비용"
      :leader-value="formatWon(result.totalCost)"
      delta-label="차량가 대비 비중"
      :delta-value="formatPercent(result.totalCost / form.vehiclePrice, 1)"
      delta-tone="danger"
      :facts="summaryFacts"
      show-share
      @share="share.openShare"
    />

    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">자동차 취등록세 계산기</h1>
        <FreshBadge :message="`${CAR_TAX_DATA_UPDATED} 기준`" />
      </div>
      <div class="retro-panel-content">
        <CarTaxInput v-model="form" />
      </div>
    </div>

    <CarTaxResult :result="result" @share="share.openShare" />
    <CarTaxBreakdown :result="result" />
    <CompareSourceFooter :sources="CAR_TAX_SOURCES" updated-at="2026-03-11" />
    <AdSlot slot="top" label="자동차 금융 광고 영역" />
    <CarTaxFAQ :faqs="faqItems" />

    <ShareModal
      :show="share.showShareModal.value"
      :kakao-busy="share.kakaoBusy.value"
      :summary-text="share.shareSummary.value"
      @close="share.closeShare"
      @share-kakao="share.shareKakao"
      @copy-link="share.copyLink"
    />
  </div>
</template>
