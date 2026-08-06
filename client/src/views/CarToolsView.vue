<script setup lang="ts">
import { ArrowRight } from "lucide-vue-next";
import { RouterLink } from "vue-router";
import { ShSurface, ShText } from "@shakilabs/ui";
import SEOHead from "@/components/common/SEOHead.vue";
import { CAR_TOOLS, type CarToolKey } from "@/data/carNavigation";

// /all이 링크 나열 인덱스로 남지 않도록 페이지 고유 본문(언제 쓰는가·입력→출력)을
// 이 뷰가 소유한다. 카드 요약(CAR_TOOLS.description)과 문장이 겹치면 중복 블록
// 감사에 걸리므로 표현을 분리해 유지할 것.
const TOOL_USAGE: Record<CarToolKey, { when: string; io: string }> = {
  tax: {
    when: "신차 계약이나 중고차 이전 등록을 앞두고, 차량 가격 외에 등록 단계에서 얼마가 더 드는지 예산을 잡을 때 사용합니다.",
    io: "차량 가격과 차종·배기량 구간, 등록 지역, 신차·중고 여부를 입력하면 취득세와 공채매입 부담, 번호판 대행 수수료까지 합친 총 등록비용이 나옵니다. 전기차 같은 차종별 감면과 장애인 감면 가정, 중고차 경과연수도 옵션으로 반영됩니다.",
  },
  insurance: {
    when: "보험 갱신 안내를 받았거나 지금 내는 보험료가 적정한지 궁금할 때, 갱신 전에 줄일 항목을 찾는 용도입니다.",
    io: "현재 자동차보험료에 마일리지 특약·자기부담금·블랙박스 할인, 최근 3년 사고 건수, 가입 경력 같은 조건을 더하면 항목별 예상 절감액이 계산됩니다. 다이렉트 전환으로 추가 절약할 수 있는 금액은 성격이 달라 별도로 표시됩니다.",
  },
  "lease-vs-loan": {
    when: "현금·할부·리스·장기렌트 중 조달 방식을 정하지 못했을 때, 영업점 견적서를 같은 기준으로 검증하고 싶을 때 사용합니다.",
    io: "차량 가격과 이용 기간, 선수금 비율, 잔존가치율을 입력하면 방식별 월 납입금과 계약기간 총 현금유출이 나란히 계산되고, 현금유출이 가장 적은 방식과 최고·최저 차이가 표시됩니다. 리스·할부 금리와 렌트 관리비 비율은 상세 설정에서 조정할 수 있습니다.",
  },
  parking: {
    when: "회사나 집 근처에서 시간제 주차와 월주차 정기권 중 어느 쪽이 유리한지 고민될 때 사용합니다.",
    io: "월 주차 일수와 하루 주차 시간, 시간당 요금, 월주차 요금 네 가지만 입력하면 두 방식의 월 예상 비용이 비교되고 가장 저렴한 방식이 표시됩니다. 재택이나 출장으로 출근 일수가 바뀌면 결과가 뒤집힐 수 있으니 조건을 바꿔 가며 확인해 보세요.",
  },
  maintenance: {
    when: "연간 차량 예산을 세우거나, 연식이 쌓인 차를 계속 탈지 판단할 때 사용합니다.",
    io: "연 주행거리와 차량 연식, 연료 종류를 입력하면 오일·타이어·소모품과 보험·세금으로 나뉜 연간 유지비 구성이 그래프로 나옵니다. 연식을 바꿔 보면 노후 차량의 정비 부담이 얼마나 커지는지도 가늠할 수 있습니다.",
  },
  "ev-vs-gas": {
    when: "다음 차로 전기차를 살지 고민될 때, 보조금을 반영한 실제 부담 차이가 궁금할 때 사용합니다.",
    io: "연 주행거리와 휘발유·전기 단가, 연비·전비, 차량 출고가를 입력하면 연간 운행비 차이와 국고·지자체 보조금을 반영한 비교 결과가 나옵니다. 청년 생애 첫 차, 내연차 전환 같은 추가 지원 조건도 선택해 반영할 수 있습니다.",
  },
};

const toolDetails = CAR_TOOLS.map((tool) => ({ ...tool, ...TOOL_USAGE[tool.key] }));
</script>

