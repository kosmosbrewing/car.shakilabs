# car.shakilabs — 작업 규칙

- 스택: Vue 3 + Vite(SPA) + vite-ssg 프리렌더, 공통 UI `@shakilabs/ui`(`client/vendor/*.tgz` 고정). 배포는 Vercel Git 통합(`shakilabs.com/car`).

## 검증 (CI와 같은 순서, `client/`에서)
```sh
npm ci
npm run typecheck && npm test
npm run build            # vite-ssg + validate-static-output·폰트·accent 토큰 게이트 포함
npm run sbom:prod
npm run verify:vendor && npm run verify:sbom
```
- 빌드가 폰트 게이트("UI characters changed" 등)로 멈추면 `npm run fonts:subset` 후 다시 빌드.
- build가 `public/sitemap.xml`의 lastmod만 바꿨다면 그 변경은 커밋하지 않는다(`git checkout -- client/public/sitemap.xml`).
- 테스트를 skip하거나 게이트를 끄지 않는다. lint 스크립트는 없다.

## 계산기 화면 레이아웃
1. lg(1024px) 이상은 `ShCalculatorSplit`으로 왼쪽 입력 | 오른쪽 결과 2등분. 모바일은 DOM 순서대로 입력 → 결과 → 보조.
2. 결과가 입력보다 300px 이상 길면 `below-input` 슬롯(입력과 관련된 표·출처·다음 계산)으로 왼쪽을 채우거나, 결과의 상세 표·차트를 1×2 아래 전폭으로 내린다.
3. 결과 칸 sticky는 컴포넌트가 창 높이·내용 높이로 스스로 판정한다 — 뷰에서 켜지 않는다.
4. 우측 레일(사이드바)을 두지 않는다. 반폭 칸에 3열 카드 그리드가 들어가면 lg에서 1열로(`lg:grid-cols-1`).
5. 한 화면에 계산기가 둘 이상이면(예: ev-vs-gas) 각각 독립된 `ShCalculatorSplit`을 쓴다.
