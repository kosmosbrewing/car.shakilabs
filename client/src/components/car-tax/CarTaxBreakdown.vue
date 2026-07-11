<script setup lang="ts">
import { ShTable, ShTableBody, ShTableCell, ShTableHead, ShTableHeader, ShTableRow } from "@shakilabs/ui";
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

    <ShTable aria-label="자동차 세금 세부 내역" density="compact" min-width="18rem">
      <ShTableHeader>
        <ShTableRow>
          <ShTableHead>항목</ShTableHead>
          <ShTableHead numeric>금액</ShTableHead>
        </ShTableRow>
      </ShTableHeader>
      <ShTableBody>
        <ShTableRow
          v-for="item in result.items"
          :key="item.label"
        >
          <ShTableCell>{{ item.label }}</ShTableCell>
          <ShTableCell numeric emphasis>{{ formatWon(item.value) }}</ShTableCell>
        </ShTableRow>
      </ShTableBody>
    </ShTable>
  </section>
</template>
