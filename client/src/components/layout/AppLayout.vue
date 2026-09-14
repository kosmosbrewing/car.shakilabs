<script setup lang="ts">
import { ShSurface } from "@shakilabs/ui";
import AppHeader from "@/components/layout/AppHeader.vue";
import AppFooter from "@/components/layout/AppFooter.vue";
import TabNavigation from "@/components/common/TabNavigation.vue";
import TickerBar from "@/components/common/TickerBar.vue";
import { tickerMessages } from "@/data/tickerMessages";
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
    <!-- v3 §3.2 BL-005 — 헤더 안에 있던 팁 문구를 본문 쪽 얇은 캡션 바로 내림.
         상태색이 아니므로 Banner(좌측 4px 상태색)가 아니라 중성 caption 줄로 처리 -->
    <div class="border-b border-border bg-background px-4 py-1.5 text-center">
      <TickerBar :messages="tickerMessages" />
    </div>
    <main id="main-content" tabindex="-1" class="relative flex-1">
      <slot />
    </main>
    <AppFooter />
  </ShSurface>
</template>
