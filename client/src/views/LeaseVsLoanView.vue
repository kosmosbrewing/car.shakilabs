<script setup lang="ts">
import { computed } from "vue";
import { Share2 } from "lucide-vue-next";
import AdSlot from "@/components/common/AdSlot.vue";
import AffiliateDisclosure from "@/components/common/AffiliateDisclosure.vue";
import AffiliateLinkPanel from "@/components/common/AffiliateLinkPanel.vue";
import CompareSourceFooter from "@/components/common/CompareSourceFooter.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import SEOHead from "@/components/common/SEOHead.vue";
import SeoRichGuide from "@/components/common/SeoRichGuide.vue";
import { CAR_LEASE_GUIDE } from "@/data/seoGuides";
import ShareModal from "@/components/share/ShareModal.vue";
import { leaseGuideItems } from "@/data/leaseGuide";
import LeaseCompareCards from "@/components/lease/LeaseCompareCards.vue";
import LeaseCompareInput from "@/components/lease/LeaseCompareInput.vue";
import LeaseCompareTable from "@/components/lease/LeaseCompareTable.vue";
import LeaseGuide from "@/components/lease/LeaseGuide.vue";
import { Button } from "@/components/ui/button";
import { carAffiliateItems } from "@/data/affiliateLinks";
import { LEASE_DATA_UPDATED, LEASE_SOURCES } from "@/data/leaseRates";
import { useLeaseCompare } from "@/composables/useLeaseCompare";
import { useShare } from "@/composables/useShare";
import { formatWon, formatManWon } from "@/lib/utils";

const props = defineProps<{ initialVehiclePrice?: number }>();
const amountLabel = computed(() => props.initialVehiclePrice ? formatManWon(props.initialVehiclePrice / 10000) : null);
const seoTitle = computed(() =>
  amountLabel.value
    ? `${amountLabel.value} 리스 vs 할부 vs 장기렌트 비교 | shakilabs.com/car`
    : "리스 vs 할부 vs 장기렌트 비교 — 계약기간 현금유출 비교",
);
const seoDescription = computed(() =>
  amountLabel.value
    ? `차량가 ${amountLabel.value}원 기준, 리스·할부·장기렌트 계약기간 현금유출과 월 납입금을 비교합니다.`
    : "같은 차를 리스·할부·장기렌트로 이용할 때 계약기간 동안 실제로 나가는 현금유출과 월 납입금 차이를 비교합니다.",
);

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

const override = props.initialVehiclePrice ? { vehiclePrice: props.initialVehiclePrice } : undefined;
const { form, result, shareQuery } = useLeaseCompare(override);
const share = useShare({
  title: computed(() => `${result.value.bestResult.label}가 가장 저렴합니다 | ${formatWon(result.value.bestResult.totalCost)}`),
  description: seoDescription.value,
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
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">리스 vs 할부 vs 장기렌트 비교</h1>
        <FreshBadge :message="`${LEASE_DATA_UPDATED} 기준`" />
      </div>
      <div class="retro-panel-content">
        <LeaseCompareInput v-model="form" />
      </div>
    </div>

    <div class="retro-panel overflow-hidden">
      <div class="space-y-1 bg-gradient-to-br from-primary via-primary to-primary/80 px-4 py-4 sm:px-5 sm:py-5">
        <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-white/80 sm:text-caption">현금유출이 가장 적은 방식</p>
        <p class="text-display font-bold leading-none text-white">{{ result.bestResult.label }}</p>
      </div>
      <div class="flex items-center justify-between border-b border-border/40 px-4 py-3 sm:px-5">
        <span class="flex items-center gap-2 text-caption font-semibold text-muted-foreground">
          <span class="h-2 w-2 shrink-0 rounded-full bg-muted-foreground" />
          최고/최저 차이
        </span>
        <span class="inline-flex items-center rounded-full bg-muted px-3 py-1 text-heading font-bold tabular-nums text-foreground sm:text-h1">
          {{ formatWon(result.spread) }}
        </span>
      </div>
      <div class="divide-y divide-border/40 sm:grid sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div v-for="fact in summaryFacts" :key="fact.label" class="px-4 py-3 sm:px-5">
          <p class="text-[11px] font-semibold text-muted-foreground">{{ fact.label }}</p>
          <p class="mt-1 text-heading font-bold tabular-nums text-foreground">{{ fact.value }}</p>
        </div>
      </div>
      <div class="space-y-3 border-t border-border/40 px-4 py-3 sm:px-5">
        <p class="text-caption leading-relaxed text-muted-foreground">
          계약기간 동안 실제로 빠져나가는 현금유출 기준입니다. 리스는 만기 반납 기준이며 잔존가치 인수비용은 총비용에 포함하지 않았습니다.
        </p>
        <Button type="button" variant="subtle" size="sm" @click="share.openShare">
          <Share2 class="h-3.5 w-3.5" />
          결과 공유하기
        </Button>
      </div>
    </div>

    <LeaseCompareCards :result="result" />
    <AffiliateLinkPanel
      title="차량 계약 전에 같이 확인해 볼 상품"
      description="차량 이용 방식 비교와 함께 블랙박스, 세차용품 예산도 미리 점검해 보세요."
      :items="carAffiliateItems"
    />
    <LeaseCompareTable :result="result" />
    <LeaseGuide />
    <CompareSourceFooter :sources="LEASE_SOURCES" updated-at="2026-03-11" />
    <div class="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3 text-caption text-muted-foreground">
      <p class="mb-2 font-semibold text-foreground">비교 기준</p>
      <p>• 리스: 만기 반납 기준 현금유출 비교, 잔존가치 인수비용 제외</p>
      <p>• 할부: 같은 기간 실제 납부액 기준, 차량 잔존가치는 비교에서 제외</p>
      <p>• 장기렌트: 보험·세금 포함 월 납입금 기준</p>
    </div>
    <AdSlot slot-id="bottom" label="자동차 금융 광고 영역" />
    <SeoRichGuide
      :title="CAR_LEASE_GUIDE.title"
      :intro="CAR_LEASE_GUIDE.intro"
      :sections="CAR_LEASE_GUIDE.sections"
      :checklist="CAR_LEASE_GUIDE.checklist"
      :faqs="CAR_LEASE_GUIDE.faqs"
      :disclaimer="CAR_LEASE_GUIDE.disclaimer"
    />
    <AffiliateDisclosure v-if="carAffiliateItems.length > 0" />

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
