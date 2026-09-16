<script setup lang="ts">
import { ShSurface } from "@shakilabs/ui";
import AppHeader from "@/components/layout/AppHeader.vue";
import AppFooter from "@/components/layout/AppFooter.vue";
import TabNavigation from "@/components/common/TabNavigation.vue";
</script>

<template>
  <ShSurface
    as="div"
    variant="plain"
    padding="none"
    class="design-system-shell min-h-screen flex flex-col bg-background"
  >
    <!-- 본문 바로가기는 ShGlobalHeader가 자체 SkipLink로 렌더한다(v3 §3.1) — 중복 링크 제거 -->
    <AppHeader />
    <TabNavigation />
    <main id="main-content" tabindex="-1" class="relative flex-1">
      <slot />
    </main>
    <AppFooter />
  </ShSurface>
</template>
