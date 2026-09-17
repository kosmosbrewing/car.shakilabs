#!/usr/bin/env node
// 액센트 토큰 게이트 (DESIGN_CLEANUP_PLAN_2026-09-17.md §4.2)
//
// 왜 필요한가: index.html의 :root/.dark 브랜드 토큰과 main.css 의미색은 손으로 고친다.
// 문자열 하나만 틀려도 라이트/다크 어느 한쪽이 조용히 깨지고, 대비 미달은 빌드가
// 통과해도 아무도 모른다. 이 게이트는 build.mjs 체인에 물려 그 사고를 막는다.
//
// 브라우저를 쓰지 않는다 — Vercel 빌드 이미지에 크로미움이 없다(§6-10). 판정은
// index.html의 인라인 <style> 문자열과 main.css 텍스트, 빌드된 dist CSS 파싱만으로 한다.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const indexHtmlPath = resolve(projectRoot, "index.html");
const mainCssPath = resolve(projectRoot, "src", "assets", "css", "main.css");
const distAssetsDir = resolve(projectRoot, "dist", "assets");

let failed = false;
function fail(message) {
  console.error(`[verify:accent-tokens] FAIL — ${message}`);
  failed = true;
}
function pass(message) {
  console.log(`[verify:accent-tokens] ok — ${message}`);
}

// ---------------------------------------------------------------------------
// 색 변환 · 대비 계산 (순수 함수, 외부 의존성 없음)
// ---------------------------------------------------------------------------
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

