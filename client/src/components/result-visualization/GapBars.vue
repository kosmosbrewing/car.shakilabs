<script setup lang="ts">
// 차트 본체는 @shakilabs/ui ShGapBars(1위 대비 차이 막대) — 이 파일은 car 레트로 패널 크롬만 입힌다.
// 선택지 총액이 비슷해 0부터 그린 막대(RankedBars)로는 차이가 보이지 않을 때 쓴다.
import { ShGapBars } from "@shakilabs/ui";
import type { GapBarItem, GapDirection } from "@shakilabs/ui";

defineProps<{
  title: string;
  note: string;
  items: readonly GapBarItem[];
  formatValue: (value: number) => string;
  better: GapDirection;
}>();
</script>

<template>
  <ShGapBars
    class="retro-panel car-gap-bars overflow-hidden"
    :items="items"
    :note="note"
    :format-value="formatValue"
    :better="better"
    highlight-tone="success"
  >
    <template #header="{ titleId }">
      <div class="retro-titlebar rounded-t-2xl">
        <h2 :id="titleId" class="retro-title">{{ title }}</h2>
      </div>
    </template>
  </ShGapBars>
</template>

<style scoped>
/* 타이틀바는 패널 폭 전체(풀블리드), 설명문·목록에만 retro-panel-content와 같은 여백 — RankedBars와 동일 */
.car-gap-bars {
  --car-chart-pad-x: 0.875rem;
  --car-chart-pad-y: 0.75rem;
  gap: 0;
}

@media (min-width: 640px) {
  .car-gap-bars {
    --car-chart-pad-x: 1.25rem;
    --car-chart-pad-y: 1rem;
  }
}

.car-gap-bars :deep(.sh-chart__header) {
  gap: 0;
}

.car-gap-bars :deep(.sh-chart__note) {
  padding: var(--car-chart-pad-y) var(--car-chart-pad-x) 0;
}

.car-gap-bars :deep(.sh-gap-bars__list) {
  padding: 1rem var(--car-chart-pad-x) var(--car-chart-pad-y);
}
</style>
