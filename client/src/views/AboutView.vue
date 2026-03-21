<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
import { RouterLink } from "vue-router";
import { useConstantsStore } from "@/stores/constants";
import { CAR_TAX_DATA_UPDATED } from "@/data/carTaxRates";
import { INSURANCE_DATA_UPDATED } from "@/data/insuranceRates";
import { LEASE_DATA_UPDATED } from "@/data/leaseRates";

const constantsStore = useConstantsStore();
</script>

<template>
  <SEOHead
    title="서비스 안내"
    description="shakilabs.com/car은 자동차 취등록세, 보험 절약, 리스·할부·렌트 총비용을 비교하는 무료 계산기입니다."
  />

  <div class="container py-5 space-y-5">
    <div class="retro-panel">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">서비스 안내</h1>
      </div>

      <div class="retro-panel-content space-y-4">
        <p class="text-body text-muted-foreground">
          shakilabs.com/car은 자동차 구매 전후에 가장 자주 비교하는 초기 비용과 유지 비용을 한곳에서 보는 계산기입니다.
        </p>

        <h2 class="text-heading font-bold">제공 기능</h2>
        <ul class="list-inside list-disc space-y-1 text-body text-muted-foreground">
          <li>신차·중고차 취등록세, 공채비, 부대비용 계산</li>
          <li>보험 갱신 시 할인 특약과 다이렉트 전환 절약폭 시뮬레이션</li>
          <li>리스·할부·장기렌트 3가지 방식의 월 납입금과 총비용 비교</li>
        </ul>

        <h2 class="text-heading font-bold">데이터 기준</h2>
        <ul class="list-inside list-disc space-y-1 text-body text-muted-foreground">
          <li>취등록세: {{ CAR_TAX_DATA_UPDATED }} 기준</li>
          <li>보험 할인 가정: {{ INSURANCE_DATA_UPDATED }} 기준</li>
          <li>금융 비교 가정: {{ LEASE_DATA_UPDATED }} 기준</li>
        </ul>

        <p class="text-body text-muted-foreground">
          실제 세액과 보험료, 금융 조건은 차량 종류, 신용도, 계약 조건에 따라 달라질 수 있습니다.
          따라서 계산 결과는 비교용 참고값으로 활용해 주세요.
        </p>

        <h2 class="text-heading font-bold">문의</h2>
        <p class="text-body text-muted-foreground">
          오류 제보나 데이터 수정 요청은
          <a :href="`mailto:${constantsStore.supportEmail}`" class="retro-link">
            {{ constantsStore.supportEmail }}
          </a>
          로 보내주세요.
        </p>
      </div>
    </div>

    <div class="text-center">
      <RouterLink class="retro-button" to="/tax">취등록세 계산기로 이동</RouterLink>
    </div>
  </div>
</template>
