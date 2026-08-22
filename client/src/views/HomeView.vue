<script setup lang="ts">
import { ArrowRight } from "lucide-vue-next";
import { RouterLink } from "vue-router";
import { ShSurface, ShText } from "@shakilabs/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import RelatedServices from "@/components/common/RelatedServices.vue";
import SEOHead from "@/components/common/SEOHead.vue";
import {
  CAR_HOME_UPDATED,
  HOME_COST_TABLE,
  HOME_INTENTS,
  HOME_USAGE_NOTES,
} from "@/data/homeHighlights";
import { buildCanonicalUrl } from "@/lib/site";

const SEO_TITLE = "자동차 비용 계산기 | 취득세·보험·유지비 2026 기준";
const SEO_DESCRIPTION =
  "차량 가격만 보고 계약하면 등록비와 유지비에서 어긋납니다. 취득·등록세, 보험료, 리스·할부, 유지비, 주차비, 전기차 전환까지 계산기 6개를 2026년 기준 숫자로 제공합니다.";

// 홈에서 연결되는 계산기 목록을 구조화 데이터로도 노출한다 (화면의 질문 카드와 동일 순서)
const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "자동차 비용 계산기 목록",
  itemListElement: HOME_INTENTS.map((intent, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: intent.action,
    url: buildCanonicalUrl(intent.path),
  })),
};
</script>

