<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
import { useConstantsStore } from "@/stores/constants";

const constantsStore = useConstantsStore();

// 방침의 핵심 주장("입력값은 브라우저를 벗어나지 않는다")을 계산기별 입력 항목으로
// 구체화한 표. 값의 출처는 각 계산기의 Zod 스키마/입력 컴포넌트이며, 계산기가
// 늘거나 입력이 바뀌면 이 표도 함께 고쳐야 방침이 사실과 어긋나지 않는다.
const CALCULATOR_INPUTS = [
  {
    name: "자동차 취등록세",
    path: "/car/tax",
    fields:
      "차량 가격, 차종(승용·승합·화물·특수·경차·이륜차 등 8종), 신차/중고차 구분, 연식 경과 연수, 배기량 구간, 등록 지역(서울·경기·그 외), 장애인 감면 대상 여부, 번호판 대행 수수료 포함 여부",
  },
  {
    name: "자동차보험 절약",
    path: "/car/insurance",
    fields:
      "현재 보험료, 운전 경력 연수, 최근 사고 건수, 연간 주행거리 구간, 블랙박스 장착 여부, 차령, 자기부담금 수준",
  },
  {
    name: "리스·할부·장기렌트",
    path: "/car/lease-vs-loan",
    fields:
      "차량 가격, 선수금 비율, 약정 기간(24~60개월), 잔존가치율, 리스 금리, 할부 금리, 연간 보험료, 취득세율, 렌트 관리비율",
  },
  {
    name: "차량 유지비",
    path: "/car/maintenance",
    fields: "연간 주행거리, 차령, 유종(가솔린·하이브리드·전기)",
  },
  {
    name: "주차비 비교",
    path: "/car/parking",
    fields: "월 주차 일수, 하루 주차 시간, 시간당 요금, 월주차 요금",
  },
  {
    name: "전기차 비교·보조금",
    path: "/car/ev-vs-gas",
    fields:
      "연간 주행거리, 유가, 전기요금, 연비, 전비, 차량 가격, 차종 모델, 거주 지역, 청년(19~34세) 여부, 전환지원금 대상 여부",
  },
];
</script>

