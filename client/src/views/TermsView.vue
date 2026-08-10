<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
import { useConstantsStore } from "@/stores/constants";

const constantsStore = useConstantsStore();
</script>

<template>
  <SEOHead
    title="이용약관"
    description="자동차 계산기의 이용 조건, 계산 결과의 한계(취득세·보험료·리스 정산), 광고 게재와 면책 범위를 안내합니다."
  />

  <div class="container py-5">
    <div class="retro-panel">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">이용약관</h1>
      </div>

      <div class="retro-panel-content space-y-4">
        <h2 class="text-heading font-bold">1. 적용 범위</h2>
        <p class="text-body text-muted-foreground">
          본 약관은 ShakiLabs가 운영하는 shakilabs.com/car(이하 "본 서비스")에 적용됩니다.
          본 서비스는 자동차 취등록세 계산기, 자동차보험 절약 시뮬레이터, 리스·할부·장기렌트 총비용 비교,
          차량 유지비 추정, 주차비 비교, 전기차·내연기관 비용 비교 및 전기차 보조금 계산기 여섯 종과
          이를 모아 보여주는 전체 목록 화면으로 구성됩니다. 이용자가 이 화면들을 이용하면 본 약관에 동의한 것으로 봅니다.
        </p>

        <h2 class="text-heading font-bold">2. 본 서비스가 하지 않는 일</h2>
        <p class="text-body text-muted-foreground">
          본 서비스는 계산 도구일 뿐이며, 자동차와 관련된 다음 행위를 일절 하지 않습니다.
        </p>
        <ul class="list-inside list-disc space-y-1 text-body text-muted-foreground">
          <li>보험 모집·설계·청약 접수 — 운영자는 보험업법상 보험 모집에 종사하는 자가 아니며, 보험료 화면은 보험 견적서가 아닙니다.</li>
          <li>자동차 매매·알선·중고차 시세 보증 — 운영자는 자동차관리법상 자동차매매업 등록 사업자가 아닙니다.</li>
          <li>리스·할부·장기렌트 계약 중개와 대출 모집 — 금융사 심사 결과나 승인 금리를 대신 제시하지 않습니다.</li>
          <li>세무 대리와 취득세 신고 대행 — 세액 신고와 납부는 이용자가 관할 지방자치단체·위택스에서 직접 처리해야 합니다.</li>
          <li>전기차 보조금 신청 대행 — 보조금 지급 대상 여부는 지자체 공고와 접수 순서에 따라 결정됩니다.</li>
        </ul>

        <h2 class="text-heading font-bold">3. 계산 결과의 성격과 한계</h2>
        <p class="text-body text-muted-foreground">
          모든 결과는 이용자가 입력한 값과 공개된 세율·요율표를 바탕으로 브라우저에서 계산한 추정치입니다.
          자동차 비용은 항목마다 실제 금액이 벌어지는 이유가 다르므로, 각 계산기의 한계를 아래와 같이 밝힙니다.
        </p>
        <ul class="list-inside list-disc space-y-1 text-body text-muted-foreground">
          <li>취등록세: 중고차는 연식별 잔가율로 과세표준을 추정하므로 실제 신고가액·검사 결과에 따라 달라지고, 공채 매입률과 할인율은 등록 지역·배기량 구간에 따라 조례로 달라집니다.</li>
          <li>보험료: 공개된 할인·할증 항목만 반영한 추정이며, 보험사별 참조순보험요율·특약·담보 구성과 운전자 범위 설정에 따라 실제 보험료는 크게 달라집니다.</li>
          <li>리스·할부·장기렌트: 중도 해지 위약금, 약정 주행거리 초과 정산금, 반납 시 손상 감가, 보증금·선수금 운용 조건은 반영하지 않습니다.</li>
          <li>유지비·주차비: 소모품 교체 주기와 지역별 주차 요금의 평균값을 쓰므로 운전 습관과 주차장 정책에 따라 차이가 납니다.</li>
          <li>전기차 보조금: 국고·지자체 보조금은 연중 예산이 소진되면 조기 마감되며, 차종별 확정 고시액과 지자체 접수 조건이 우선합니다.</li>
        </ul>
        <p class="text-body text-muted-foreground">
          각 화면에는 적용한 세율·요율의 기준일을 함께 표기하므로, 이용자는 계산 근거의 시점을 확인하면서 결과를 해석해야 합니다.
          법령 개정, 지방자치단체 조례 변경, 보험사 요율 조정, 보조금 공고 변경이 즉시 반영되지 않을 수 있습니다.
        </p>

        <h2 class="text-heading font-bold">4. 이용 방법과 금지 행위</h2>
        <p class="text-body text-muted-foreground">
          본 서비스는 회원가입이나 결제 없이 누구나 무료로 이용할 수 있습니다. 운영자는 계산기를 추가·변경할 수 있고,
          불가피한 사정이 있으면 사전 고지 후 일부 또는 전부를 중단할 수 있습니다.
          이용자는 자동화된 수단으로 과도하게 호출하거나 정상적인 운영을 방해하는 행위를 해서는 안 되며,
          계산 결과를 마치 특정 보험사·금융사·판매점의 공식 견적인 것처럼 제시해서도 안 됩니다.
        </p>

        <h2 class="text-heading font-bold">5. 광고 게재</h2>
        <p class="text-body text-muted-foreground">
          본 서비스는 무료 운영 재원을 마련하기 위해 Google AdSense 등 제3자 광고 플랫폼의 광고를 게재할 수 있습니다.
          광고 내용은 광고 플랫폼과 광고주가 결정하며, 운영자는 개별 광고를 사전에 선택하거나 그 상품을 보증하지 않습니다.
          자동차 금융·보험 광고가 노출되더라도 이는 계산 결과에 따른 추천이 아니며, 광고와 계산 결과는 화면에서 분리해 배치합니다.
          이용자가 광고를 통해 광고주와 거래하는 경우 그 거래의 당사자는 이용자와 광고주이고, 운영자는 개입하지 않습니다.
          광고 쿠키의 사용과 맞춤 광고 해제 방법은 개인정보 처리방침에서 안내합니다.
        </p>

        <h2 class="text-heading font-bold">6. 면책</h2>
        <ul class="list-inside list-disc space-y-1 text-body text-muted-foreground">
          <li>본 서비스의 결과를 근거로 한 차량 구매, 금융 계약, 보험 갱신, 보조금 신청과 그 결과에 대한 책임은 이용자에게 있습니다.</li>
          <li>정확한 세액은 관할 지방자치단체·위택스에서, 보험료는 각 보험사에서, 금융 조건은 각 금융사에서, 보조금은 지자체 공고에서 최종 확인해야 합니다.</li>
          <li>운영자는 천재지변, 통신 장애 등 불가항력으로 인한 서비스 중단에 대해 책임을 지지 않습니다.</li>
        </ul>

        <h2 class="text-heading font-bold">7. 지식재산권</h2>
        <p class="text-body text-muted-foreground">
          본 서비스의 디자인, 코드, 가이드 문서에 대한 권리는 운영자에게 있습니다.
          계산 결과의 공유·인용은 출처를 표기하는 조건으로 자유롭게 할 수 있으나,
          계산 로직이나 화면을 복제해 상업적으로 재배포하는 행위는 금지합니다.
        </p>

        <h2 class="text-heading font-bold">8. 약관의 변경과 준거법</h2>
        <p class="text-body text-muted-foreground">
          운영자는 관련 법령을 위반하지 않는 범위에서 본 약관을 개정할 수 있으며, 개정 시 본 페이지에 게시하고 시행일을 갱신합니다.
          개정 이후 서비스를 계속 이용하면 변경된 약관에 동의한 것으로 봅니다.
          본 약관은 대한민국 법령에 따라 해석하며, 이용과 관련한 분쟁은 민사소송법상 관할 법원에 제기합니다.
        </p>

        <h2 class="text-heading font-bold">9. 문의</h2>
        <p class="text-body text-muted-foreground">
          운영: ShakiLabs · 문의:
          <a :href="`mailto:${constantsStore.supportEmail}`" class="retro-link">
            {{ constantsStore.supportEmail }}
          </a>
        </p>

        <p class="mt-6 text-tiny text-muted-foreground">시행일: 2026년 3월 11일 · 최종 개정일: 2026년 8월 10일</p>
      </div>
    </div>
  </div>
</template>
