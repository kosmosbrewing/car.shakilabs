<script setup lang="ts">
import { computed } from "vue";
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
</script>

<template>
  <nav class="sticky top-0 z-50 border-b border-primary/20 bg-primary shadow-sm" aria-label="주요 메뉴">
    <div class="container">
      <div class="flex h-12 items-center gap-1 overflow-x-auto sm:gap-2" style="scrollbar-width: none">
        <RouterLink
          v-for="tab in tabs"
          :key="tab.key"
          :to="tab.to"
          :aria-current="isActiveTab(tab.to) ? 'page' : undefined"
          :class="[
            'touch-target relative inline-flex h-12 shrink-0 items-center whitespace-nowrap px-2.5 text-caption font-semibold transition-all duration-200 sm:px-3 sm:text-body',
            isActiveTab(tab.to)
              ? 'text-white hover:text-white'
              : 'text-white/70 hover:text-white/90',
          ]"
        >
          {{ tab.label }}
          <span
            v-if="isActiveTab(tab.to)"
            class="absolute inset-x-1 bottom-0 h-[3px] rounded-full bg-white"
          />
        </RouterLink>
      </div>
    </div>
  </nav>
</template>
