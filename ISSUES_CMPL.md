# Design QA Issues

검토일: 2026-03-16

검토 기준:
- `../docs/BOILERPLATE_FRONTEND.md`
- `../docs/DESIGN_TOKENS.md`
- `../docs/MVP_QUALITY_MANUAL.md`
- `../project-quality-checklist-v2.md`

검토 범위:
- 소스 코드 기반 디자인 QA
- 실제 브라우저 시각 점검, Lighthouse, 실기기 검증은 이번 점검 범위에서 제외

## Findings

### 1. High - 핵심 결과가 모바일 first scroll 안에 보이지 않음

- 기준 문서의 `Zero Friction`, `정보 위계`, `1스크롤 이내(above the fold)에 핵심 답 노출` 원칙과 어긋난다.
- 현재 3개 메인 계산기 모두 긴 입력 패널을 먼저 배치하고, 핵심 결과 요약인 `SummaryBanner`를 그 아래에 둔다.
- 모바일에서는 입력 섹션 길이 때문에 결과가 초기 화면에서 밀려나며, "열자마자 답이 보이는" 경험이 약하다.

근거:
- [client/src/views/CarTaxView.vue](/Users/igyubin/Desktop/projects/01_shakishaki/100_MVP/05.car/client/src/views/CarTaxView.vue#L79) 입력 패널 뒤에 [client/src/views/CarTaxView.vue](/Users/igyubin/Desktop/projects/01_shakishaki/100_MVP/05.car/client/src/views/CarTaxView.vue#L90) 결과 배너 배치
- [client/src/views/InsuranceView.vue](/Users/igyubin/Desktop/projects/01_shakishaki/100_MVP/05.car/client/src/views/InsuranceView.vue#L74) 입력 패널 뒤에 [client/src/views/InsuranceView.vue](/Users/igyubin/Desktop/projects/01_shakishaki/100_MVP/05.car/client/src/views/InsuranceView.vue#L85) 결과 배너 배치
- [client/src/views/LeaseVsLoanView.vue](/Users/igyubin/Desktop/projects/01_shakishaki/100_MVP/05.car/client/src/views/LeaseVsLoanView.vue#L57) 입력 패널 뒤에 [client/src/views/LeaseVsLoanView.vue](/Users/igyubin/Desktop/projects/01_shakishaki/100_MVP/05.car/client/src/views/LeaseVsLoanView.vue#L68) 결과 배너 배치

권장:
- 모바일에서는 결과 배너를 입력 상단 또는 입력 카드 내부 상단에 고정 노출
- 입력 UI는 접힘/세부 설정 분리로 첫 화면 높이 축소

### 2. High - 모바일 입력 가독성과 터치 크기가 토큰 기준을 만족하지 못함

- 디자인 토큰 문서는 모바일 입력 폰트 16px 이상, 터치 영역 44px 이상을 요구한다.
- 하지만 프리셋 버튼은 `min-h-9`로 36px이고, `retro-input`은 `text-body`를 사용하며 모바일 오버라이드에서 13px까지 줄어든다.
- 가격 입력처럼 `text-heading`을 추가한 경우도 모바일에서 15px로 내려가 iOS Safari 자동 확대와 가독성 저하 위험이 있다.

근거:
- [client/src/assets/css/main.css](/Users/igyubin/Desktop/projects/01_shakishaki/100_MVP/05.car/client/src/assets/css/main.css#L306) `touch-target`은 44px 기준이지만
- [client/src/components/car-tax/CarTaxInput.vue](/Users/igyubin/Desktop/projects/01_shakishaki/100_MVP/05.car/client/src/components/car-tax/CarTaxInput.vue#L92), [client/src/components/insurance/InsuranceInput.vue](/Users/igyubin/Desktop/projects/01_shakishaki/100_MVP/05.car/client/src/components/insurance/InsuranceInput.vue#L79), [client/src/components/lease/LeaseCompareInput.vue](/Users/igyubin/Desktop/projects/01_shakishaki/100_MVP/05.car/client/src/components/lease/LeaseCompareInput.vue#L73) 프리셋 버튼은 `min-h-9`
- [client/src/components/car-tax/CarTaxInput.vue](/Users/igyubin/Desktop/projects/01_shakishaki/100_MVP/05.car/client/src/components/car-tax/CarTaxInput.vue#L141), [client/src/components/insurance/InsuranceInput.vue](/Users/igyubin/Desktop/projects/01_shakishaki/100_MVP/05.car/client/src/components/insurance/InsuranceInput.vue#L92), [client/src/components/lease/LeaseCompareInput.vue](/Users/igyubin/Desktop/projects/01_shakishaki/100_MVP/05.car/client/src/components/lease/LeaseCompareInput.vue#L143) 상세/선택 입력은 기본 `retro-input`
- [client/src/assets/css/main.css](/Users/igyubin/Desktop/projects/01_shakishaki/100_MVP/05.car/client/src/assets/css/main.css#L388) 모바일 `text-body` 13px, [client/src/assets/css/main.css](/Users/igyubin/Desktop/projects/01_shakishaki/100_MVP/05.car/client/src/assets/css/main.css#L382) 모바일 `text-heading` 15px

권장:
- 모든 입력/셀렉트/버튼의 모바일 실사용 텍스트를 최소 16px로 보정
- 프리셋 버튼은 `touch-target` 또는 최소 높이 44px 적용

### 3. Medium - 금액 입력이 문서 기준의 `₩` 접두사 패턴을 따르지 않음

- 가이드 문서는 숫자 입력에 `inputmode="numeric"`와 함께 `₩` 접두사 패턴을 권장한다.
- 현재 주요 금액 입력은 콤마 포맷만 있고, 통화 단위가 인풋 자체에 시각적으로 표시되지 않는다.
- 레이블에 `(원)`은 있지만 빠른 스캔과 입력 상태 인지가 약하다.

근거:
- [client/src/components/car-tax/CarTaxInput.vue](/Users/igyubin/Desktop/projects/01_shakishaki/100_MVP/05.car/client/src/components/car-tax/CarTaxInput.vue#L70)
- [client/src/components/insurance/InsuranceInput.vue](/Users/igyubin/Desktop/projects/01_shakishaki/100_MVP/05.car/client/src/components/insurance/InsuranceInput.vue#L57)
- [client/src/components/lease/LeaseCompareInput.vue](/Users/igyubin/Desktop/projects/01_shakishaki/100_MVP/05.car/client/src/components/lease/LeaseCompareInput.vue#L51)

권장:
- 입력 내부 prefix slot 또는 절대 배치된 `₩` 접두사 도입
- 숫자/단위의 시각적 분리 강화

### 4. Medium - `SummaryBanner`가 모든 delta 값을 이익 색상으로 고정해 의미가 왜곡됨

- `SummaryBanner`는 첫 행과 배지 색을 항상 `profit` 계열로 렌더링한다.
- 이 구조는 절감액처럼 긍정 값에는 맞지만, 차량가 대비 비용 비중이나 최고/최저 차이처럼 중립 또는 비용 성격의 수치에도 같은 색을 써서 의미가 섞인다.
- 특히 취등록세 화면에서 비용 비율이 초록색으로 강조돼 정보 해석이 부정확해진다.

근거:
- [client/src/components/common/SummaryBanner.vue](/Users/igyubin/Desktop/projects/01_shakishaki/100_MVP/05.car/client/src/components/common/SummaryBanner.vue#L49)
- [client/src/components/common/SummaryBanner.vue](/Users/igyubin/Desktop/projects/01_shakishaki/100_MVP/05.car/client/src/components/common/SummaryBanner.vue#L54)
- [client/src/views/CarTaxView.vue](/Users/igyubin/Desktop/projects/01_shakishaki/100_MVP/05.car/client/src/views/CarTaxView.vue#L94) 차량가 대비 비중을 delta로 사용
- [client/src/views/LeaseVsLoanView.vue](/Users/igyubin/Desktop/projects/01_shakishaki/100_MVP/05.car/client/src/views/LeaseVsLoanView.vue#L72) 최고/최저 차이를 delta로 사용

권장:
- `deltaTone: success | danger | neutral` 같은 prop 추가
- 수치 성격에 따라 `profit`, `fee`, `muted`, `status-*` 계열을 분기

### 5. Medium - 데스크톱 비교 테이블이 디자인 체크리스트의 스캔 보조 패턴을 충분히 반영하지 못함

- 체크리스트는 비교 테이블의 sticky header, hover, 스캔 가능한 행 강조를 기준으로 둔다.
- 현재 리스 비교 테이블은 고정 헤더가 없고, 행 hover도 없어 긴 테이블에서 시선 추적이 약하다.
- 1위 컬럼 강조만으로는 데스크톱 스캔 품질이 충분하지 않다.

근거:
- [client/src/components/lease/LeaseCompareTable.vue](/Users/igyubin/Desktop/projects/01_shakishaki/100_MVP/05.car/client/src/components/lease/LeaseCompareTable.vue#L38)
- [client/src/components/lease/LeaseCompareTable.vue](/Users/igyubin/Desktop/projects/01_shakishaki/100_MVP/05.car/client/src/components/lease/LeaseCompareTable.vue#L40)
- [client/src/components/lease/LeaseCompareTable.vue](/Users/igyubin/Desktop/projects/01_shakishaki/100_MVP/05.car/client/src/components/lease/LeaseCompareTable.vue#L54)

권장:
- 헤더 sticky 처리
- 행 hover 및 zebra/active scan cue 추가
- 핵심 숫자 열 최소 폭 보장으로 값 변경 시 reflow 감소

### 6. High - 모바일 탭 네비게이션이 `02.finance`보다 한 화면 노출 보장이 약함

- `car`의 탭 네비게이션은 모바일에서도 아이콘이 포함된 가로 스크롤 `flex` 구조다.
- 탭이 3개뿐인데도 `overflow-x-auto`에 의존해 좁은 화면에서 버튼이 한 번에 다 보이지 않을 수 있다.
- 반면 `02.finance`는 모바일에서 `grid-cols-3`를 사용해 주요 탭이 첫 화면에 바로 보이도록 설계했다.

근거:
- [client/src/components/common/TabNavigation.vue](/Users/igyubin/Desktop/projects/01_shakishaki/100_MVP/05.car/client/src/components/common/TabNavigation.vue#L22)
- [client/src/components/common/TabNavigation.vue](/Users/igyubin/Desktop/projects/01_shakishaki/100_MVP/05.car/client/src/components/common/TabNavigation.vue#L24)
- [../02.finance/client/src/components/common/TabNavigation.vue](/Users/igyubin/Desktop/projects/01_shakishaki/100_MVP/02.finance/client/src/components/common/TabNavigation.vue#L37)
- [../02.finance/client/src/components/common/TabNavigation.vue](/Users/igyubin/Desktop/projects/01_shakishaki/100_MVP/02.finance/client/src/components/common/TabNavigation.vue#L39)

권장:
- 모바일에서는 `grid-cols-3` 기반으로 3개 탭을 한 화면에 노출
- 아이콘은 모바일에서 숨기고 텍스트 우선
- `sm` 이상에서만 가로 스크롤로 확장

### 7. Medium - `02.finance` 대비 오버플로우 방어 토큰이 약해 긴 라벨과 메시지에서 품질 저하 위험이 있음

- `02.finance`는 `retro-stat-label`에 `truncate`를 적용하고, 티커에도 `w-full min-w-0`와 더 촘촘한 타이포 제약을 둔다.
- `car`는 같은 계열 컴포넌트를 쓰면서도 해당 방어 코드가 빠져 있어 긴 라벨이나 메시지가 카드 폭을 밀거나 줄바꿈 품질을 떨어뜨릴 수 있다.
- 특히 보험 결과의 `다이렉트 추가 절약` 같은 라벨은 모바일 stat 카드에서 가장 먼저 영향을 받을 가능성이 높다.

근거:
- [client/src/assets/css/main.css](/Users/igyubin/Desktop/projects/01_shakishaki/100_MVP/05.car/client/src/assets/css/main.css#L322)
- [client/src/assets/css/main.css](/Users/igyubin/Desktop/projects/01_shakishaki/100_MVP/05.car/client/src/assets/css/main.css#L334)
- [../02.finance/client/src/assets/css/main.css](/Users/igyubin/Desktop/projects/01_shakishaki/100_MVP/02.finance/client/src/assets/css/main.css#L324)
- [../02.finance/client/src/assets/css/main.css](/Users/igyubin/Desktop/projects/01_shakishaki/100_MVP/02.finance/client/src/assets/css/main.css#L340)
- [client/src/components/insurance/InsuranceResult.vue](/Users/igyubin/Desktop/projects/01_shakishaki/100_MVP/05.car/client/src/components/insurance/InsuranceResult.vue#L39)
- [client/src/components/common/TickerBar.vue](/Users/igyubin/Desktop/projects/01_shakishaki/100_MVP/05.car/client/src/components/common/TickerBar.vue#L91)
- [../02.finance/client/src/components/common/TickerBar.vue](/Users/igyubin/Desktop/projects/01_shakishaki/100_MVP/02.finance/client/src/components/common/TickerBar.vue#L89)

권장:
- `retro-stat-label`에 `truncate` 추가
- 티커와 헤더 flex 자식에 `min-w-0`, `w-full`, `leading-tight` 보강
- 긴 설명 문구에는 `[text-wrap:balance]` 적용

### 8. Medium - 상단 탭(AppNavbar) 클릭 시 다음 화면이 즉시 나타나지 않는 체감이 발생할 수 있음

- 상단 탭은 메인 이동 동선인데, 현재 라우트가 모두 lazy import이고 `RouterView`에 `Transition mode="out-in"`이 걸려 있다.
- 이 조합은 기존 화면이 먼저 사라진 뒤 다음 화면이 들어오게 만들어, 탭 클릭 시 짧은 공백이나 "한 번에 안 뜨는" 인상을 줄 수 있다.
- 별도 로딩 스켈레톤이나 전환 중 placeholder가 없어 네비게이션 품질이 체감상 더 느리게 느껴진다.

근거:
- [client/src/components/common/TabNavigation.vue](/Users/igyubin/Desktop/projects/01_shakishaki/100_MVP/05.car/client/src/components/common/TabNavigation.vue#L25) 상단 탭이 주요 라우트 이동 진입점
- [client/src/router/index.ts](/Users/igyubin/Desktop/projects/01_shakishaki/100_MVP/05.car/client/src/router/index.ts#L11) 각 화면이 lazy-loaded route
- [client/src/App.vue](/Users/igyubin/Desktop/projects/01_shakishaki/100_MVP/05.car/client/src/App.vue#L8) `RouterView`
- [client/src/App.vue](/Users/igyubin/Desktop/projects/01_shakishaki/100_MVP/05.car/client/src/App.vue#L9) `Transition name="fade" mode="out-in"`

권장:
- 탭 전환에서는 `mode="out-in"` 제거 또는 in-place 전환 검토
- route-level suspense/loading skeleton 추가
- 최소한 탭 클릭 직후 결과 카드 스켈레톤이나 progress cue 노출

### 9. Low - 404 페이지가 브랜드 톤의 위트 있는 상태 화면 역할을 하지 못함

- 체크리스트는 404에서 "위트 있는 문구"를 권장한다.
- 현재 404는 정보 전달은 되지만, 서비스 톤을 남기는 장치나 보조 액션이 거의 없다.
- 메인 계산기 중심의 브랜드 성격을 고려하면 재진입 유도 카피가 더 필요하다.

근거:
- [client/src/views/NotFoundView.vue](/Users/igyubin/Desktop/projects/01_shakishaki/100_MVP/05.car/client/src/views/NotFoundView.vue#L9)

권장:
- `WittyState` 계열로 교체하거나 브랜드 문구/보조 링크 추가
- 3개 핵심 계산기로 바로 이동하는 선택지 제공
