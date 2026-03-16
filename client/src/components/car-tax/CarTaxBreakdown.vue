<script setup lang="ts">
import { formatWon } from "@/lib/utils";
import type { CarTaxBreakdown } from "@/utils/calculator";

defineProps<{
  result: CarTaxBreakdown;
}>();
</script>

<template>
  <section class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">세부 내역</h2>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-body">
        <thead>
          <tr class="border-b border-border/70 bg-muted/20 text-left text-caption text-muted-foreground">
            <th class="px-4 py-3 font-semibold">항목</th>
            <th class="px-4 py-3 text-right font-semibold">금액</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in result.items"
            :key="item.label"
            class="border-b border-border/40 last:border-b-0"
          >
            <td class="px-4 py-3">{{ item.label }}</td>
            <td class="px-4 py-3 text-right font-semibold tabular-nums">{{ formatWon(item.value) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