<template>
  <SEOHead
    title="개인정보 처리방침"
    description="자동차 계산기가 받는 입력값, 수집하지 않는 차량 정보, 쿠키·광고·공유 링크 처리 방식을 안내합니다."
  />

  <div class="container py-5">
    <div class="retro-panel">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">개인정보 처리방침</h1>
      </div>

      <div class="retro-panel-content space-y-4">
        <p class="text-body text-muted-foreground">
          이 문서는 shakilabs.com/car(이하 "본 서비스")가 자동차 취등록세·보험료·리스·유지비·주차비·전기차 보조금 계산 과정에서
          어떤 값을 받아 어디에서 처리하는지, 그리고 무엇을 아예 받지 않는지를 밝힙니다.
          여섯 개 계산기 모두 회원가입 없이 동작하며, 계산에 필요한 값은 이용자가 화면에서 직접 입력한 숫자와 선택지뿐입니다.
        </p>

        <div class="rounded-lg border border-border/60 bg-muted/20 p-4">
          <h2 class="text-heading font-bold">한눈에 보기</h2>
          <ul class="mt-2 list-inside list-disc space-y-1 text-body text-muted-foreground">
            <li>회원가입·로그인이 없고, 차량 등록번호나 운전면허번호를 묻는 입력란이 존재하지 않습니다.</li>
            <li>취등록세·보험료·리스 비교 계산은 전부 이용자의 브라우저 안에서 끝납니다.</li>
            <li>무료 운영을 위해 Google AdSense 광고와 Google Analytics 통계를 사용하며, 이들은 쿠키를 씁니다.</li>
            <li>맞춤 광고는 아래 4항의 두 링크에서 언제든 해제할 수 있습니다.</li>
          </ul>
        </div>

        <h2 class="text-heading font-bold">1. 계산기별로 입력받는 값</h2>
        <p class="text-body text-muted-foreground">
          아래는 각 계산기가 화면에서 받는 항목 전부입니다. 표에 없는 값은 어떤 계산기도 요구하지 않습니다.
        </p>
        <!-- 표 대신 스택형 목록: 모바일에서 가로 스크롤 없이 항목 전체가 읽혀야 한다. -->
        <dl class="space-y-3">
          <div
            v-for="calc in CALCULATOR_INPUTS"
            :key="calc.path"
            class="rounded-lg border border-border/40 p-3"
          >
            <dt class="text-caption font-bold text-foreground">
              {{ calc.name }}
              <span class="font-normal text-muted-foreground">({{ calc.path }})</span>
            </dt>
            <dd class="mt-1 text-body text-muted-foreground">{{ calc.fields }}</dd>
          </div>
        </dl>
        <p class="text-body text-muted-foreground">
          이 값들은 이용자 기기의 자바스크립트가 그대로 계산에 사용하고 화면에 결과를 그립니다.
          운영자는 계산 입력값을 받는 서버 엔드포인트 자체를 두고 있지 않으며, 따라서 입력값을 저장하거나 축적할 수단이 없습니다.
        </p>

        <h2 class="text-heading font-bold">2. 본 서비스가 요구하지 않는 자동차 정보</h2>
        <p class="text-body text-muted-foreground">
          차량 등록번호, 차대번호(VIN), 운전면허번호, 주민등록번호, 보험 증권번호, 사고이력 조회에 쓰이는 식별 정보는
          입력란 자체가 없습니다. 보험료 화면은 이용자가 알려준 현재 보험료에 공개된 할인·할증률을 적용해 추정치를 낼 뿐,
          보험사나 보험개발원 시스템에 조회 요청을 보내지 않습니다. 취등록세 화면도 위택스에 신고 정보를 전송하지 않고
          공개된 세율표와 잔가율표만 사용합니다. 즉 본 서비스는 이용자의 실제 차량이나 계약을 조회할 능력이 없습니다.
        </p>

        <h2 class="text-heading font-bold">3. 공유 링크·브라우저에 남는 값</h2>
        <p class="text-body text-muted-foreground">
          공유 버튼으로 만든 주소에는 차량 가격 같은 일부 입력값이 <span class="font-semibold">/car/tax/3000</span> 형태의 경로나
          질의 문자열로 포함될 수 있습니다. 이 주소는 이용자의 기기에서 만들어지며, 이용자가 직접 붙여넣어 전달하기 전까지
          어디에도 기록되지 않습니다. 카카오톡 공유를 누른 경우에만 카카오 SDK가 불러와지고 링크와 미리보기 문구가 전달되며,
          버튼을 누르지 않으면 SDK는 로드되지 않습니다. 다크 모드 설정은 <span class="font-semibold">car:theme:v1</span> 키로
          브라우저 로컬 저장소에만 저장되고, 안내 창의 '다시 보지 않기' 상태도 같은 방식으로 기기에만 남습니다.
          브라우저 데이터를 지우면 함께 삭제됩니다.
        </p>

        <h2 class="text-heading font-bold">4. 광고 게재 및 제3자 광고 쿠키 (Google AdSense)</h2>
        <p class="text-body text-muted-foreground">
          본 서비스는 무료 운영을 위해 Google AdSense를 통한 광고를 게재합니다. 광고 게재와 관련해 다음 사항을 알려드립니다.
        </p>
        <ul class="list-inside list-disc space-y-1 text-body text-muted-foreground">
          <li>Google을 포함한 제3자 광고 사업자는 쿠키를 사용하여 이용자의 본 서비스 또는 다른 웹사이트 방문 기록을 기반으로 광고를 게재합니다.</li>
          <li>Google은 광고 쿠키를 사용하여 이용자의 관심사에 맞춘 맞춤 광고를 표시할 수 있습니다.</li>
          <li>
            이용자는
            <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" class="retro-link">Google 광고 설정</a>에서
            맞춤 광고를 해제할 수 있으며,
            <a href="https://www.aboutads.info/choices" target="_blank" rel="noopener noreferrer" class="retro-link">www.aboutads.info/choices</a>를
            방문하여 다른 제3자 광고 사업자의 맞춤 광고 쿠키도 일괄 거부할 수 있습니다.
          </li>
        </ul>
        <p class="text-body text-muted-foreground">
          맞춤 광고를 해제하더라도 광고 자체는 계속 표시될 수 있으며, 이 경우 관심사와 무관한 일반 광고가 게재됩니다.
          광고 영역은 '광고 영역' 문구와 함께 계산 결과와 분리해 배치하며, 광고를 계산 결과나 버튼처럼 보이게 하지 않습니다.
          페이지를 찾을 수 없는 화면과 색인에서 제외한 화면에는 광고를 싣지 않습니다.
        </p>

        <h2 class="text-heading font-bold">5. 접속 통계와 오류 기록</h2>
        <p class="text-body text-muted-foreground">
          어떤 계산기가 실제로 쓰이는지 파악해 개선 순서를 정하기 위해 Google Analytics 4로 방문 페이지, 체류 시간, 유입 경로,
          브라우저 종류 등 개인을 식별할 수 없는 통계를 수집할 수 있습니다. 계산 결과 수치 자체는 전송하지 않으며,
          어떤 계산기 화면이 열렸고 어떤 버튼이 눌렸는지 수준의 이벤트만 기록합니다.
          장애 원인 파악을 위해 오류 추적 도구(Sentry)가 활성화될 수 있으며, 활성화되더라도 개인 식별 정보 전송 옵션은
          꺼진 상태로 동작합니다.
        </p>

        <h2 class="text-heading font-bold">6. 쿠키 거부와 이용자의 권리</h2>
        <p class="text-body text-muted-foreground">
          쿠키는 웹사이트가 브라우저에 저장하는 작은 텍스트 파일입니다. 이용자는 브라우저 설정에서 쿠키 저장을 거부하거나
          이미 저장된 쿠키를 삭제할 수 있습니다. 쿠키를 모두 차단해도 여섯 개 계산기는 그대로 작동합니다 — 계산이
          브라우저 안에서 끝나기 때문입니다. 운영자는 개인 식별 정보를 수집하지 않으므로 별도의 열람·정정·삭제 창구를 두지 않으나,
          처리 방식에 의문이 있으면 아래 문의처로 연락하면 지체 없이 확인해 답변합니다.
          분석·광고 도구가 쿠키로 수집하는 정보는 각 사업자의 방침에 따라 처리되며, 운영자가 이를 제3자에게 판매하지 않습니다.
        </p>

        <h2 class="text-heading font-bold">7. 운영자와 문의</h2>
        <p class="text-body text-muted-foreground">
          운영: ShakiLabs · 문의:
          <a :href="`mailto:${constantsStore.supportEmail}`" class="retro-link">
            {{ constantsStore.supportEmail }}
          </a>
        </p>

        <h2 class="text-heading font-bold">8. 방침의 변경</h2>
        <p class="text-body text-muted-foreground">
          계산기가 추가되거나 입력 항목이 바뀌면 1항의 표를 함께 갱신합니다. 법령 개정이나 도구 변경으로 본 방침이 수정될 경우
          본 페이지에 게시하고 시행일을 갱신합니다.
        </p>

        <p class="mt-6 text-tiny text-muted-foreground">시행일: 2026년 3월 11일 · 최종 개정일: 2026년 8월 10일</p>
      </div>
    </div>
  </div>
</template>
