<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import {
  ShPrimaryNavigation,
  type PrimaryNavigationItem,
} from "@shakilabs/ui";

const route = useRoute();
const tabs: readonly PrimaryNavigationItem[] = [
  { key: "tax", label: "취등록세", to: "/tax" },
  { key: "insurance", label: "보험 절약", to: "/insurance" },
  { key: "lease", label: "리스·할부·렌트", to: "/lease-vs-loan" },
  { key: "parking", label: "주차비 비교", to: "/parking" },
  { key: "maintenance", label: "유지비 계산", to: "/maintenance" },
  { key: "ev-vs-gas", label: "전기차 비교", to: "/ev-vs-gas" },
];

const activeItem = computed(() =>
  tabs.find((item) => route.path === item.to),
);
</script>

<template>
  <ShPrimaryNavigation
    :items="tabs"
    :active-key="activeItem?.key"
    :link-component="RouterLink"
  />
</template>
