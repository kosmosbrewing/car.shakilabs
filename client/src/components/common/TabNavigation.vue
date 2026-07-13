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
  <ShPrimaryNavigation
    :items="tabs"
    :mobile-items="mobileItems"
    :active-key="activeItem?.key"
    :link-component="RouterLink"
  />
</template>
