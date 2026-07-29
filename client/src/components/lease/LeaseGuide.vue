<script setup lang="ts">
import { leaseGuideItems } from "@/data/leaseGuide";
import FaqAccordionPanel from "@/components/common/FaqAccordionPanel.vue";

defineProps<{
  // 페이지 하단 SeoRichGuide FAQ와 중복 노출되지 않도록 병합할 보조 문항
  extra?: ReadonlyArray<{ q: string; a: string }>;
}>();
</script>

<template>
  <FaqAccordionPanel title="나에게 맞는 방식 가이드" :items="leaseGuideItems" :extra="extra" />
</template>
