<script setup lang="ts">
import { computed } from "vue";
import CopyTableButton from "@/components/common/CopyTableButton.vue";
import { formatWon } from "@/lib/utils";
import type { LeaseCompareResult } from "@/utils/calculator";

const props = defineProps<{
  result: LeaseCompareResult;
}>();

const sortedMethods = computed(() =>
  [...props.result.methods].sort((a, b) => a.totalCost - b.totalCost)
);

function costText(value: number, included: boolean): string {
  return included ? "포함" : formatWon(value);
}

const copyHeaders = computed(() => ["항목", ...sortedMethods.value.map((method) => method.label)]);
const copyRows = computed(() => [
  ["월 납입금", ...sortedMethods.value.map((method) => formatWon(method.monthlyPayment))],
  ["선수금", ...sortedMethods.value.map((method) => formatWon(method.deposit))],
  ["총 납입금", ...sortedMethods.value.map((method) => formatWon(method.totalInstallment))],
  ["잔존가치", ...sortedMethods.value.map((method) => (method.residualValue > 0 ? formatWon(method.residualValue) : "-"))],
  ["보험료", ...sortedMethods.value.map((method) => costText(method.insuranceCost, method.includesInsurance))],
  ["취등록세", ...sortedMethods.value.map((method) => costText(method.taxCost, method.includesTax))],
  ["총비용", ...sortedMethods.value.map((method) => formatWon(method.totalCost))],
  ["비교기준", ...sortedMethods.value.map((method) => method.comparisonNote)],
  ["소유권", ...sortedMethods.value.map((method) => method.ownership)],
]);
</script>

<template>
  <div class="hidden md:block">
    <div class="mb-2 flex justify-end">
      <CopyTableButton :headers="copyHeaders" :rows="copyRows" />
    </div>
    <div class="overflow-hidden rounded-2xl border border-border/70 bg-card">
      <table class="w-full table-fixed text-body">
        <thead>
          <tr class="border-b border-border/80 bg-muted/25">
            <th class="px-4 py-3 text-left text-caption font-semibold text-muted-foreground">항목</th>
            <th
              v-for="(method, index) in sortedMethods"
              :key="method.method"
              class="px-4 py-3 text-center text-caption font-semibold"
              :class="index === 0 ? 'bg-profit/8 text-profit' : 'text-foreground'"
            >
              {{ method.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-border/40">
            <td class="px-4 py-3 text-caption text-muted-foreground">월 납입금</td>
            <td v-for="(method, index) in sortedMethods" :key="`${method.method}-monthly`" class="px-4 py-3 text-center font-semibold tabular-nums" :class="index === 0 ? 'bg-profit/8' : ''">{{ formatWon(method.monthlyPayment) }}</td>
          </tr>
          <tr class="border-b border-border/40">
            <td class="px-4 py-3 text-caption text-muted-foreground">선수금</td>
            <td v-for="(method, index) in sortedMethods" :key="`${method.method}-deposit`" class="px-4 py-3 text-center font-semibold tabular-nums" :class="index === 0 ? 'bg-profit/8' : ''">{{ formatWon(method.deposit) }}</td>
          </tr>
          <tr class="border-b border-border/40">
            <td class="px-4 py-3 text-caption text-muted-foreground">총 납입금</td>
            <td v-for="(method, index) in sortedMethods" :key="`${method.method}-installment`" class="px-4 py-3 text-center font-semibold tabular-nums" :class="index === 0 ? 'bg-profit/8' : ''">{{ formatWon(method.totalInstallment) }}</td>
          </tr>
          <tr class="border-b border-border/40">
            <td class="px-4 py-3 text-caption text-muted-foreground">잔존가치</td>
            <td v-for="(method, index) in sortedMethods" :key="`${method.method}-residual`" class="px-4 py-3 text-center font-semibold tabular-nums" :class="index === 0 ? 'bg-profit/8' : ''">{{ method.residualValue > 0 ? formatWon(method.residualValue) : "-" }}</td>
          </tr>
          <tr class="border-b border-border/40">
            <td class="px-4 py-3 text-caption text-muted-foreground">보험료</td>
            <td v-for="(method, index) in sortedMethods" :key="`${method.method}-insurance`" class="px-4 py-3 text-center font-semibold tabular-nums" :class="index === 0 ? 'bg-profit/8' : ''">{{ costText(method.insuranceCost, method.includesInsurance) }}</td>
          </tr>
          <tr class="border-b border-border/40">
            <td class="px-4 py-3 text-caption text-muted-foreground">취등록세</td>
            <td v-for="(method, index) in sortedMethods" :key="`${method.method}-tax`" class="px-4 py-3 text-center font-semibold tabular-nums" :class="index === 0 ? 'bg-profit/8' : ''">{{ costText(method.taxCost, method.includesTax) }}</td>
          </tr>
          <tr class="border-b border-border/40">
            <td class="px-4 py-3 text-caption text-muted-foreground">총비용</td>
            <td v-for="(method, index) in sortedMethods" :key="`${method.method}-total`" class="px-4 py-3 text-center font-bold tabular-nums" :class="index === 0 ? 'bg-profit/8 text-profit' : ''">{{ formatWon(method.totalCost) }}</td>
          </tr>
          <tr>
            <td class="px-4 py-3 text-caption text-muted-foreground">비교기준</td>
            <td v-for="(method, index) in sortedMethods" :key="`${method.method}-comparison-note`" class="px-4 py-3 text-center text-caption font-semibold" :class="index === 0 ? 'bg-profit/8' : ''">{{ method.comparisonNote }}</td>
          </tr>
          <tr>
            <td class="px-4 py-3 text-caption text-muted-foreground">소유권</td>
            <td v-for="(method, index) in sortedMethods" :key="`${method.method}-ownership`" class="px-4 py-3 text-center text-caption font-semibold" :class="index === 0 ? 'bg-profit/8' : ''">{{ method.ownership }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
