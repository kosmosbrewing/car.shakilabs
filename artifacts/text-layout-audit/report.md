# 텍스트 배치 개선 결과

## 결과
- 대상: Car 10개 라우트, 브라우저 53개 상태.
- 최종 판정: page overflow, 값·단위/컨트롤 줄바꿈, 텍스트 overflow, 고아줄, 슬라이더 오류 모두 0건.
- `npm run typecheck` → `npm test` → `npm run build` 통과, 42개 테스트 통과.

## 적용 내용
- 리스 기간·보증금·잔존가치 선택과 보험/유지비 지표를 모바일 한 열 구조로 바꿨습니다.
- 리스 결과 헤더와 최고/최저 차이 행이 배지·금액 때문에 한 글자 열로 축소되지 않도록 wrap 단위를 분리했습니다.
- 큰 결과 금액은 가용 폭에 맞춰 유동 크기를 사용하되 숫자·원 단위는 분리하지 않습니다.

## 관련 코드
- [responsive-accessibility.css](../../client/src/assets/css/responsive-accessibility.css)
- [LeaseCompareCards.vue](../../client/src/components/lease/LeaseCompareCards.vue)
- [LeaseCompareInput.vue](../../client/src/components/lease/LeaseCompareInput.vue)
- [LeaseVsLoanView.vue](../../client/src/views/LeaseVsLoanView.vue)
- [InsuranceResult.vue](../../client/src/components/insurance/InsuranceResult.vue)

근거: `../../../artifacts/text-layout-audit/final-consolidated-summary.json`, `../../../artifacts/text-layout-audit/screenshots/final-evidence/targets/`. 열린 이슈는 [issues.json](./issues.json)입니다.
