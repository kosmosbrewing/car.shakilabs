<script setup lang="ts">
import AppHeader from "@/components/layout/AppHeader.vue";
import AppFooter from "@/components/layout/AppFooter.vue";
import TabNavigation from "@/components/common/TabNavigation.vue";
</script>

<template>
  <div
    class="min-h-screen flex flex-col bg-background bg-[radial-gradient(900px_420px_at_10%_-10%,hsl(var(--primary)/0.16),transparent_62%),radial-gradient(780px_360px_at_100%_0%,hsl(var(--primary)/0.09),transparent_58%)]"
  >
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[100] focus:rounded focus:bg-background focus:px-3 focus:py-2 focus:text-caption focus:font-semibold"
    >
      본문 바로가기
    </a>
    <AppHeader />
    <TabNavigation />
    <main id="main-content" tabindex="-1" class="relative flex-1">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
