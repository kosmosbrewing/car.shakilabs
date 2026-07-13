<script setup lang="ts">
import { leaseGuideItems } from "@/data/leaseGuide";
import FaqAccordionPanel from "@/components/common/FaqAccordionPanel.vue";
</script>

<template>
  <FaqAccordionPanel title="나에게 맞는 방식 가이드" :items="leaseGuideItems" />
</template>