function hslStrToRgb(hslStr) {
  const m = hslStr.trim().match(/^(-?[\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
  if (!m) throw new Error(`Invalid HSL token string: "${hslStr}"`);
  let [h, s, l] = [Number(m[1]), Number(m[2]) / 100, Number(m[3]) / 100];
  h = ((h % 360) + 360) % 360 / 360;
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [hue2rgb(p, q, h + 1 / 3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1 / 3)].map((v) =>
    Math.round(v * 255)
  );
}

function relLuminance([r, g, b]) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const cs = c / 255;
    return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(rgb1, rgb2) {
  const l1 = relLuminance(rgb1);
  const l2 = relLuminance(rgb2);
  const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (lighter + 0.05) / (darker + 0.05);
}

function hslToHex(hslStr) {
  const [r, g, b] = hslStrToRgb(hslStr);
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
}

function getLightness(hslStr) {
  const m = hslStr.trim().match(/^(-?[\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
  return Number(m[3]);
}

// ---------------------------------------------------------------------------
// index.html :root / .dark 블록 파싱
// ---------------------------------------------------------------------------
function extractBlock(css, selector) {
  // selector 뒤 첫 { ... } 블록만 추출 (중첩 없는 단순 규칙 전제 — index.html critical CSS 전제와 일치)
  const idx = css.indexOf(selector);
  if (idx === -1) throw new Error(`"${selector}" block not found in index.html`);
  const open = css.indexOf("{", idx);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    if (css[i] === "}") {
      depth--;
      if (depth === 0) return css.slice(open + 1, i);
    }
  }
  throw new Error(`Unterminated "${selector}" block in index.html`);
}

function parseTokens(block) {
  const tokens = {};
  const re = /--([a-z0-9-]+):\s*([^;]+);/gi;
  let m;
  while ((m = re.exec(block))) {
    tokens[`--${m[1]}`] = m[2].trim().replace(/\s*\/\*.*?\*\/\s*/g, "").trim();
  }
  return tokens;
}

const indexHtml = readFileSync(indexHtmlPath, "utf8");
const rootBlock = extractBlock(indexHtml, ":root {");
const darkBlock = extractBlock(indexHtml, ".dark {");
const rootTokens = parseTokens(rootBlock);
const darkTokens = parseTokens(darkBlock);

// ---------------------------------------------------------------------------
// 1) DESIGN_CLEANUP_PLAN §2.2 "주거·자동차"(파랑) 확정 표 — 문자열 일치
//    (재계산 금지 — 표 값을 그대로 박아 넣는다)
// ---------------------------------------------------------------------------
const EXPECTED = {
  light: {
    "--primary": "214 74% 33%",
    "--primary-foreground": "0 0% 100%",
    "--secondary": "214 15% 91%",
    "--secondary-foreground": "222 47% 11%",
    "--accent": "214 72% 95%",
    "--accent-foreground": "214 74% 30%",
  },
  dark: {
    "--primary": "213 94% 68%",
    "--primary-foreground": "213 94% 10%",
    "--secondary": "213 15% 20%",
    "--secondary-foreground": "210 40% 96%",
    "--accent": "213 74% 22%",
    "--accent-foreground": "213 94% 78%",
  },
};

// --ring은 표(=primary)를 의도적으로 따르지 않는다. v3 §2.1 color.focus(ink)가 정본이고
// d85a39c(#55, @shakilabs/ui 0.3.17 AppShell)가 이미 이 값으로 교정해 7/11 앱에 반영돼
// 있었다(2026-09-17 계획서 §2.2 정정으로 표도 "--ring은 액센트가 아니라 ink"로 갱신됨).
// 패키지 --sh-color-focus가 --ring에서 값을 가져가므로 이건 함대 전체 포커스 링 색이다.
const EXPECTED_RING = {
  light: "0 0% 3.92%", // #0A0A0A
  dark: "0 0% 96.08%", // #F5F5F5
};

for (const [key, expected] of Object.entries(EXPECTED.light)) {
  if (rootTokens[key] === expected) {
    pass(`라이트 ${key} = ${expected}`);
  } else {
    fail(`라이트 ${key}: expected "${expected}", got "${rootTokens[key] ?? "(missing)"}"`);
  }
}
for (const [key, expected] of Object.entries(EXPECTED.dark)) {
  if (darkTokens[key] === expected) {
    pass(`다크 ${key} = ${expected}`);
  } else {
    fail(`다크 ${key}: expected "${expected}", got "${darkTokens[key] ?? "(missing)"}"`);
  }
}

// --ring 미선언 시 패키지가 리터럴 "222 47% 20%"(슬레이트)로 조용히 폴백한다 — 반드시 명시.
if (!rootTokens["--ring"]) {
  fail("라이트 --ring이 선언되어 있지 않다 — 패키지가 222 47% 20%로 조용히 폴백한다");
} else if (rootTokens["--ring"] === EXPECTED_RING.light) {
  pass(`라이트 --ring = ${EXPECTED_RING.light} (ink, color.focus — 액센트 아님)`);
} else {
  fail(`라이트 --ring: expected ink "${EXPECTED_RING.light}", got "${rootTokens["--ring"]}"`);
}
if (!darkTokens["--ring"]) {
  fail("다크 --ring이 선언되어 있지 않다 — 패키지가 222 47% 20%로 조용히 폴백한다");
} else if (darkTokens["--ring"] === EXPECTED_RING.dark) {
  pass(`다크 --ring = ${EXPECTED_RING.dark} (ink, color.focus — 액센트 아님)`);
} else {
  fail(`다크 --ring: expected ink "${EXPECTED_RING.dark}", got "${darkTokens["--ring"]}"`);
}

// ---------------------------------------------------------------------------
// 2) 라이트 --primary L 24~41%, 다크 L 45~72% 밴드
// ---------------------------------------------------------------------------
const lightPrimaryL = getLightness(rootTokens["--primary"] ?? "0 0% 0%");
const darkPrimaryL = getLightness(darkTokens["--primary"] ?? "0 0% 0%");
if (lightPrimaryL >= 24 && lightPrimaryL <= 41) {
  pass(`라이트 --primary L=${lightPrimaryL}% (24~41% 밴드 안)`);
} else {
  fail(`라이트 --primary L=${lightPrimaryL}% — 24~41% 밴드 밖`);
}
if (darkPrimaryL >= 45 && darkPrimaryL <= 72) {
  pass(`다크 --primary L=${darkPrimaryL}% (45~72% 밴드 안)`);
} else {
  fail(`다크 --primary L=${darkPrimaryL}% — 45~72% 밴드 밖`);
}

// ---------------------------------------------------------------------------
// 3) 의미색 4개 — v3 §2.1 고정 hex와 일치 (main.css :root/.dark)
// ---------------------------------------------------------------------------
const mainCss = readFileSync(mainCssPath, "utf8");
const statusRootBlock = extractBlock(mainCss, ":root {");
const statusDarkBlock = extractBlock(mainCss, ".dark {");
const statusRootTokens = parseTokens(statusRootBlock);
const statusDarkTokens = parseTokens(statusDarkBlock);

const STATUS_HEX = {
  "--status-success": { light: "#1B7A4A", dark: "#5DCA8E" },
  "--status-warning": { light: "#B45309", dark: "#F0B429" },
  "--status-danger": { light: "#C62828", dark: "#F07171" },
  "--status-info": { light: "#1D4E8C", dark: "#8BB4E8" },
};

for (const [token, { light, dark }] of Object.entries(STATUS_HEX)) {
  const lightHsl = statusRootTokens[token];
  const darkHsl = statusDarkTokens[token];
  if (!lightHsl) {
    fail(`라이트 ${token}이 main.css :root에 없다`);
  } else if (hslToHex(lightHsl) === light) {
    pass(`라이트 ${token} = ${lightHsl} (${light})`);
  } else {
    fail(`라이트 ${token}: hsl(${lightHsl}) = ${hslToHex(lightHsl)}, expected ${light}`);
  }
  if (!darkHsl) {
    fail(`다크 ${token}이 main.css .dark에 없다`);
  } else if (hslToHex(darkHsl) === dark) {
    pass(`다크 ${token} = ${darkHsl} (${dark})`);
  } else {
    fail(`다크 ${token}: hsl(${darkHsl}) = ${hslToHex(darkHsl)}, expected ${dark}`);
  }
}

// ---------------------------------------------------------------------------
// 4) 로컬 별칭이 빌드 CSS에 남아 있으면 실패 (dist/assets/*.css)
// ---------------------------------------------------------------------------
if (!existsSync(distAssetsDir)) {
  fail(`${distAssetsDir}가 없다 — verify:accent-tokens는 build.mjs가 vite-ssg 빌드 뒤에 실행해야 한다`);
} else {
  const cssFiles = readdirSync(distAssetsDir).filter((f) => f.endsWith(".css"));
  const builtCss = cssFiles.map((f) => readFileSync(resolve(distAssetsDir, f), "utf8")).join("\n");

  const FORBIDDEN_PATTERNS = [
    { name: "--profit 커스텀 프로퍼티", re: /--profit\s*:/ },
    { name: "--fee 커스텀 프로퍼티", re: /--fee\s*:/ },
    { name: "--profit-foreground", re: /--profit-foreground\s*:/ },
    { name: "--fee-foreground", re: /--fee-foreground\s*:/ },
    { name: ".text-fee 유틸리티", re: /\.text-fee[^a-zA-Z0-9_-]/ },
    { name: ".bg-fee 유틸리티", re: /\.bg-fee[^a-zA-Z0-9_-]/ },
    { name: ".border-fee 유틸리티", re: /\.border-fee[^a-zA-Z0-9_-]/ },
    { name: ".text-profit 유틸리티", re: /\.text-profit[^a-zA-Z0-9_-]/ },
    { name: ".bg-profit 유틸리티", re: /\.bg-profit[^a-zA-Z0-9_-]/ },
    { name: ".border-profit 유틸리티", re: /\.border-profit[^a-zA-Z0-9_-]/ },
    { name: ".ring-profit 유틸리티", re: /\.ring-profit[^a-zA-Z0-9_-]/ },
    // 폐기한 마켓/PG 브랜드 hex 팔레트(tailwind.config market.*) 잔존 여부
    { name: "market.smartstore 브랜드 hex(#03c75a)", re: /#03c75a/i },
    { name: "market.coupang 브랜드 hex(#e31937)", re: /#e31937/i },
    { name: "market.elevenst 브랜드 hex(#ff6b00)", re: /#ff6b00/i },
    { name: "market.gmarket 브랜드 hex(#00b050)", re: /#00b050/i },
  ];

  for (const { name, re } of FORBIDDEN_PATTERNS) {
    if (re.test(builtCss)) {
      fail(`빌드 CSS에 로컬 별칭이 남아 있다: ${name}`);
    } else {
      pass(`빌드 CSS에 ${name} 없음`);
    }
  }
}

// ---------------------------------------------------------------------------
// 5) 대비 ≥4.5:1 — primary vs 카드·캔버스, accent-fg vs accent 틴트 (라이트·다크)
// ---------------------------------------------------------------------------
const CARD = { light: "#FFFFFF", dark: "#1C1C1C" };
const CANVAS = { light: "#F7F7F5", dark: "#121212" };

function assertContrast(label, fgHex, bgHex, min = 4.5) {
  const ratio = contrastRatio(hexToRgb(fgHex), hexToRgb(bgHex));
  if (ratio >= min) {
    pass(`${label}: ${ratio.toFixed(2)}:1 (>= ${min}:1)`);
  } else {
    fail(`${label}: ${ratio.toFixed(2)}:1 — ${min}:1 미달`);
  }
  return ratio;
}

if (!failed || true) {
  // 토큰 자체가 깨져 있어도(위에서 이미 FAIL 기록됨) 대비 계산은 실제 값 기준으로 계속 돈다 —
  // "표와 다른데 대비까지 우연히 통과"하는 조합을 놓치지 않기 위해서다.
  try {
    const lightPrimaryHex = hslToHex(rootTokens["--primary"]);
    const darkPrimaryHex = hslToHex(darkTokens["--primary"]);
    assertContrast("라이트 --primary vs 카드(#FFFFFF)", lightPrimaryHex, CARD.light);
    assertContrast("라이트 --primary vs 캔버스(#F7F7F5)", lightPrimaryHex, CANVAS.light);
    assertContrast("다크 --primary vs 카드(#1C1C1C)", darkPrimaryHex, CARD.dark);
    assertContrast("다크 --primary vs 캔버스(#121212)", darkPrimaryHex, CANVAS.dark);

    const lightAccentFgHex = hslToHex(rootTokens["--accent-foreground"]);
    const lightAccentHex = hslToHex(rootTokens["--accent"]);
    const darkAccentFgHex = hslToHex(darkTokens["--accent-foreground"]);
    const darkAccentHex = hslToHex(darkTokens["--accent"]);
    assertContrast("라이트 accent-fg vs accent 틴트", lightAccentFgHex, lightAccentHex);
    assertContrast("다크 accent-fg vs accent 틴트", darkAccentFgHex, darkAccentHex);

    // 코디네이터 지적(함정2) — status-warning vs --muted. --muted는 이 그룹에서 건드리지
    // 않았지만, v3 고정 경고색(#B45309/#F0B429)이 기존 --muted 위에서도 여전히 4.5:1을
    // 만족하는지는 별도로 재검증해야 한다(다른 그룹은 4.38:1로 미달이었다).
    const mutedLightHex = hslToHex(rootTokens["--muted"] ?? statusRootTokens["--muted"] ?? "210 40% 96%");
    const mutedDarkHex = hslToHex(darkTokens["--muted"] ?? statusDarkTokens["--muted"] ?? "217 33% 17%");
    assertContrast("라이트 status-warning(#B45309) vs --muted", "#B45309", mutedLightHex);
    assertContrast("다크 status-warning(#F0B429) vs --muted", "#F0B429", mutedDarkHex);
  } catch (err) {
    fail(`대비 계산 중 오류: ${err.message}`);
  }
}

// ---------------------------------------------------------------------------
if (failed) {
  console.error("[verify:accent-tokens] 검증 실패 — 위 FAIL 항목을 해결하라.");
  process.exit(1);
}

console.log("[verify:accent-tokens] 전체 통과.");
