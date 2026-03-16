<script setup lang="ts">
import { computed } from "vue";
import AdSlot from "@/components/common/AdSlot.vue";
import CompareSourceFooter from "@/components/common/CompareSourceFooter.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import SEOHead from "@/components/common/SEOHead.vue";
import ShareModal from "@/components/share/ShareModal.vue";
import SummaryBanner from "@/components/common/SummaryBanner.vue";
import InsuranceFAQ from "@/components/insurance/InsuranceFAQ.vue";
import InsuranceInput from "@/components/insurance/InsuranceInput.vue";
import InsuranceResult from "@/components/insurance/InsuranceResult.vue";
import { INSURANCE_DATA_UPDATED, INSURANCE_SOURCES } from "@/data/insuranceRates";
import { useInsuranceCalc } from "@/composables/useInsuranceCalc";
import { useShare } from "@/composables/useShare";
import { formatPercent, formatWon } from "@/lib/utils";

const seoTitle = "자동차보험 갱신 절약 시뮬레이터 — 할인 항목별 절감액";
const seoDescription =
  "마일리지, 블랙박스, 자기부담금, 다이렉트 전환까지 자동차보험 갱신 시 줄일 수 있는 비용을 한눈에 비교합니다.";

const faqItems = [
  {
    q: "현재 보험료를 그대로 넣어도 되나요?",
    a: "네. 현재 납부 중인 자동차보험료를 기준값으로 두고, 할인 특약을 더하면 얼마나 줄일 수 있는지 보는 구조입니다.",
  },
  {
    q: "무사고 할인은 실제 보험사마다 다른가요?",
    a: "실제 요율은 보험사와 계약 등급에 따라 다릅니다. 이 계산기는 공개된 예시 범위를 단순화해 대략적인 절감 폭을 보여줍니다.",
  },
  {
    q: "다이렉트 전환 절약액은 왜 별도 표시하나요?",
    a: "특약 할인과 다이렉트 할인은 성격이 다르기 때문입니다. 먼저 특약 적용 후, 추가로 다이렉트 전환 시 더 아낄 수 있는 금액을 따로 보여줍니다.",
  },
  {
    q: "블랙박스 할인은 연식이 오래된 차도 적용되나요?",
    a: "보험사별 조건이 달라 오래된 차량은 할인폭이 줄거나 제외될 수 있습니다. 계산기에서는 연식 13년 이상일 때 보수적으로 제외했습니다.",
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

const { form, result, shareQuery } = useInsuranceCalc();
const share = useShare({
  title: computed(() => `자동차보험 절약 시뮬레이터 | 예상 절약 ${formatWon(result.value.totalSavingsWithDirect)}`),
  description: seoDescription,
  summaryText: computed(
    () => `현재 보험료 ${formatWon(form.value.currentPremium)} → 다이렉트 포함 예상 ${formatWon(result.value.finalPremium)}`
  ),
  path: "/insurance",
  query: shareQuery,
});

const summaryFacts = computed(() => [
  { label: "특약 적용 후", value: formatWon(result.value.estimatedPremium) },
  { label: "다이렉트 포함", value: formatWon(result.value.finalPremium) },
  { label: "총 절감률", value: formatPercent(result.value.totalDiscountRate, 1) },
]);
</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" :json-ld="faqJsonLd" />

  <div class="container space-y-5 py-5">
    <SummaryBanner
      title="현재 보험료 기준으로 조정 가능한 할인 항목을 단계별로 적용한 결과입니다."
      leader-label="다이렉트 포함 예상 보험료"
      :leader-value="formatWon(result.finalPremium)"
      delta-label="바로 절약 가능한 금액"
      :delta-value="formatWon(result.totalSavingsWithDirect)"
      :facts="summaryFacts"
      show-share
      @share="share.openShare"
    />

    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">보험 갱신 절약 시뮬레이터</h1>
        <FreshBadge :message="`${INSURANCE_DATA_UPDATED} 기준`" />
      </div>
      <div class="retro-panel-content">
        <InsuranceInput v-model="form" />
      </div>
    </div>

    <InsuranceResult :result="result" @share="share.openShare" />
    <CompareSourceFooter :sources="INSURANCE_SOURCES" updated-at="2026-03-11" />
    <AdSlot slot="bottom" label="자동차보험 광고 영역" />
    <InsuranceFAQ :faqs="faqItems" />

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
