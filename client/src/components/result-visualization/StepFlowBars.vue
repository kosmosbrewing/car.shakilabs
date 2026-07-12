<script setup lang="ts">
import { computed, useId } from "vue";
import { positiveBarWidth } from "@/utils/chartMath";

type FlowStep = { key: string; label: string; value: number; change?: number };
const props = defineProps<{
  title: string;
  steps: readonly FlowStep[];
  formatValue: (value: number) => string;
}>();

const titleId = `step-flow-${useId()}`;
const maximum = computed(() => Math.max(...props.steps.map((step) => step.value), 0));
</script>

<template>
  <section class="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-3.5" :aria-labelledby="titleId">
    <div>
      <h3 :id="titleId" class="text-caption font-semibold text-foreground">{{ title }}</h3>
      <p class="mt-1 text-tiny text-muted-foreground">각 막대는 해당 단계 적용 후 남은 연 보험료입니다.</p>
    </div>
    <ol class="space-y-3">
      <li v-for="step in steps" :key="step.key" class="space-y-1.5">
        <div class="flex items-baseline justify-between gap-3">
          <span class="text-caption text-foreground">{{ step.label }}</span>
          <span class="shrink-0 text-caption tabular-nums">
            <span v-if="step.change" class="mr-2" :class="step.change < 0 ? 'text-profit' : 'text-fee'">
              {{ step.change > 0 ? '+' : '-' }}{{ formatValue(Math.abs(step.change)) }}
            </span>
            <strong>{{ formatValue(step.value) }}</strong>
          </span>
        </div>
        <div class="h-3 overflow-hidden rounded-full bg-muted/55">
          <svg viewBox="0 0 100 12" preserveAspectRatio="none" class="block h-full w-full" aria-hidden="true">
            <rect
              :width="positiveBarWidth(step.value, maximum)"
              height="12"
              rx="4"
              :class="step.change && step.change > 0 ? 'fill-fee' : 'fill-primary'"
            />
          </svg>
        </div>
      </li>
    </ol>
  </section>
</template>
