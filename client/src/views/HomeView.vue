<script setup lang="ts">
import { ArrowRight } from "lucide-vue-next";
import { RouterLink } from "vue-router";
import { ShSurface, ShText } from "@shakilabs/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import RelatedServices from "@/components/common/RelatedServices.vue";
import SEOHead from "@/components/common/SEOHead.vue";
import { APP_NAME } from "@/composables/useSEO";
import {
  CAR_HOME_UPDATED,
  HOME_COST_TABLE,
  HOME_INTENTS,
} from "@/data/homeHighlights";
import { buildCanonicalUrl } from "@/lib/site";

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
  <!-- 함대 제목 레시피: 홈은 `<앱 이름> | ShakiLabs` (useSEO.buildPageTitle) -->
  <SEOHead :title="APP_NAME" :description="SEO_DESCRIPTION" :json-ld="itemListJsonLd" />

  <div class="sh-container sh-container--page space-y-5 py-5">
    <ShSurface padding="lg">
      <ShText as="h1" variant="display">
        차값은 한 번, 나머지는 계속 나갑니다
      </ShText>
      <!-- 허브 도입은 한 문장. 세 문장 설명·"총액이 갈리는 지점" 에세이 4절·"믿고 쓰려면" 카드 3장은 2026-11 UI 감사에서 뺐다(GA4 28일 허브 조회 3). -->
      <ShText tone="muted" class="mt-3 max-w-3xl">
        취득세·공채부터 보험료·연료비·유지비까지, 계약 전에 눌러 보는 계산기 6개.
      </ShText>
      <div class="mt-4 flex flex-wrap gap-2">
        <RouterLink
          to="/tax"
          class="sh-button sh-button--primary sh-button--md no-underline"
        >
          취득·등록세부터 계산하기 <ArrowRight class="h-4 w-4" aria-hidden="true" />
        </RouterLink>
        <RouterLink
          to="/all"
          class="sh-button sh-button--secondary sh-button--md no-underline"
        >
          계산기 사용법 보기
        </RouterLink>
      </div>
    </ShSurface>

    <section aria-labelledby="home-intents-title">
      <div class="mb-3">
        <ShText id="home-intents-title" as="h2" variant="heading">지금 궁금한 질문부터 고르세요</ShText>
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

    <RelatedServices />
  </div>
</template>
