<script setup lang="ts">
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

defineProps<{
  faqs: ReadonlyArray<{ q: string; a: string }>;
}>();
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">자주 묻는 질문</h2>
    </div>
    <div class="retro-panel-content">
      <Accordion type="single" collapsible>
        <AccordionItem
          v-for="(faq, index) in faqs"
          :key="faq.q"
          :value="`car-tax-${index}`"
        >
          <AccordionTrigger class="text-caption text-left">
            {{ faq.q }}
          </AccordionTrigger>
          <AccordionContent>{{ faq.a }}</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  </div>
</template>
