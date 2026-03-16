<script setup lang="ts">
import { computed } from "vue";
import AdSlot from "@/components/common/AdSlot.vue";
import CompareSourceFooter from "@/components/common/CompareSourceFooter.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import SEOHead from "@/components/common/SEOHead.vue";
import ShareModal from "@/components/share/ShareModal.vue";
import SummaryBanner from "@/components/common/SummaryBanner.vue";
import { leaseGuideItems } from "@/data/leaseGuide";
import LeaseCompareCards from "@/components/lease/LeaseCompareCards.vue";
import LeaseCompareInput from "@/components/lease/LeaseCompareInput.vue";
import LeaseCompareTable from "@/components/lease/LeaseCompareTable.vue";
import LeaseGuide from "@/components/lease/LeaseGuide.vue";
import { LEASE_DATA_UPDATED, LEASE_SOURCES } from "@/data/leaseRates";
import { useLeaseCompare } from "@/composables/useLeaseCompare";
import { useShare } from "@/composables/useShare";
import { formatWon } from "@/lib/utils";

const seoTitle = "리스 vs 할부 vs 장기렌트 비교 — 계약기간 현금유출 비교";
const seoDescription =
  "같은 차를 리스·할부·장기렌트로 이용할 때 계약기간 동안 실제로 나가는 현금유출과 월 납입금 차이를 비교합니다.";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: leaseGuideItems.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.a,
    },
  })),
};

const { form, result, shareQuery } = useLeaseCompare();
const share = useShare({
  title: computed(() => `${result.value.bestResult.label}가 가장 저렴합니다 | ${formatWon(result.value.bestResult.totalCost)}`),
  description: seoDescription,
  summaryText: computed(
    () => `${result.value.bestResult.label} 총비용 ${formatWon(result.value.bestResult.totalCost)} · 최고/최저 차이 ${formatWon(result.value.spread)}`
  ),
  path: "/lease-vs-loan",
  query: shareQuery,
});

const summaryFacts = computed(() => [
  { label: "최저 총비용", value: formatWon(result.value.bestResult.totalCost) },
  { label: "월 납입금", value: formatWon(result.value.bestResult.monthlyPayment) },
  { label: "2위와 차이", value: formatWon(result.value.runnerUpGap) },
]);
</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" :json-ld="faqJsonLd" />

  <div class="container space-y-5 py-5">
    <SummaryBanner
      title="계약기간 동안 실제로 빠져나가는 현금유출 기준입니다. 리스는 만기 반납 기준이며 잔존가치 인수비용은 총비용에 포함하지 않았습니다."
      leader-label="현금유출이 가장 적은 방식"
      :leader-value="result.bestResult.label"
      delta-label="최고/최저 차이"
      :delta-value="formatWon(result.spread)"
      delta-tone="neutral"
      :facts="summaryFacts"
      show-share
      @share="share.openShare"
    />

    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">리스 vs 할부 vs 장기렌트 비교</h1>
        <FreshBadge :message="`${LEASE_DATA_UPDATED} 기준`" />
      </div>
      <div class="retro-panel-content">
        <LeaseCompareInput v-model="form" />
      </div>
    </div>

    <LeaseCompareCards :result="result" />
    <LeaseCompareTable :result="result" />
    <LeaseGuide />
    <CompareSourceFooter :sources="LEASE_SOURCES" updated-at="2026-03-11" />
    <div class="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3 text-caption text-muted-foreground">
      <p class="mb-2 font-semibold text-foreground">비교 기준</p>
      <p>• 리스: 만기 반납 기준 현금유출 비교, 잔존가치 인수비용 제외</p>
      <p>• 할부: 같은 기간 실제 납부액 기준, 차량 잔존가치는 비교에서 제외</p>
      <p>• 장기렌트: 보험·세금 포함 월 납입금 기준</p>
    </div>
    <AdSlot slot="bottom" label="자동차 금융 광고 영역" />

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
