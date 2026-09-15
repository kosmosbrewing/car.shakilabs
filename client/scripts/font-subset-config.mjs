import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptRoot = dirname(fileURLToPath(import.meta.url));
export const clientRoot = resolve(scriptRoot, "..");

// 결과 히어로 금액(formatWon 등 포맷터 출력, 카운트업 중간 프레임 포함)이
// 만들어낼 수 있는 모든 문자 — docs/BRAND_FONT_SUBSET.md §3 정본 문자열.
export const NUMERAL_CHARACTERS =
  "0123456789,.%+-~/()· 원억만천조년월일개회건세명점배급시간분초";

// GmarketSans는 h1 제목(font-brand)·섹션 타이틀(.retro-title)·결과 히어로 금액에만
// 쓰인다. UI 전체 문자셋으로 자르면 Pretendard 전용 문자까지 딸려 들어가 커지고,
// 반대로 숫자만 자르면 제목이 글자 단위로 서체가 갈린다(BL-020 개정 사유).
export const brandFontJob = {
  source: resolve(clientRoot, "public/fonts/GmarketSansBold.woff"),
  output: resolve(clientRoot, "public/fonts/GmarketSansBold-brand-v1.woff2"),
  publicName: "GmarketSansBold-brand-v1.woff2",
  maxBytes: 24 * 1024,
};

// 렌더 스캔(scripts/collect-brand-font-chars.mjs)으로 얻은 문자셋의 체크인 스냅샷.
// UI 텍스트가 바뀌면 반드시 다시 렌더 스캔해서 갱신해야 한다 — 소스 grep으로
// 손으로 채우면 finance/nutri가 겪은 과대 수집(불필요하게 큰 서브셋) 재현이다.
export const charsetFile = resolve(scriptRoot, "brand-font-charset.txt");
export const manifestFile = resolve(scriptRoot, "font-subset-manifest.json");
