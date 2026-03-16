<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
import { RouterLink } from "vue-router";
</script>

<template>
  <SEOHead title="페이지를 찾을 수 없습니다" description="요청하신 페이지를 찾을 수 없습니다." :noindex="true" />

  <div class="container space-y-5 py-20 text-center">
    <p class="text-display text-muted-foreground">404</p>
    <p class="text-heading font-bold text-foreground">길을 잃었지만, 비용은 잃지 마세요</p>
    <p class="text-body text-muted-foreground">
      요청하신 페이지가 주차장 어딘가로 사라졌습니다. 아래 계산기에서 다시 출발해 보세요.
    </p>
    <div class="mx-auto mt-4 flex flex-wrap justify-center gap-3">
      <RouterLink class="retro-button" to="/tax">취등록세 계산기</RouterLink>
      <RouterLink class="retro-button-subtle" to="/insurance">보험 절약 시뮬레이터</RouterLink>
      <RouterLink class="retro-button-subtle" to="/lease-vs-loan">리스·할부·렌트 비교</RouterLink>
    </div>
  </div>
</template>