<template>
  <SEOHead
    title="차량 계산기 전체 보기 | 구매·보험·유지비 도구"
    description="차량 구매, 보험, 보유와 운행 단계별로 필요한 자동차 계산기와 비교 도구를 찾으세요."
  />
  <div class="container space-y-5 py-5">
    <ShSurface padding="lg">
      <ShText as="p" variant="caption" tone="muted">CAR TOOL DIRECTORY</ShText>
      <ShText as="h1" variant="display" class="mt-2">차량 비용은 단계별로 나눠 보세요</ShText>
      <ShText tone="muted" class="mt-3 max-w-3xl">
        구매, 보험, 보유, 운행 중 지금 확인할 비용과 가까운 도구에서 시작하세요.
      </ShText>
      <ShText tone="muted" class="mt-2 max-w-3xl">
        이 페이지는 자동차 비용 계산기 여섯 개를 한곳에 모은 디렉터리입니다. 각 도구가 언제
        필요한지, 무엇을 입력하면 어떤 결과가 나오는지 아래 안내에서 확인한 뒤 상황에 맞는
        계산기로 이동하세요. 모든 도구는 회원가입 없이 무료이며 입력값은 브라우저 안에서만
        처리됩니다.
      </ShText>
    </ShSurface>

    <section aria-labelledby="car-tools-title">
      <div class="mb-3">
        <ShText id="car-tools-title" as="h2" variant="heading">차량 계산 도구</ShText>
        <ShText variant="caption" tone="muted" class="mt-1">
          같은 입력 조건으로 세금과 장기 비용을 차례로 확인할 수 있습니다.
        </ShText>
      </div>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <RouterLink v-for="tool in CAR_TOOLS" :key="tool.path" :to="tool.path" class="block no-underline">
          <ShSurface variant="outlined" padding="md" class="group flex h-full flex-col hover:border-primary">
            <ShText as="h3" variant="heading">{{ tool.title }}</ShText>
            <ShText variant="caption" tone="muted" class="mt-2 flex-1">{{ tool.description }}</ShText>
            <span class="mt-4 inline-flex items-center gap-1 text-caption font-semibold text-primary">
              계산 시작 <ArrowRight class="h-4 w-4" aria-hidden="true" />
            </span>
          </ShSurface>
        </RouterLink>
      </div>
    </section>

    <section aria-labelledby="car-scenario-title">
      <ShSurface padding="lg">
        <ShText id="car-scenario-title" as="h2" variant="heading">상황별로 고르는 계산기</ShText>
        <ShText tone="muted" class="mt-2 max-w-3xl">
          지금 서 있는 단계에서 출발하면 봐야 할 숫자가 명확해집니다. 세 가지 상황 중 가까운
          쪽을 골라 이어지는 순서대로 계산해 보세요.
        </ShText>
        <div class="mt-4 space-y-4">
          <div>
            <ShText as="h3" variant="body" class="font-semibold">차를 사기 전이라면</ShText>
            <ShText tone="muted" class="mt-1 max-w-3xl">
              견적서를 받기 전에
              <RouterLink to="/tax" class="font-semibold text-primary">취득·등록세 계산기</RouterLink>로
              취득세·공채·부대비용까지 포함한 실구매 예산부터 확정하세요. 자금 조달이 고민이라면
              <RouterLink to="/lease-vs-loan" class="font-semibold text-primary">리스·할부·렌트 비교</RouterLink>로
              방식별 총 현금유출을 견주고, 계약 직전에는
              <RouterLink to="/insurance" class="font-semibold text-primary">보험 절약 계산기</RouterLink>로
              첫해 보험료 수준까지 점검하면 인수 후 예상 밖 지출이 줄어듭니다.
            </ShText>
          </div>
          <div>
            <ShText as="h3" variant="body" class="font-semibold">차를 보유 중이라면</ShText>
            <ShText tone="muted" class="mt-1 max-w-3xl">
              보유 단계 비용은 매달 반복되는 지출이라 작은 차이가 1년이면 크게 벌어집니다.
              <RouterLink to="/maintenance" class="font-semibold text-primary">유지비 계산기</RouterLink>로
              연간 예산의 큰 그림을 그리고, 출퇴근 주차 요금이 있다면
              <RouterLink to="/parking" class="font-semibold text-primary">주차비 비교</RouterLink>로
              시간제와 월주차의 유불리를 확인하세요. 갱신 안내가 도착했다면
              <RouterLink to="/insurance" class="font-semibold text-primary">보험 절약 계산기</RouterLink>부터
              여는 것이 순서입니다.
            </ShText>
          </div>
          <div>
            <ShText as="h3" variant="body" class="font-semibold">전기차 전환을 고민 중이라면</ShText>
            <ShText tone="muted" class="mt-1 max-w-3xl">
              <RouterLink to="/ev-vs-gas" class="font-semibold text-primary">전기차·내연기관차 비교</RouterLink>에서
              내 주행거리 기준 연간 운행비 차이와 보조금 반영 실부담을 먼저 확인하세요. 구매
              쪽으로 기울었다면
              <RouterLink to="/tax" class="font-semibold text-primary">취득·등록세 계산기</RouterLink>에서
              전기차 감면이 반영된 초기 등록비용까지 이어서 계산하면 됩니다.
            </ShText>
          </div>
        </div>
      </ShSurface>
    </section>

    <section aria-labelledby="car-usage-title">
      <div class="mb-3">
        <ShText id="car-usage-title" as="h2" variant="heading">계산기별 사용 안내</ShText>
        <ShText variant="caption" tone="muted" class="mt-1">
          여섯 개 도구가 각각 언제 필요한지, 무엇을 입력하면 어떤 결과가 나오는지 정리했습니다.
        </ShText>
      </div>
      <div class="space-y-3">
        <ShSurface v-for="tool in toolDetails" :key="tool.key" variant="outlined" padding="md">
          <ShText as="h3" variant="body" class="font-semibold">{{ tool.title }}</ShText>
          <ShText tone="muted" class="mt-2 max-w-3xl">{{ tool.when }}</ShText>
          <ShText tone="muted" class="mt-2 max-w-3xl">{{ tool.io }}</ShText>
          <RouterLink
            :to="tool.path"
            class="mt-3 inline-flex items-center gap-1 text-caption font-semibold text-primary no-underline"
          >
            계산기 열기 <ArrowRight class="h-4 w-4" aria-hidden="true" />
          </RouterLink>
        </ShSurface>
      </div>
    </section>
  </div>
</template>
