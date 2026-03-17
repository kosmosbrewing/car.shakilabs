<script setup lang="ts">
import { computed } from "vue";

interface SummaryFact {
  label: string;
  value: string;
}

const props = defineProps<{
  title: string;
  leaderValue: string;
  leaderLabel?: string;
  deltaValue: string;
  deltaLabel: string;
  deltaTone?: "success" | "danger" | "neutral";
  facts?: SummaryFact[];
  highlight?: boolean;
  showShare?: boolean;
  showDetail?: boolean;
  detailLabel?: string;
}>();

const toneClasses = {
  success: { row: "bg-profit/5 dark:bg-profit/12", badge: "bg-profit/12 text-profit" },
  danger: { row: "bg-fee/5 dark:bg-fee/12", badge: "bg-fee/12 text-fee" },
  neutral: { row: "bg-muted/30", badge: "bg-muted text-foreground" },
} as const;

const tone = computed(() => toneClasses[props.deltaTone ?? "success"]);

defineEmits<{
  share: [];
  detail: [];
}>();
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div
      :class="[
        'retro-titlebar flex-col items-start gap-1 rounded-t-2xl sm:flex-row sm:items-center sm:gap-3',
        highlight
          ? 'bg-[linear-gradient(135deg,rgba(249,115,22,0.96),rgba(251,146,60,0.88))]'
          : ''
      ]"
    >
      <p
        :class="[
          'text-[11px] font-bold uppercase tracking-[0.14em] sm:text-[13px]',
          highlight ? 'text-white/80' : 'text-muted-foreground'
        ]"
      >
        {{ leaderLabel ?? "비교 결과" }}
      </p>
      <p
        :class="[
          'text-[24px] font-bold leading-none sm:text-[32px]',
          highlight ? 'text-white' : 'text-foreground'
        ]"
      >
        {{ leaderValue }}
      </p>
    </div>

    <div class="retro-panel-content space-y-3.5 p-0 sm:p-0">
      <table class="w-full text-body">
        <tbody>
          <tr :class="['border-b border-border/40', tone.row]">
            <td class="whitespace-nowrap px-4 py-3 text-caption font-semibold text-muted-foreground">
              {{ deltaLabel }}
            </td>
            <td class="px-4 py-3 text-right">
              <span :class="['inline-flex items-center rounded-full px-3 py-1 text-[17px] font-bold tabular-nums sm:text-[22px]', tone.badge]">
                {{ deltaValue }}
              </span>
            </td>
          </tr>
          <tr
            v-for="(fact, index) in facts"
            :key="fact.label"
            :class="index < (facts?.length ?? 0) - 1 ? 'border-b border-border/40' : ''"
          >
            <td class="whitespace-nowrap px-4 py-2.5 text-caption font-semibold text-muted-foreground">
              {{ fact.label }}
            </td>
            <td class="px-4 py-2.5 text-right text-[14px] font-bold tabular-nums sm:text-[15px]">
              {{ fact.value }}
            </td>
          </tr>
        </tbody>
      </table>

      <div class="px-4 pb-1">
        <p class="text-caption leading-relaxed text-muted-foreground">
          {{ title }}
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2.5 border-t border-border/40 px-4 py-3">
        <button
          v-if="showDetail"
          type="button"
          class="inline-flex min-h-10 items-center justify-center rounded-lg border border-primary bg-primary px-3.5 py-2 text-[0.8125rem] font-semibold leading-[1.45] text-white shadow-sm transition-colors duration-200 hover:bg-primary/90 active:bg-primary/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          @click="$emit('detail')"
        >
          {{ detailLabel ?? "상세 비교 보기" }}
        </button>
        <button
          v-if="showShare"
          type="button"
          class="inline-flex min-h-10 items-center justify-center rounded-lg border border-primary bg-primary px-3.5 py-2 text-[0.8125rem] font-semibold leading-[1.45] text-white shadow-sm transition-colors duration-200 hover:bg-primary/90 active:bg-primary/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          @click="$emit('share')"
        >
          결과 공유하기
        </button>
      </div>
    </div>
  </div>
</template>
