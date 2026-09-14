<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import {
  ShPrimaryNavigation,
  type PrimaryNavigationItem,
} from "@shakilabs/ui";
import { CAR_TOOLS } from "@/data/carNavigation";

const route = useRoute();
const tabs: readonly PrimaryNavigationItem[] = [
  { key: "all", label: "차량 도구", to: "/all" },
  ...CAR_TOOLS.map((tool) => ({
    key: tool.key,
    label: tool.navigationLabel,
    to: tool.path,
  })),
];

const mobileDefaultKeys = [
  "all",
  "tax",
  "insurance",
  "lease-vs-loan",
  "maintenance",
  "ev-vs-gas",
] as const;

const activeItem = computed(() => tabs.find((item) =>
  route.path === item.to || route.path.startsWith(`${item.to}/`),
));

const mobileItems = computed(() => {
  const keys: string[] = [...mobileDefaultKeys];

  if (activeItem.value && !keys.includes(activeItem.value.key)) {
    keys[4] = activeItem.value.key;
  }

  return keys
    .map((key) => tabs.find((item) => item.key === key))
    .filter((item): item is PrimaryNavigationItem => Boolean(item));
});
</script>

<template>
  <!-- 모바일(<48rem)은 헤더의 좌측 드로어가 대신한다(v3 §3.3-1).
       링크는 드로어에 그대로 렌더되므로 크롤 경로는 유지된다. -->
  <ShPrimaryNavigation
    class="tab-navigation--desktop-only"
    :items="tabs"
    :mobile-items="mobileItems"
    :active-key="activeItem?.key"
    :link-component="RouterLink"
  />
</template>

<style scoped>
@media (max-width: 47.99rem) {
  .tab-navigation--desktop-only {
    display: none;
  }
}
</style>
