<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
import { useConstantsStore } from "@/stores/constants";

const constantsStore = useConstantsStore();
</script>

<template>
  <SEOHead title="이용약관" description="shakilabs.com/car의 서비스 이용약관입니다. 서비스 성격, 광고 게재, 면책 조항을 안내합니다." />

  <div class="container py-5">
    <div class="retro-panel">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">이용약관</h1>
      </div>

      <div class="retro-panel-content space-y-4">
        <h2 class="text-heading font-bold">1. 목적</h2>
        <p class="text-body text-muted-foreground">
          본 약관은 ShakiLabs가 운영하는 shakilabs.com/car(이하 "본 서비스")의 이용 조건과 운영자·이용자의 권리, 의무 및 책임 사항을
          규정함을 목적으로 합니다. 이용자가 본 서비스를 이용하는 경우 본 약관에 동의한 것으로 봅니다.
        </p>

        <h2 class="text-heading font-bold">2. 서비스의 성격</h2>
        <p class="text-body text-muted-foreground">
          본 서비스는 자동차 취등록세, 자동차보험 절약, 리스·할부·장기렌트 총비용, 유지비, 전기차 비교 등 자동차 관련 비용을
          추정하고 비교할 수 있도록 돕는 무료 참고용 계산 도구입니다.
          모든 계산은 이용자가 입력한 차량 가격, 보험료, 금리 등의 값과 공개된 세율·요율 자료를 근거로 이용자의 브라우저 안에서 수행되며,
          운영자는 입력값을 서버에 저장하지 않습니다. 각 계산기에는 적용한 세율과 데이터 기준일이 함께 표기되므로,
          이용자는 계산 근거를 직접 확인하면서 결과를 해석할 수 있습니다.
          본 서비스는 세무 대리, 보험 모집, 금융상품 판매, 대출 중개 행위를 하지 않으며
          계산 결과는 법적 효력이 있는 견적이나 상담이 아닙니다.
        </p>

        <h2 class="text-heading font-bold">3. 서비스의 이용</h2>
        <p class="text-body text-muted-foreground">
          본 서비스는 별도의 회원가입이나 결제 없이 누구나 무료로 이용할 수 있습니다.
          운영자는 서비스 개선을 위해 기능을 추가·변경할 수 있으며, 불가피한 사정이 있는 경우 서비스의 일부 또는 전부를
          사전 고지 후 중단할 수 있습니다. 이용자는 서비스를 자동화된 수단으로 과도하게 호출하거나
          정상적인 운영을 방해하는 행위를 해서는 안 됩니다.
        </p>

        <h2 class="text-heading font-bold">4. 광고 게재</h2>
        <p class="text-body text-muted-foreground">
          본 서비스는 무료 운영 재원을 마련하기 위해 Google AdSense 등 제3자 광고 플랫폼이 제공하는 광고를 화면에 게재할 수 있습니다.
          광고의 내용은 광고 플랫폼과 광고주가 결정하며, 운영자는 개별 광고의 내용을 사전에 선택하거나 보증하지 않습니다.
          이용자가 광고를 통해 접한 상품·서비스와 관련하여 광고주와 거래하는 경우, 해당 거래의 당사자는 이용자와 광고주이며
          운영자는 그 거래에 개입하지 않고 이로 인한 손해에 대해 책임을 지지 않습니다.
          광고 쿠키의 사용과 맞춤 광고 해제 방법은 개인정보 처리방침에서 자세히 안내합니다.
        </p>

        <h2 class="text-heading font-bold">5. 면책 조항</h2>
        <ul class="list-inside list-disc space-y-1 text-body text-muted-foreground">
          <li>계산 결과는 참고용 추정치이며 실제 세액, 보험료, 금융 견적과 차이가 있을 수 있습니다.</li>
          <li>법령 개정, 지방자치단체 조례 변경, 보험사 요율 조정, 금융사 조건 변경이 즉시 반영되지 않을 수 있습니다.</li>
          <li>본 서비스의 결과를 근거로 한 계약, 구매, 재무 의사결정과 그 결과에 대한 책임은 이용자에게 있습니다.</li>
          <li>정확한 세액은 관할 지방자치단체·위택스에서, 보험료는 각 보험사에서, 금융 조건은 각 금융사에서 최종 확인해야 합니다.</li>
          <li>운영자는 천재지변, 통신 장애 등 불가항력으로 인한 서비스 중단에 대해 책임을 지지 않습니다.</li>
        </ul>

        <h2 class="text-heading font-bold">6. 지식재산권</h2>
        <p class="text-body text-muted-foreground">
          본 서비스의 디자인, 코드, 콘텐츠에 대한 권리는 운영자에게 있습니다.
          계산 결과의 공유·인용은 출처를 표기하는 조건으로 자유롭게 할 수 있으나,
          서비스 자체를 복제하거나 상업적으로 재배포하는 행위는 금지합니다.
        </p>

        <h2 class="text-heading font-bold">7. 약관의 변경</h2>
        <p class="text-body text-muted-foreground">
          운영자는 관련 법령을 위반하지 않는 범위에서 본 약관을 개정할 수 있으며,
          개정 시 본 페이지에 게시하고 시행일을 갱신합니다. 개정 이후 서비스를 계속 이용하는 경우 변경된 약관에 동의한 것으로 봅니다.
        </p>

        <h2 class="text-heading font-bold">8. 준거법</h2>
        <p class="text-body text-muted-foreground">
          본 약관은 대한민국 법령에 따라 해석되며, 서비스 이용과 관련한 분쟁은 민사소송법상 관할 법원에 제기합니다.
        </p>

        <h2 class="text-heading font-bold">9. 문의</h2>
        <p class="text-body text-muted-foreground">
          운영: ShakiLabs · 문의:
          <a :href="`mailto:${constantsStore.supportEmail}`" class="retro-link">
            {{ constantsStore.supportEmail }}
          </a>
        </p>

        <p class="mt-6 text-tiny text-muted-foreground">시행일: 2026년 3월 11일 · 최종 개정일: 2026년 8월 5일</p>
      </div>
    </div>
  </div>
</template>
