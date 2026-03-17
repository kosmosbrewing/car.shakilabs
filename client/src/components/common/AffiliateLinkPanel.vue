<script setup lang="ts">
import { ExternalLink } from "lucide-vue-next";
import type { AffiliateItem } from "@/data/affiliateLinks";

defineProps<{
  title: string;
  description: string;
  items: AffiliateItem[];
}>();
</script>

<template>
  <section v-if="items.length > 0" class="retro-panel p-4 space-y-3">
    <div class="space-y-1">
      <p class="text-caption font-semibold text-primary">쿠팡에서 최저가 확인</p>
      <h2 class="text-heading font-bold text-foreground">{{ title }}</h2>
      <p class="text-caption leading-relaxed text-muted-foreground">{{ description }}</p>
    </div>

    <div class="grid gap-2 sm:grid-cols-2">
      <a
        v-for="item in items"
        :key="item.label"
        :href="item.href"
        target="_blank"
        rel="nofollow sponsored noopener noreferrer"
        class="inline-flex h-auto w-full items-center justify-between gap-3 whitespace-normal rounded-lg border border-primary bg-primary px-4 py-3 text-left text-body font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-primary/90 active:bg-primary/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <span class="flex min-w-0 flex-1 flex-col">
          <span>{{ item.label }}</span>
          <span class="text-tiny opacity-80">{{ item.description }}</span>
        </span>
        <ExternalLink class="h-4 w-4 shrink-0" />
      </a>
    </div>
  </section>
</template>
