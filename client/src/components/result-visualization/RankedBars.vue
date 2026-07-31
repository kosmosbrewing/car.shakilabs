<script setup lang="ts">
// 차트 본체는 @shakilabs/ui ShRankedBars — 이 파일은 car 레트로 패널 크롬만 입힌다.
// 호출부 3곳의 props 시그니처는 그대로 유지한다.
import { ShRankedBars } from "@shakilabs/ui";

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

// 패키지는 '산출 불가'(null)를 허용하지만 이 앱 항목은 항상 숫자다.
// 호출부 formatValue 시그니처를 건드리지 않으려고 어댑터만 끼운다.
const formatBarValue = (value: number | null) => props.formatValue(value ?? 0);
</script>

<template>
  <!-- highlight=success(=--profit), 비강조=primary — 승격 전 fill-profit / fill-primary/70 색을
       그대로 쓰기 위해 main.css 끝에서 톤 색을 앱 의미색으로 고정한다. -->
  <ShRankedBars
    class="retro-panel retro-ranked-bars overflow-hidden"
    :items="items"
    :note="note"
    :format-value="formatBarValue"
    highlight-tone="success"
    base-tone="primary"
  >
    <template #header="{ titleId }">
      <div class="retro-titlebar rounded-t-2xl">
        <h2 :id="titleId" class="retro-title">{{ title }}</h2>
      </div>
    </template>
  </ShRankedBars>
</template>
