<script setup lang="ts">
import { onMounted } from 'vue'
import { ArrowRight } from 'lucide-vue-next'
import { ShSurface, ShText } from '@shakilabs/ui'
import { trackEvent } from '@/lib/analytics'

const actions = [
  { key: 'maintenance', title: '등록비 다음 연간 유지비 계산', description: '보험·세금·소모품을 합쳐 차량의 연간 보유비를 확인합니다.', href: '/car/maintenance' },
  { key: 'insurance', title: '차량가 기준 보험료 계산', description: '운전자 조건과 차량가를 반영한 예상 보험료를 점검합니다.', href: '/car/insurance' },
  { key: 'lease_vs_loan', title: '리스와 할부 총비용 비교', description: '초기 등록비와 함께 금융 방식별 전체 부담을 비교합니다.', href: '/car/lease-vs-loan' },
] as const

onMounted(() => {
  actions.forEach((item) => trackEvent('related_tool_impression', {
    app_id: 'car', from_tool: 'registration_tax', to_tool: item.key, placement: 'after_result',
  }))
})

function trackRelatedClick(toTool: string): void {
  trackEvent('related_tool_click', {
    app_id: 'car', from_tool: 'registration_tax', to_tool: toTool, placement: 'after_result',
  })
}
</script>

<template>
  <section aria-labelledby="car-tax-next-actions-title">
    <ShText id="car-tax-next-actions-title" as="h2" variant="heading" class="mb-3">
      구매 후 비용까지 이어서 계산하세요
    </ShText>
    <div class="grid gap-3 md:grid-cols-3">
      <ShSurface
        v-for="item in actions"
        :key="item.key"
        as="a"
        variant="outlined"
        padding="md"
        :href="item.href"
        class="group flex flex-col no-underline transition-colors hover:border-primary"
        @click="trackRelatedClick(item.key)"
      >
        <ShText as="h3" variant="heading">{{ item.title }}</ShText>
        <ShText variant="caption" tone="muted" class="mt-2 flex-1">{{ item.description }}</ShText>
        <span class="mt-4 inline-flex items-center gap-1 text-caption font-semibold text-primary">
          {{ item.title }} <ArrowRight class="h-4 w-4" aria-hidden="true" />
        </span>
      </ShSurface>
    </div>
  </section>
</template>
