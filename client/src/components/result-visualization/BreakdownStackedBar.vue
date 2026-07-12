<script setup lang="ts">
import { computed, useId } from "vue";
import { normalizeSegments } from "@/utils/chartMath";

type Tone = "fee" | "primary" | "muted" | "info";
type Segment = { key: string; label: string; value: number; tone: Tone };
const props = defineProps<{
  label: string;
  segments: readonly Segment[];
  formatValue: (value: number) => string;
}>();

const chartId = `breakdown-${useId()}`;
const ratios = computed(() => normalizeSegments(props.segments.map((segment) => segment.value)));
const offsets = computed(() => ratios.value.map((_, index) =>
  ratios.value.slice(0, index).reduce((sum, ratio) => sum + ratio, 0),
));

function fillClass(tone: Tone): string {
  if (tone === "fee") return "fill-fee";
  if (tone === "muted") return "fill-muted-foreground/55";
  if (tone === "info") return "fill-status-info";
  return "fill-primary";
}

function markerClass(tone: Tone): string {
  if (tone === "fee") return "bg-fee";
  if (tone === "muted") return "bg-muted-foreground/55";
  if (tone === "info") return "bg-status-info";
  return "bg-primary";
}
</script>

<template>
  <div class="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-3.5">
    <p :id="chartId" class="text-caption font-semibold text-foreground">{{ label }}</p>
    <svg
      v-if="ratios.some((ratio) => ratio > 0)"
      viewBox="0 0 100 20"
      preserveAspectRatio="none"
      class="h-5 w-full overflow-hidden rounded-lg border border-border/40"
      role="img"
      :aria-labelledby="chartId"
    >
      <rect
        v-for="(segment, index) in segments"
        :key="segment.key"
        :x="offsets[index] * 100"
        :width="ratios[index] * 100"
        height="20"
        :class="fillClass(segment.tone)"
      />
    </svg>
    <dl class="grid grid-cols-2 gap-2 text-caption sm:grid-cols-4">
      <div v-for="segment in segments" :key="`${segment.key}-legend`" class="min-w-0 space-y-0.5">
        <dt class="flex items-center gap-1.5 text-muted-foreground">
          <span class="h-2.5 w-2.5 shrink-0 rounded-sm" :class="markerClass(segment.tone)" />
          {{ segment.label }}
        </dt>
        <dd class="font-semibold tabular-nums">{{ formatValue(segment.value) }}</dd>
      </div>
    </dl>
  </div>
</template>
