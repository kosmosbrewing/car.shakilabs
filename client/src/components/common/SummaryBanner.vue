<script setup lang="ts">
import { computed } from "vue";
import { Share2, ChevronRight } from "lucide-vue-next";

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
  success: { badge: "bg-profit/12 text-profit", dot: "bg-profit" },
  danger: { badge: "bg-fee/12 text-fee", dot: "bg-fee" },
  neutral: { badge: "bg-muted text-foreground", dot: "bg-muted-foreground" },
} as const;

const tone = computed(() => toneClasses[props.deltaTone ?? "success"]);

defineEmits<{
  share: [];
  detail: [];
}>();
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <!-- 히어로 영역 -->
    <!-- highlight 밴드는 토큰을 우회한 주황 그라디언트(rgba(249,115,22,...))였고
         그 위 흰 글자가 2.70:1(라이트)·2.98:1(다크)로 대형 텍스트 기준 3:1마저 미달이었다.
         다른 5개 히어로 밴드와 같은 bg-primary + text-primary-foreground 규약으로 통일한다. -->
    <div
      :class="[
        'space-y-1 px-4 py-4 sm:px-5 sm:py-5',
        highlight ? 'bg-primary' : 'border-b border-border/40 bg-primary/6'
      ]"
    >
      <p
        :class="[
          'text-[11px] font-bold uppercase tracking-[0.14em] sm:text-caption',
          highlight ? 'text-primary-foreground/80' : 'text-muted-foreground'
        ]"
      >
        {{ leaderLabel ?? "비교 결과" }}
      </p>
      <p
        :class="[
          'text-display font-bold leading-none tabular-nums',
          highlight ? 'text-primary-foreground' : 'text-foreground'
        ]"
      >
        {{ leaderValue }}
      </p>
    </div>

    <!-- 델타 하이라이트 -->
    <div class="flex items-center justify-between border-b border-border/40 px-4 py-3 sm:px-5">
      <span class="flex items-center gap-2 text-caption font-semibold text-muted-foreground">
        <span class="h-2 w-2 shrink-0 rounded-full" :class="tone.dot" />
        {{ deltaLabel }}
      </span>
      <span
        :class="['inline-flex items-center rounded-full px-3 py-1 text-heading font-bold tabular-nums sm:text-h1', tone.badge]"
      >
        {{ deltaValue }}
      </span>
    </div>

    <!-- 팩트 행 -->
    <div v-if="facts && facts.length > 0" class="divide-y divide-border/40">
      <div
        v-for="fact in facts"
        :key="fact.label"
        class="flex items-center justify-between px-4 py-2.5 sm:px-5"
      >
        <span class="text-caption font-semibold text-muted-foreground">{{ fact.label }}</span>
        <span class="text-body font-bold tabular-nums">{{ fact.value }}</span>
      </div>
    </div>

    <!-- 설명 + 액션 -->
    <div class="space-y-3 border-t border-border/40 px-4 py-3 sm:px-5">
      <p class="text-caption leading-relaxed text-muted-foreground">
        {{ title }}
      </p>

      <div v-if="showDetail || showShare" class="flex flex-wrap items-center gap-2.5">
        <button
          v-if="showDetail"
          type="button"
          class="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-primary bg-primary px-3.5 py-2 text-caption font-semibold text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90 active:bg-primary/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          @click="$emit('detail')"
        >
          {{ detailLabel ?? "상세 비교 보기" }}
          <ChevronRight class="h-3.5 w-3.5" />
        </button>
        <button
          v-if="showShare"
          type="button"
          class="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border/70 bg-card px-3.5 py-2 text-caption font-semibold text-foreground shadow-sm transition-colors duration-200 hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          @click="$emit('share')"
        >
          <Share2 class="h-3.5 w-3.5" />
          결과 공유하기
        </button>
      </div>
    </div>
  </div>
</template>
