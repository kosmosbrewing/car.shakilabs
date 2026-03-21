<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { useRoute, RouterLink } from "vue-router";

const route = useRoute();

const tabs = [
  { key: "tax", label: "취등록세", to: "/tax" },
  { key: "insurance", label: "보험 절약", to: "/insurance" },
  { key: "lease", label: "리스·할부·렌트", to: "/lease-vs-loan" },
  { key: "parking", label: "주차비 비교", to: "/parking" },
  { key: "maintenance", label: "유지비 계산", to: "/maintenance" },
  { key: "ev-vs-gas", label: "전기차 비교", to: "/ev-vs-gas" },
] as const;

const activePath = computed(() => route.path);

function isActiveTab(path: string): boolean {
  return activePath.value === path;
}

const scrollEl = ref<HTMLElement | null>(null);
const showFade = ref(true);

function checkScroll() {
  const el = scrollEl.value;
  if (!el) return;
  showFade.value = el.scrollWidth - el.scrollLeft - el.clientWidth > 8;
}

onMounted(() => {
  const el = scrollEl.value;
  if (el) {
    el.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();
  }
});

onBeforeUnmount(() => {
  scrollEl.value?.removeEventListener("scroll", checkScroll);
});
</script>

<template>
  <nav class="sticky top-0 z-50 border-b border-primary/20 bg-primary shadow-sm" aria-label="주요 메뉴">
    <div class="container relative">
      <div ref="scrollEl" class="flex h-12 items-center gap-2 overflow-x-auto" style="scrollbar-width: none">
        <RouterLink
          v-for="tab in tabs"
          :key="tab.key"
          :to="tab.to"
          :aria-current="isActiveTab(tab.to) ? 'page' : undefined"
          :class="[
            'touch-target relative inline-flex h-12 shrink-0 items-center justify-center px-3 text-center text-[0.82rem] font-semibold leading-tight transition-all duration-200 sm:text-body',
            isActiveTab(tab.to)
              ? 'text-primary-foreground'
              : 'text-primary-foreground/70 hover:text-primary-foreground/90',
          ]"
        >
          <span class="break-keep">{{ tab.label }}</span>
          <span
            v-if="isActiveTab(tab.to)"
            class="absolute inset-x-1 bottom-0 h-[3px] rounded-full bg-white"
          />
        </RouterLink>
      </div>
      <!-- 스크롤 힌트: 우측 그라디언트 fade -->
      <div
        v-show="showFade"
        class="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-primary to-transparent"
        aria-hidden="true"
      />
    </div>
  </nav>
</template>
