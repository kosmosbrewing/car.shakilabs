<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { ShNextActions, type NextActionItem } from '@shakilabs/ui'
import { trackEvent } from '@/lib/analytics'

// 공통 블록(ShNextActions)은 카드 전체가 링크라 제목을 되풀이하던 CTA 줄과 설명 문장이 필요 없다
// (사용자 피드백 "텍스트가 너무 많다"). key는 분석 이벤트 to_tool 값이라 바꾸지 않는다.
// to는 라우터 경로 — base(/car/)가 붙어 이전과 같은 /car/maintenance 등으로 렌더된다.
// 보험 계산기는 차량가를 입력받지 않는다(현재 보험료·할인 조건만) — 옛 제목 "차량가 기준 보험료"는 사실과 달라
// 계산기 자체 이름(carNavigation title)으로 바꿨다.
const actions: readonly NextActionItem[] = [
  { key: 'maintenance', title: '등록비 다음 연간 유지비', note: '보험·세금·소모품 합산', to: '/maintenance' },
  { key: 'insurance', title: '자동차 보험 절약', note: '현재 보험료·할인 조건별 예상 절감액', to: '/insurance' },
  { key: 'lease_vs_loan', title: '리스와 할부 총비용 비교', note: '금융 방식별 전체 부담', to: '/lease-vs-loan' },
]

onMounted(() => {
  actions.forEach((item) => trackEvent('related_tool_impression', {
    app_id: 'car', from_tool: 'registration_tax', to_tool: item.key, placement: 'after_result',
  }))
})

function trackRelatedClick(item: NextActionItem): void {
  trackEvent('related_tool_click', {
    app_id: 'car', from_tool: 'registration_tax', to_tool: item.key, placement: 'after_result',
  })
}
</script>

<template>
  <ShNextActions :items="actions" :link-component="RouterLink" @select="trackRelatedClick" />
</template>
