<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
import { useConstantsStore } from "@/stores/constants";

const constantsStore = useConstantsStore();
</script>

<template>
  <SEOHead title="이용약관" description="car.shakilabs.com의 서비스 이용약관입니다." />

  <div class="container py-5">
    <div class="retro-panel">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">이용약관</h1>
      </div>

      <div class="retro-panel-content space-y-4">
        <p class="text-body text-muted-foreground">
          car.shakilabs.com(이하 "본 서비스")은 자동차 관련 비용 비교를 돕는 무료 계산 도구입니다.
        </p>

        <h2 class="text-heading font-bold">1. 서비스 성격</h2>
        <p class="text-body text-muted-foreground">
          본 서비스는 취등록세, 자동차보험, 자동차 금융 비용을 빠르게 비교할 수 있도록 돕는 참고용 계산기입니다.
        </p>

        <h2 class="text-heading font-bold">2. 면책 조항</h2>
        <ul class="list-inside list-disc space-y-1 text-body text-muted-foreground">
          <li>계산 결과는 참고용이며 실제 세액, 보험료, 금융 견적과 차이가 있을 수 있습니다.</li>
          <li>법령 개정, 보험사 정책, 금융사 조건 변경이 즉시 반영되지 않을 수 있습니다.</li>
          <li>본 서비스의 결과를 근거로 한 계약, 구매, 재무 의사결정의 책임은 이용자에게 있습니다.</li>
        </ul>

        <h2 class="text-heading font-bold">3. 지식재산권</h2>
        <p class="text-body text-muted-foreground">
          본 서비스의 디자인, 코드, 콘텐츠에 대한 권리는 운영자에게 있습니다. 계산 결과의 공유·인용은 가능하나 서비스 자체 복제는 금지합니다.
        </p>

        <h2 class="text-heading font-bold">4. 문의</h2>
        <p class="text-body text-muted-foreground">
          약관 관련 문의:
          <a :href="`mailto:${constantsStore.supportEmail}`" class="retro-link">
            {{ constantsStore.supportEmail }}
          </a>
        </p>

        <p class="mt-6 text-tiny text-muted-foreground">시행일: 2026년 3월 11일</p>
      </div>
    </div>
  </div>
</template>
