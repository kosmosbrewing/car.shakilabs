<script setup lang="ts">
import { computed } from "vue";
import { mergeFaqs } from "@/lib/faqMerge";
import { ShCalculatorSplit, ShPairRow } from "@shakilabs/ui";
import { Share2 } from "lucide-vue-next";
import CalculatorInteractionTracker from "@/components/analytics/CalculatorInteractionTracker.vue";
import CountUpAmount from "@/components/common/CountUpAmount.vue";
import AdSlot from "@/components/common/AdSlot.vue";
import AffiliateDisclosure from "@/components/common/AffiliateDisclosure.vue";
import AffiliateLinkPanel from "@/components/common/AffiliateLinkPanel.vue";
import CompareSourceFooter from "@/components/common/CompareSourceFooter.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import SEOHead from "@/components/common/SEOHead.vue";
import SeoRichGuide from "@/components/common/SeoRichGuide.vue";
import GapBars from "@/components/result-visualization/GapBars.vue";
import { CAR_LEASE_GUIDE } from "@/data/seoGuides";
import ShareModal from "@/components/share/ShareModal.vue";
import { leaseGuideItems } from "@/data/leaseGuide";
import LeaseCompareCards from "@/components/lease/LeaseCompareCards.vue";
import LeaseCompareInput from "@/components/lease/LeaseCompareInput.vue";
import LeaseCompareTable from "@/components/lease/LeaseCompareTable.vue";
import LeaseGuide from "@/components/lease/LeaseGuide.vue";
import CalculatorPageHeader from "@/components/car/CalculatorPageHeader.vue";
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
    ? `${amountLabel.value} 리스 vs 할부 vs 장기렌트 비교`
    : "리스 vs 할부 vs 장기렌트 비교 | 계약기간 현금유출 비교",
);
const seoDescription = computed(() =>
  amountLabel.value
    ? `차량가 ${amountLabel.value}원 기준, 리스·할부·장기렌트 계약기간 현금유출과 월 납입금을 비교합니다.`
    : "같은 차를 리스·할부·장기렌트로 이용할 때 계약기간 동안 실제로 나가는 현금유출과 월 납입금 차이를 비교합니다.",
);
// Amount variants (/lease-vs-loan/:amount) render the same prerendered body,
// so they canonicalize to the base page instead of competing as duplicates.
const canonicalPath = computed(() => (props.initialVehiclePrice ? "/lease-vs-loan" : undefined));

