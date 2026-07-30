# 자동차 계산기 · shakilabs

**▶ 라이브 서비스: <https://shakilabs.com/car>**

자동차 취등록세, 보험 절약, 리스·할부·렌트 비교, 유지비 등 차량 구매·보유 계산기 모음.

## 주요 도구

- [취등록세](https://shakilabs.com/car/tax)
- [자동차보험 절약](https://shakilabs.com/car/insurance)
- [리스 vs 할부 vs 렌트](https://shakilabs.com/car/lease-vs-loan)
- [차량 유지비](https://shakilabs.com/car/maintenance)
- [전기차 vs 내연기관](https://shakilabs.com/car/ev-vs-gas)

전체 서비스 12종: <https://shakilabs.com>

## 스택

Vue 3 (Composition API) · TypeScript · Vite · Tailwind CSS · 공유 UI `@shakilabs/ui`
정적 프리렌더/SSG로 배포하며, 계산 로직은 Vitest 경계값 테스트로 검증합니다.

## 개발

```bash
cd client
npm install
npm run dev
```
