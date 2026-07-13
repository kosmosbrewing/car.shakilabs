<script setup lang="ts">
import { ArrowRight } from "lucide-vue-next";
import { RouterLink } from "vue-router";
import { ShSurface, ShText } from "@shakilabs/ui";
import SEOHead from "@/components/common/SEOHead.vue";
import { CAR_TOOLS } from "@/data/carNavigation";
</script>

<template>
  <SEOHead
    title="차량 계산기 전체 보기 | 구매·보험·유지비 도구"
    description="차량 구매, 보험, 보유와 운행 단계별로 필요한 자동차 계산기와 비교 도구를 찾으세요."
  />
  <div class="container space-y-5 py-5">
    <ShSurface padding="lg">
      <ShText as="p" variant="caption" tone="muted">CAR TOOL DIRECTORY</ShText>
      <ShText as="h1" variant="display" class="mt-2">차량 비용은 단계별로 나눠 보세요</ShText>
      <ShText tone="muted" class="mt-3 max-w-3xl">
        구매, 보험, 보유, 운행 중 지금 확인할 비용과 가까운 도구에서 시작하세요.
      </ShText>
    </ShSurface>

    <section aria-labelledby="car-tools-title">
      <div class="mb-3">
        <ShText id="car-tools-title" as="h2" variant="heading">차량 계산 도구</ShText>
        <ShText variant="caption" tone="muted" class="mt-1">
          같은 입력 조건으로 세금과 장기 비용을 차례로 확인할 수 있습니다.
        </ShText>
      </div>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <RouterLink v-for="tool in CAR_TOOLS" :key="tool.path" :to="tool.path" class="block no-underline">
          <ShSurface variant="outlined" padding="md" class="group flex h-full flex-col hover:border-primary">
            <ShText as="h3" variant="heading">{{ tool.title }}</ShText>
            <ShText variant="caption" tone="muted" class="mt-2 flex-1">{{ tool.description }}</ShText>
            <span class="mt-4 inline-flex items-center gap-1 text-caption font-semibold text-primary">
              계산 시작 <ArrowRight class="h-4 w-4" aria-hidden="true" />
            </span>
          </ShSurface>
        </RouterLink>
      </div>
    </section>
  </div>
</template>
