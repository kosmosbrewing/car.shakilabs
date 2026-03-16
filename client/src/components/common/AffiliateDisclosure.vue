<script setup lang="ts">
import { AFFILIATE_DISCLOSURE_TEXT } from "@/data/affiliateLinks";
</script>

<template>
  <section class="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3">
    <p class="text-caption leading-relaxed text-muted-foreground">
      {{ AFFILIATE_DISCLOSURE_TEXT }}
    </p>
  </section>
</template>
