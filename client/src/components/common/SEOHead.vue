<script setup lang="ts">
import { useSEO, type TitleKind } from "@/composables/useSEO";

const props = defineProps<{
  title: string;
  description: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noindex?: boolean;
  /** 기본 "tool". 허브(/all)·소개·약관·개인정보·404만 "site"로 넘긴다(useSEO 참고). */
  titleKind?: TitleKind;
  /** Canonical consolidation target for amount-variant routes (see useSEO). */
  canonicalPath?: string;
}>();

useSEO({
  title: () => props.title,
  description: () => props.description,
  jsonLd: () => props.jsonLd,
  noindex: () => props.noindex,
  titleKind: () => props.titleKind,
  canonicalPath: () => props.canonicalPath,
});
</script>

<template>
</template>
