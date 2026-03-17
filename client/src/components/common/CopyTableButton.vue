<script setup lang="ts">
import { ref, onBeforeUnmount } from "vue";
import { Copy, Check } from "lucide-vue-next";
import { copyToClipboard } from "@/lib/routeState";

const props = defineProps<{
  headers: string[];
  rows: string[][];
}>();

const copied = ref(false);
let timer: ReturnType<typeof setTimeout> | null = null;

function formatTsv(): string {
  const lines = [props.headers.join("\t")];
  for (const row of props.rows) {
    lines.push(row.join("\t"));
  }
  return lines.join("\n");
}

async function handleCopy() {
  const ok = await copyToClipboard(formatTsv());
  if (!ok) return;

  copied.value = true;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    copied.value = false;
  }, 2000);
}

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer);
});
</script>

<template>
  <button
    type="button"
    class="inline-flex h-6 items-center gap-0.5 rounded-lg border bg-background px-1.5 text-[11px] font-semibold leading-none text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    :class="copied ? 'border-profit/50 text-profit' : 'border-border'"
    @click="handleCopy"
  >
    <component :is="copied ? Check : Copy" class="h-2.5 w-2.5" />
    {{ copied ? "복사됨" : "복사" }}
  </button>
</template>
