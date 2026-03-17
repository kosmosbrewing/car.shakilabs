<script setup lang="ts">
import { computed, ref } from "vue";
import { ParkingSquare, Trophy } from "lucide-vue-next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FreshBadge from "@/components/common/FreshBadge.vue";
import SEOHead from "@/components/common/SEOHead.vue";
import { CAR_SERVICE_UPDATED_AT } from "@/data/ownershipData";
import { formatWon } from "@/lib/utils";
import { compareParkingOptions } from "@/utils/ownershipCalculator";

const seoTitle = "주차비 비교 계산기 | 시간권·일 최대요금·월주차 비교";
const seoDescription = "월 주차 일수와 시간당 요금을 넣으면 어떤 주차 방식이 가장 저렴한지 계산합니다.";

const daysPerMonth = ref(20);
const hoursPerDay = ref(8);
const hourlyRate = ref(2_000);
const monthlyPass = ref(180_000);

const result = computed(() => compareParkingOptions({
  daysPerMonth: daysPerMonth.value,
  hoursPerDay: hoursPerDay.value,
  hourlyRate: hourlyRate.value,
  monthlyPass: monthlyPass.value,
}));
</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" />

  <div class="container space-y-5 py-5">
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">주차비 비교 계산기</h1>
        <FreshBadge :message="`${CAR_SERVICE_UPDATED_AT} 기준`" />
      </div>
      <div class="retro-panel-content grid gap-3 md:grid-cols-2">
        <input v-model.number="daysPerMonth" type="number" min="1" max="31" class="retro-input" placeholder="월 주차 일수" />
        <input v-model.number="hoursPerDay" type="number" min="1" max="24" class="retro-input" placeholder="하루 주차 시간" />
        <input v-model.number="hourlyRate" type="number" min="500" class="retro-input" placeholder="시간당 요금" />
        <input v-model.number="monthlyPass" type="number" min="0" class="retro-input" placeholder="월주차 요금" />
      </div>
    </div>

    <div class="grid gap-3 md:grid-cols-3">
      <Card
        v-for="item in result.items"
        :key="item.key"
        :class="[
          'overflow-hidden transition-shadow duration-200',
          item.key === result.bestOption.key
            ? 'border-profit/40 shadow-[0_0_0_1px_hsl(var(--profit)/0.15),0_4px_16px_-4px_hsl(var(--profit)/0.12)]'
            : 'border-border/70'
        ]"
      >
        <CardContent class="p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-tiny font-semibold text-muted-foreground">{{ item.label }}</p>
              <p
                class="mt-2 text-h1 font-bold"
                :class="item.key === result.bestOption.key ? 'text-profit' : 'text-foreground'"
              >
                {{ formatWon(item.total) }}
              </p>
            </div>
            <span
              class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
              :class="item.key === result.bestOption.key ? 'bg-profit/12 text-profit' : 'bg-muted text-muted-foreground'"
            >
              <Trophy v-if="item.key === result.bestOption.key" class="h-5 w-5" />
              <ParkingSquare v-else class="h-5 w-5" />
            </span>
          </div>
          <Badge
            v-if="item.key === result.bestOption.key"
            variant="default"
            class="mt-3 rounded-full bg-profit text-white border-transparent"
          >
            가장 저렴
          </Badge>
        </CardContent>
      </Card>
    </div>

    <Card class="border-border/60">
      <CardContent class="p-4 text-caption text-foreground">
        가장 저렴한 방식은 <strong class="font-bold text-profit">{{ result.bestOption.label }}</strong>이며
        최대 <strong class="font-bold tabular-nums text-profit">{{ formatWon(result.spread) }}</strong> 차이가 납니다.
      </CardContent>
    </Card>
  </div>
</template>