<template>
  <SEOHead :title="SEO_TITLE" :description="SEO_DESCRIPTION" :json-ld="itemListJsonLd" />

  <div class="container space-y-5 py-5">
    <ShSurface padding="lg">
      <ShText as="p" variant="caption" tone="muted">SHAKILABS CAR</ShText>
      <ShText as="h1" variant="display" class="mt-2">
        차값은 한 번, 나머지는 계속 나갑니다
      </ShText>
      <ShText tone="muted" class="mt-3 max-w-3xl">
        견적서에 적힌 금액은 자동차에 드는 돈의 일부일 뿐입니다. 등록 단계에서 취득세와 공채가
        붙고, 그다음부터는 보험료·연료비·정비비·주차비가 매년 반복됩니다. 계약 전에 이 숫자들을
        한 번씩 눌러 보라고 만든 계산기 여섯 개입니다.
      </ShText>
      <div class="mt-4 flex flex-wrap gap-2">
        <RouterLink
          to="/tax"
          class="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-caption font-semibold text-primary-foreground no-underline"
        >
          취득·등록세부터 계산하기 <ArrowRight class="h-4 w-4" aria-hidden="true" />
        </RouterLink>
        <RouterLink
          to="/all"
          class="inline-flex items-center gap-1 rounded-xl border border-border px-4 py-2 text-caption font-semibold text-foreground no-underline"
        >
          계산기 사용법 보기
        </RouterLink>
      </div>
    </ShSurface>

    <section aria-labelledby="home-intents-title">
      <div class="mb-3">
        <ShText id="home-intents-title" as="h2" variant="heading">지금 궁금한 질문부터 고르세요</ShText>
        <ShText variant="caption" tone="muted" class="mt-1">
          질문을 누르면 해당 계산기로 바로 이동합니다.
        </ShText>
      </div>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <RouterLink
          v-for="intent in HOME_INTENTS"
          :key="intent.key"
          :to="intent.path"
          class="block no-underline"
        >
          <ShSurface variant="outlined" padding="md" class="flex h-full flex-col hover:border-primary">
            <ShText as="h3" variant="body" class="font-semibold">{{ intent.question }}</ShText>
            <span class="mt-3 inline-flex items-center gap-1 text-caption font-semibold text-primary">
              {{ intent.action }} <ArrowRight class="h-4 w-4" aria-hidden="true" />
            </span>
          </ShSurface>
        </RouterLink>
      </div>
    </section>

    <ShSurface as="section" padding="lg" aria-labelledby="home-costs-title">
      <ShText id="home-costs-title" as="h2" variant="heading">2026년 기준 핵심 숫자</ShText>
      <ShText variant="caption" tone="muted" class="mt-1">
        계산기마다 흩어져 있는 세율·요율·보조금 상한을 한 표로 모았습니다. ({{ CAR_HOME_UPDATED }} 기준)
      </ShText>
      <!-- 좁은 화면에서 3열은 마지막 열이 뭉개진다. 비고를 기준값 아래로 접어 2열로 유지한다 -->
      <Table class="mt-4">
        <TableHeader>
          <TableRow>
            <TableHead scope="col" class="w-2/5">항목</TableHead>
            <TableHead scope="col">기준</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="row in HOME_COST_TABLE" :key="row.item">
            <TableCell class="align-top font-semibold">{{ row.item }}</TableCell>
            <TableCell class="align-top">
              <span class="block font-semibold">{{ row.value }}</span>
              <span class="mt-0.5 block text-caption text-muted-foreground">{{ row.note }}</span>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </ShSurface>

    <ShSurface as="section" padding="lg" aria-labelledby="home-divergence-title">
      <ShText id="home-divergence-title" as="h2" variant="heading">같은 차인데 총액이 갈리는 지점</ShText>
      <div class="mt-4 space-y-4">
        <div>
          <ShText as="h3" variant="body" class="font-semibold">등록 지역과 배기량</ShText>
          <ShText tone="muted" class="mt-1 max-w-3xl">
            취득세율은 전국이 같지만 공채매입률은 지자체마다 다릅니다. 2,000cc를 넘는 승용차를
            서울에 등록하면 매입률이 20%까지 올라가고, 같은 차를 다른 지역에 등록하면 5%로
            떨어집니다. 공채는 사자마자 되팔 수 있어 실제로 남는 부담은 할인율만큼이지만, 배기량
            구간이 하나 올라가는 순간 계산이 통째로 달라집니다.
          </ShText>
        </div>
        <div>
          <ShText as="h3" variant="body" class="font-semibold">조달 방식</ShText>
          <ShText tone="muted" class="mt-1 max-w-3xl">
            현금·할부·리스·장기렌트는 월 납입금만 보면 순서가 뒤바뀌어 보입니다. 리스와 렌트는
            잔존가치를 뺀 금액에만 이자가 붙어 월 부담이 작아 보이지만, 계약이 끝날 때 인수
            여부에 따라 총액이 역전됩니다. 판단 기준은 월 납입금이 아니라 계약기간 전체의
            현금유출입니다.
          </ShText>
        </div>
        <div>
          <ShText as="h3" variant="body" class="font-semibold">운전 경력과 사고 이력</ShText>
          <ShText tone="muted" class="mt-1 max-w-3xl">
            보험료는 차종보다 사람에 더 크게 반응합니다. 무사고 경력이 쌓이면 할인율이 최대
            35%까지 올라가는 반면, 최근 3년 안에 사고가 두 번 있으면 30% 할증이 붙습니다.
            마일리지 특약이나 자기부담금 조정처럼 갱신 시점에만 바꿀 수 있는 항목도 있어, 안내문을
            받은 직후가 손댈 수 있는 유일한 시기인 경우가 많습니다.
          </ShText>
        </div>
        <div>
          <ShText as="h3" variant="body" class="font-semibold">연간 주행거리</ShText>
          <ShText tone="muted" class="mt-1 max-w-3xl">
            전기차와 내연기관차의 손익분기는 차량 가격이 아니라 주행거리가 결정합니다. 초기
            구매가 차이는 보조금으로 좁혀지고, 그다음부터는 연료비 차이가 매년 쌓입니다. 적게
            타면 보조금을 받아도 회수되지 않고, 많이 타면 몇 해 만에 뒤집힙니다. 유지비 쪽도
            같은 원리라 주행거리를 먼저 정해 두면 두 계산이 한 번에 정리됩니다.
          </ShText>
        </div>
      </div>
    </ShSurface>

    <section aria-labelledby="home-usage-title">
      <div class="mb-3">
        <ShText id="home-usage-title" as="h2" variant="heading">계산 결과를 믿고 쓰려면</ShText>
      </div>
      <div class="grid gap-3 sm:grid-cols-3">
        <ShSurface v-for="note in HOME_USAGE_NOTES" :key="note.key" variant="outlined" padding="md">
          <ShText as="h3" variant="body" class="font-semibold">{{ note.title }}</ShText>
          <ShText variant="caption" tone="muted" class="mt-2">{{ note.body }}</ShText>
        </ShSurface>
      </div>
    </section>

    <RelatedServices />
  </div>
</template>
