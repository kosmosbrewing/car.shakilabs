<script setup lang="ts">
import type { Component } from "vue";
import { ArrowRight, CreditCard } from "lucide-vue-next";
import { ActionCard } from "@/components/ui/action-card";

type RelatedServiceItem = {
  title: string;
  description: string;
  href: string;
  icon: Component;
};

const items: RelatedServiceItem[] = [
  {
    title: "주유 할인카드 비교",
    description: "차량 유지비 중 반복 지출인 주유비를 카드 혜택 기준으로 비교합니다.",
    href: "/card/fuel-card",
    icon: CreditCard,
  },
];
</script>

<template>
  <section class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">관련 서비스</h2>
    </div>
    <div class="retro-panel-content space-y-4">
      <p class="text-caption leading-relaxed text-muted-foreground">
        취등록세까지 계산했다면 이후 매달 나가는 주유비 절감 카드도 함께 확인해 보세요.
      </p>
      <div class="grid gap-3 sm:grid-cols-2">
        <ActionCard
          v-for="item in items"
          :key="item.href"
          as="a"
          :href="item.href"
          variant="default"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-body font-bold text-foreground">{{ item.title }}</p>
              <p class="mt-1.5 text-caption text-muted-foreground">{{ item.description }}</p>
            </div>
            <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <component :is="item.icon" class="h-5 w-5" />
            </span>
          </div>
          <p class="mt-3 inline-flex items-center gap-1 text-caption font-semibold text-primary">
            바로 가기
            <ArrowRight class="h-3.5 w-3.5" />
          </p>
        </ActionCard>
      </div>
    </div>
  </section>
</template>
