<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
import { useConstantsStore } from "@/stores/constants";

const constantsStore = useConstantsStore();
</script>

<template>
  <SEOHead title="개인정보 처리방침" description="shakilabs.com/car의 개인정보 처리방침입니다." />

  <div class="container py-5">
    <div class="retro-panel">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">개인정보 처리방침</h1>
      </div>

      <div class="retro-panel-content space-y-4">
        <p class="text-body text-muted-foreground">
          본 서비스는 회원가입 기능이 없으며, 계산 결과는 브라우저에서 처리됩니다.
        </p>

        <h2 class="text-heading font-bold">1. 수집 정보</h2>
        <p class="text-body text-muted-foreground">
          직접 입력한 차량 가격, 보험료, 금융 조건은 서버에 저장하지 않습니다. 다만 서비스 개선을 위해 비식별 방문 통계가 수집될 수 있습니다.
        </p>

        <h2 class="text-heading font-bold">2. 쿠키 및 분석 도구</h2>
        <p class="text-body text-muted-foreground">
          Google Analytics를 사용할 수 있으며, 방문 페이지와 체류 시간 등 비식별 이용 정보가 수집될 수 있습니다.
        </p>

        <h2 class="text-heading font-bold">3. 광고</h2>
        <p class="text-body text-muted-foreground">
          Google AdSense 등 광고 플랫폼을 사용할 수 있으며 이 과정에서 쿠키가 활용될 수 있습니다.
        </p>

        <h2 class="text-heading font-bold">4. 문의</h2>
        <p class="text-body text-muted-foreground">
          개인정보 관련 문의:
          <a :href="`mailto:${constantsStore.supportEmail}`" class="retro-link">
            {{ constantsStore.supportEmail }}
          </a>
        </p>

        <p class="mt-6 text-tiny text-muted-foreground">시행일: 2026년 3월 11일</p>
      </div>
    </div>
  </div>
</template>