// LeaseGuide 내부에서도 동일한 입력(leaseGuideItems, CAR_LEASE_GUIDE.faqs)으로 병합하므로
// 화면에 실제 렌더되는 항목과 구조화 데이터가 일치한다 (스키마 규칙)
const mergedFaqs = mergeFaqs(leaseGuideItems, CAR_LEASE_GUIDE.faqs);
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: mergedFaqs.map((faq) => ({
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

// 최저 총비용은 히어로가 이미 대표 수치로 보여준다 — 여기서 다시 세지 않는다.
const summaryFacts = computed(() => [
  { label: "월 납입금", value: formatWon(result.value.bestResult.monthlyPayment) },
  { label: "2위와 차이", value: formatWon(result.value.runnerUpGap) },
]);
// 계약기간 총액은 수천만 원대에서 몇 % 차이로 모인다 — 0부터 그리면 세 막대가 같아 보였다.
// 1위(최저 총 현금유출) 대비 더 드는 금액을 막대로 그린다.
const costItems = computed(() => result.value.methods.map((method) => ({
  key: method.method,
  label: method.label,
  value: method.totalCost,
  detail: `월 납입 ${formatWon(method.monthlyPayment)} · ${method.comparisonNote}`,
})));
</script>

<template>
  <SEOHead
    :title="seoTitle"
    :description="seoDescription"
    :canonical-path="canonicalPath"
    :json-ld="faqJsonLd"
  />

  <div class="sh-container sh-container--tool space-y-5 py-5">
    <CalculatorPageHeader title="리스·할부·장기렌트 비교" />

    <ShCalculatorSplit>
      <template #input>
        <div class="retro-panel overflow-hidden">
          <div class="retro-titlebar rounded-t-2xl">
            <h2 class="retro-title">비교 조건 입력</h2>
            <FreshBadge :message="`${LEASE_DATA_UPDATED} 기준`" />
          </div>
          <div class="retro-panel-content">
            <CalculatorInteractionTracker calculator-id="lease_vs_loan" page-path="/car/lease-vs-loan">
              <LeaseCompareInput v-model="form" />
            </CalculatorInteractionTracker>
          </div>
        </div>
      </template>
      <template #result>
        <div class="retro-panel overflow-hidden">
          <div class="space-y-1 border-b border-border/40 px-4 py-4 sm:px-5 sm:py-5">
            <p class="text-caption font-semibold text-muted-foreground">현금유출이 가장 적은 방식</p>
            <p class="car-result-amount font-bold font-brand tabular-nums text-primary">
              <CountUpAmount :value="formatWon(result.bestResult.totalCost)" />
            </p>
            <p class="text-caption text-muted-foreground">
              <strong class="font-semibold text-primary">{{ result.bestResult.label }}</strong> 기준 계약기간 총 현금유출
            </p>
          </div>
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 px-4 py-3 sm:px-5">
            <span class="flex shrink-0 items-center gap-2 whitespace-nowrap text-caption font-semibold text-muted-foreground">
              <span class="h-2 w-2 shrink-0 rounded-full bg-muted-foreground" />
              최고/최저 차이
            </span>
            <span class="inline-flex items-center rounded-full bg-muted px-3 py-1 text-heading font-bold tabular-nums text-foreground sm:text-h1">
              {{ formatWon(result.spread) }}
            </span>
          </div>
          <div class="divide-y divide-border/40 sm:grid sm:grid-cols-2 sm:divide-x sm:divide-y-0">
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
      </template>
    </ShCalculatorSplit>

    <!-- 계산기 아래 데이터 블록 2열(ShPairRow, 사용자 결정 2026-09-25) — 차트 | 비교표.
         LeaseCompareCards(md:hidden)·LeaseCompareTable(hidden md:block)는 같은 데이터의
         모바일/데스크톱 반응형 쌍이라 한 칸에 함께 둔다(분리하면 둘 중 하나가 짝을 잃는다).
         LeaseGuide는 제목만 "가이드"일 뿐 FaqAccordionPanel(기본 제목 "자주 묻는 질문")이라
         이 페이지의 FAQ 블록이다 — 전폭 유지. -->
    <ShPairRow>
      <template #start>
        <GapBars
          title="계약기간 총 현금유출 비교"
          note="막대는 1위보다 더 드는 금액입니다. 리스는 만기 반납, 할부는 차량 잔존가치 제외, 장기렌트는 보험·세금 포함 기준입니다."
          :items="costItems"
          :format-value="formatWon"
          better="lower"
        />
      </template>
      <template #end>
        <LeaseCompareCards :result="result" />
        <LeaseCompareTable :result="result" />
      </template>
    </ShPairRow>

    <AffiliateLinkPanel
      title="차량 계약 전에 같이 확인해 볼 상품"
      description="차량 이용 방식 비교와 함께 블랙박스, 세차용품 예산도 미리 점검해 보세요."
      :items="carAffiliateItems"
    />
    <LeaseGuide :extra="CAR_LEASE_GUIDE.faqs" />

    <!-- 두 번째 짝: 출처 | 비교 기준 노트. 광고는 이미 이 묶음 뒤에 있어 옮기지 않아도 된다. -->
    <ShPairRow>
      <template #start>
        <CompareSourceFooter :sources="LEASE_SOURCES" :updated-at="LEASE_DATA_UPDATED" />
      </template>
      <template #end>
        <div class="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3 text-caption text-muted-foreground">
          <p class="mb-2 font-semibold text-foreground">비교 기준</p>
          <p>• 리스: 만기 반납 기준 현금유출 비교, 잔존가치 인수비용 제외</p>
          <p>• 할부: 같은 기간 실제 납부액 기준, 차량 잔존가치는 비교에서 제외</p>
          <p>• 장기렌트: 보험·세금 포함 월 납입금 기준</p>
        </div>
      </template>
    </ShPairRow>

    <AdSlot slot-id="bottom" label="자동차 금융 광고 영역" />
    <SeoRichGuide
      :title="CAR_LEASE_GUIDE.title"
      :intro="CAR_LEASE_GUIDE.intro"
      :sections="CAR_LEASE_GUIDE.sections"
      :checklist="CAR_LEASE_GUIDE.checklist"
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
