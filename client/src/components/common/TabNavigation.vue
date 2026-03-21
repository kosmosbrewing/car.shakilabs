<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, nextTick, watch } from "vue";
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
const showLeftFade = ref(false);
const showRightFade = ref(false);

function checkScroll() {
  const el = scrollEl.value;
  if (!el) return;
  showLeftFade.value = el.scrollLeft > 8;
  showRightFade.value = el.scrollWidth - el.scrollLeft - el.clientWidth > 8;
}

onMounted(() => {
  const el = scrollEl.value;
  if (el) {
    el.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();
  }
  window.addEventListener("resize", checkScroll);
});

onBeforeUnmount(() => {
  scrollEl.value?.removeEventListener("scroll", checkScroll);
  window.removeEventListener("resize", checkScroll);
});

watch(
  () => route.path,
  async () => {
    await nextTick();
    checkScroll();
  },
  { immediate: true }
);
</script>

<template>
  <nav class="sticky top-0 z-50 border-b border-primary/20 bg-primary shadow-sm" aria-label="주요 메뉴">
    <div class="container relative px-3 py-1.5 sm:px-4 sm:py-0">
      <div
        ref="scrollEl"
        class="tab-scroll grid grid-cols-3 gap-x-1 gap-y-0.5 sm:flex sm:h-12 sm:items-center sm:gap-2 sm:overflow-x-auto sm:py-0"
      >
        <RouterLink
          v-for="tab in tabs"
          :key="tab.key"
          :to="tab.to"
          :aria-current="isActiveTab(tab.to) ? 'page' : undefined"
          :class="[
            'relative flex items-center justify-center rounded-lg px-1 py-2 text-center text-[0.7rem] font-medium leading-tight transition-colors duration-150',
            'sm:h-12 sm:shrink-0 sm:rounded-none sm:px-3 sm:py-0 sm:text-body sm:font-semibold',
            isActiveTab(tab.to)
              ? 'bg-white/20 font-semibold text-white sm:bg-transparent sm:text-primary-foreground sm:shadow-none'
              : 'text-primary-foreground/70 active:bg-white/10 sm:bg-transparent sm:hover:text-primary-foreground',
          ]"
        >
          <span class="break-keep">{{ tab.label }}</span>
          <span
            v-if="isActiveTab(tab.to)"
            class="absolute inset-x-1 bottom-0 hidden h-[3px] rounded-full bg-white sm:block"
          />
        </RouterLink>
      </div>
      <div
        v-show="showLeftFade"
        class="pointer-events-none absolute left-0 top-0 hidden h-full w-10 bg-gradient-to-r from-primary to-transparent sm:block"
        aria-hidden="true"
      />
      <div
        v-show="showRightFade"
        class="pointer-events-none absolute right-0 top-0 hidden h-full w-10 bg-gradient-to-l from-primary to-transparent sm:block"
        aria-hidden="true"
      />
    </div>
  </nav>
</template>

<style scoped>
.tab-scroll {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.tab-scroll::-webkit-scrollbar {
  display: none;
}
</style>
