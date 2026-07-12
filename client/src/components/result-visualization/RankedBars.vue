<script setup lang="ts">
import { computed, useId } from "vue";
import { positiveBarWidth } from "@/utils/chartMath";

type BarItem = {
  key: string;
  label: string;
  value: number;
  detail?: string;
  highlight?: boolean;
};
const props = defineProps<{
  title: string;
  note: string;
  items: readonly BarItem[];
  formatValue: (value: number) => string;
}>();

const titleId = `ranked-bars-${useId()}`;
const maximum = computed(() => Math.max(...props.items.map((item) => item.value), 0));
</script>

<template>
  <section class="retro-panel overflow-hidden" :aria-labelledby="titleId">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 :id="titleId" class="retro-title">{{ title }}</h2>
    </div>
    <div class="retro-panel-content space-y-4">
      <p class="text-tiny leading-relaxed text-muted-foreground">{{ note }}</p>
      <ol class="space-y-3">
        <li v-for="item in items" :key="item.key" class="space-y-1.5">
          <div class="flex items-baseline justify-between gap-3">
            <span class="text-caption font-semibold text-foreground">{{ item.label }}</span>
            <strong class="text-caption tabular-nums" :class="item.highlight ? 'text-profit' : 'text-foreground'">
              {{ formatValue(item.value) }}
            </strong>
          </div>
          <div class="h-3 overflow-hidden rounded-full bg-muted/50">
            <svg viewBox="0 0 100 12" preserveAspectRatio="none" class="block h-full w-full" aria-hidden="true">
              <rect
                :width="positiveBarWidth(item.value, maximum)"
                height="12"
                rx="4"
                :class="item.highlight ? 'fill-profit' : 'fill-primary/70'"
              />
            </svg>
          </div>
          <p v-if="item.detail" class="text-tiny leading-relaxed text-muted-foreground">{{ item.detail }}</p>
        </li>
      </ol>
    </div>
  </section>
</template>
