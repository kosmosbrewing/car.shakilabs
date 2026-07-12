<script setup lang="ts">
import { computed } from "vue";
import { Fuel, TrendingDown, Zap } from "lucide-vue-next";
import RankedBars from "@/components/result-visualization/RankedBars.vue";
import { formatWon } from "@/lib/utils";
import type { EvVsGasResult } from "@/utils/ownershipCalculator";

const props = defineProps<{ result: EvVsGasResult }>();
const costItems = computed(() => [
  {
    key: "gas",
    label: "내연기관",
    value: props.result.gasTotal,
    detail: `연료비 ${formatWon(props.result.gasFuel)} 포함`,
    highlight: props.result.winner === "gas",
  },
  {
    key: "ev",
    label: "전기차",
    value: props.result.evTotal,
    detail: `충전비 ${formatWon(props.result.evFuel)} 포함`,
    highlight: props.result.winner === "ev",
  },
]);
</script>

<template>
  <section class="retro-panel overflow-hidden">
    <div class="space-y-1 bg-gradient-to-br from-primary via-primary to-primary/80 px-4 py-4 sm:px-5 sm:py-5">
      <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-white/80 sm:text-caption">더 유리한 쪽</p>
      <p class="text-display font-bold leading-none text-white">{{ result.winner === "ev" ? "전기차" : "내연기관" }}</p>
    </div>
    <div class="flex items-center justify-between border-b border-border/40 px-4 py-3 sm:px-5">
      <span class="flex items-center gap-2 text-caption font-semibold text-muted-foreground">
        <span class="h-2 w-2 shrink-0 rounded-full bg-profit" />
        연간 절감 차이
      </span>
      <span class="rounded-full bg-profit/12 px-3 py-1 text-heading font-bold tabular-nums text-profit sm:text-h1">
        {{ formatWon(result.gap) }}
      </span>
    </div>
  </section>

  <div class="grid gap-3 md:grid-cols-2">
    <article
      v-for="option in [
        { key: 'gas', label: '내연기관', total: result.gasTotal, fuel: result.gasFuel },
        { key: 'ev', label: '전기차', total: result.evTotal, fuel: result.evFuel },
      ]"
      :key="option.key"
      class="overflow-hidden rounded-2xl border bg-card p-4 shadow-sm"
      :class="result.winner === option.key ? 'border-profit/40' : 'border-border/70'"
    >
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-tiny font-semibold text-muted-foreground">{{ option.label }} 연간 총비용</p>
          <p class="mt-2 text-h1 font-bold tabular-nums" :class="result.winner === option.key ? 'text-profit' : 'text-foreground'">
            {{ formatWon(option.total) }}
          </p>
          <p class="mt-1 text-tiny text-muted-foreground">에너지 비용 {{ formatWon(option.fuel) }}</p>
        </div>
        <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Fuel v-if="option.key === 'gas'" class="h-5 w-5" />
          <Zap v-else class="h-5 w-5" />
        </span>
      </div>
      <span v-if="result.winner === option.key" class="mt-3 inline-flex items-center gap-1 rounded-full bg-profit px-2.5 py-0.5 text-[11px] font-semibold text-white">
        <TrendingDown class="h-3 w-3" /> 더 유리
      </span>
    </article>
  </div>

  <RankedBars
    title="연간 비용 비교"
    note="막대 길이는 연간 연료·보험·세금·정비 비용 합계에 직접 비례하며 짧을수록 유리합니다."
    :items="costItems"
    :format-value="formatWon"
  />
</template>
