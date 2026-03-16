<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
import { RouterLink } from "vue-router";
</script>

<template>
  <SEOHead title="페이지를 찾을 수 없습니다" description="요청하신 페이지를 찾을 수 없습니다." :noindex="true" />

  <div class="container space-y-4 py-20 text-center">
    <p class="text-display text-muted-foreground">404</p>
    <p class="text-heading font-bold text-foreground">페이지를 찾을 수 없습니다</p>
    <p class="text-body text-muted-foreground">
      경로가 바뀌었거나 존재하지 않는 계산기입니다. 취등록세 계산기부터 다시 이동해 주세요.
    </p>
    <RouterLink class="retro-button mx-auto mt-4" to="/tax">
      취등록세 계산기로 이동
    </RouterLink>
  </div>
</template>
