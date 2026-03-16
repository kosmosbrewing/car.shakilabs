<script setup lang="ts">
import { leaseGuideItems } from "@/data/leaseGuide";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">나에게 맞는 방식 가이드</h2>
    </div>
    <div class="retro-panel-content">
      <Accordion type="single" collapsible>
        <AccordionItem
          v-for="(item, index) in leaseGuideItems"
          :key="item.q"
          :value="`lease-guide-${index}`"
        >
          <AccordionTrigger class="text-caption text-left">
            {{ item.q }}
          </AccordionTrigger>
          <AccordionContent>{{ item.a }}</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  </div>
</template>
