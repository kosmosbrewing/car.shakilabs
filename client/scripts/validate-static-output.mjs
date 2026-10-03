import { existsSync, readFileSync, readdirSync } from "node:fs";
import { validateBuiltFontSizes } from "./validate-built-font-sizes.mjs";
import { validateNoTinyTextUtilities } from "./validate-no-tiny-text.mjs";
import { validateParagraphLength } from "./validate-paragraph-length.mjs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PRERENDER_ROUTES,
  SEO_ROUTES,
  SITEMAP_ROUTES,
  PARAM_ROUTES,
  canonicalPathFor,
} from "./seo-routes.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const repositoryRoot = resolve(projectRoot, "..");
const distRoot = resolve(projectRoot, "dist");
const canonicalBase = "https://shakilabs.com/car";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function routeOutputPath(route) {
  return route === "/"
    ? resolve(distRoot, "index.html")
    : resolve(distRoot, route.slice(1) + ".html");
}

function canonicalFrom(html) {
  return html.match(/<link rel="canonical" href="([^"]+)"\s*\/?>/)?.[1];
}

// cleanUrls redirects "/car/" to "/car", so the home is addressed without a
// trailing slash everywhere: canonical, og:url and the sitemap loc alike.
function canonicalUrlFor(route) {
  return route === "/" ? canonicalBase : canonicalBase + route;
}

function validateVercelConfig(configPath) {
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  const rewrites = config.rewrites ?? [];
  const indexRewrites = rewrites.filter(
    (rewrite) => rewrite.destination === "/index.html"
  );
  const routeRewrite = rewrites.find(
    (rewrite) => rewrite.source === "/car/:path*"
  );
  const routeRewriteIndex = rewrites.indexOf(routeRewrite);
  const aliasRewrites = ["/car", "/car/"].map((source) =>
    rewrites.find((rewrite) => rewrite.source === source)
  );

  assert(config.cleanUrls === true, configPath + ": cleanUrls must be true");
  assert(indexRewrites.length === 0, configPath + ": index.html catch-all rewrite is forbidden");
  assert(aliasRewrites.every((rewrite) => rewrite?.destination === "/"),
    configPath + ": car root aliases must rewrite to the root HTML");
  assert(aliasRewrites.every((rewrite) => rewrites.indexOf(rewrite) < routeRewriteIndex),
    configPath + ": car root aliases must precede the wildcard rewrite");
  assert(routeRewrite?.destination === "/:path*",
    configPath + ": car rewrite must preserve the requested path");
}

// 함대 제목 레시피(2026-10-03 개정) 게이트 — useSEO.buildPageTitle의 두 모양을 산출물에서 확인한다.
// - "tool"(계산기·도구, 기본): `<페이지 제목> | ShakiLabs` — 네이버는 제목을 ~35자에서
//   자르므로 가운데 앱 이름이 되살아나거나 제목이 길어지면 핵심 구절이 다시 잘린다.
// - "site"(허브(/all)·소개·약관·개인정보·404): `<페이지 제목> · <앱 이름> | ShakiLabs` —
//   앱 이름이 빠지면 shakilabs.com 아래 12개 앱의 "이용약관 | ShakiLabs"가 서로 같아진다.
// - 홈: `<앱 이름> | ShakiLabs`.
// 소스가 아니라 산출물을 본다: 셸 <title>과 뷰 제목이 합쳐지거나 차트 SVG <title>이
// 다시 들어와도(0.3.42에서 제거) 여기서 걸린다. useSEO.ts의 APP_NAME과 반드시 같이 바꿀 것.
const TITLE_BRAND_SUFFIX = " | ShakiLabs";
const APP_NAME = "자동차 비교 계산기";
const SITE_TITLE_ROUTES = new Set(["/all", "/about", "/terms", "/privacy", "/404"]);
const MAX_PAGE_TITLE_CHARS = 40;

// route는 보고용 실제 경로, kindRoute는 레시피 모양을 고르는 기준 경로다.
// 금액 변형(/tax/2000 등)은 자기 캐노니컬 베이스("/tax")의 "tool" 모양을 쓰지만
// 베이스와 다른 자기 title을 가지므로, 검사 대상 html은 항상 route 자신의 산출물이다.
function validateTitleRecipe(html, route, kindRoute = route) {
  const titleTagCount = html.match(/<title\b/gi)?.length ?? 0;
  assert(titleTagCount === 1,
    "Expected exactly one <title> tag for " + route + ", found " + titleTagCount);

  const title = html.match(/<title>([^<]+)<\/title>/)?.[1]?.trim() ?? "";
  assert(title.endsWith(TITLE_BRAND_SUFFIX),
    'Title must end with "' + TITLE_BRAND_SUFFIX + '" for ' + route + ": " + title);
  const head = title.slice(0, -TITLE_BRAND_SUFFIX.length);
  assert(!head.includes(" | "),
    "Title must not carry a middle \" | \" segment for " + route + ": " + title);

  let pageTitle;
  if (kindRoute === "/") {
    assert(head === APP_NAME,
      'Home title must be "' + APP_NAME + TITLE_BRAND_SUFFIX + '": ' + title);
    pageTitle = head;
  } else if (SITE_TITLE_ROUTES.has(kindRoute)) {
    const appSuffix = " · " + APP_NAME;
    assert(head.endsWith(appSuffix),
      'Site page title must be "<page title>' + appSuffix + TITLE_BRAND_SUFFIX
        + '" for ' + route + ": " + title);
    pageTitle = head.slice(0, -appSuffix.length);
  } else {
    assert(!head.includes(APP_NAME),
      "Tool page title must not carry the app name for " + route + ": " + title);
    pageTitle = head;
  }
  assert(pageTitle.length > 0 && pageTitle.length <= MAX_PAGE_TITLE_CHARS,
    "Page title must be 1-" + MAX_PAGE_TITLE_CHARS + " chars for " + route + ": " + pageTitle.length);

  const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1]?.trim();
  assert(description, "Missing meta description for " + route);
}

function validateRoute(route) {
  const outputPath = routeOutputPath(route);
  assert(existsSync(outputPath), "Missing static output for " + route + ": " + outputPath);

  const html = readFileSync(outputPath, "utf8");
  // Amount variants must canonicalize to their base page (doorway
  // consolidation); every other route stays self-canonical.
  const expectedCanonical = canonicalUrlFor(canonicalPathFor(route));
  const h1Count = html.match(/<h1\b/gi)?.length ?? 0;

  assert(canonicalFrom(html) === expectedCanonical,
    "Invalid canonical for " + route + ": expected " + expectedCanonical);
  assert(html.includes('id="app"'), "Missing app root for " + route);
  assert(h1Count === 1, "Expected one H1 for " + route + ", found " + h1Count);
  assert(!/<noscript>/i.test(html),
    "Rendered route must not retain the shell noscript for " + route);
  // Amount-variant routes (PARAM_ROUTES) canonicalize to their base calculator,
  // so the title recipe shape follows the base page's kind (also "tool"),
  // but the html checked is always this route's own static output.
  validateTitleRecipe(html, route, canonicalPathFor(route));
}

function validateSitemap() {
  const sitemap = readFileSync(resolve(distRoot, "sitemap.xml"), "utf8");
  const actualUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const expectedUrls = SITEMAP_ROUTES.map(canonicalUrlFor);
  const variantUrls = new Set(PARAM_ROUTES.map((route) => canonicalBase + route));

  assert(JSON.stringify(actualUrls) === JSON.stringify(expectedUrls),
    "Sitemap must contain exactly the self-canonical routes");
  assert(actualUrls.every((url) => !variantUrls.has(url)),
    "Sitemap must not list canonicalized amount-variant routes");
  return new Set(actualUrls);
}

// 라우터에 선언된 경로를 뜯어 { path, redirect } 목록으로 돌려준다.
// 라우터 파일이 진실의 원천이라 소스를 직접 읽는다 — SEO_ROUTES는 사람이 손으로
// 맞추는 사본이고, 이번 결함이 바로 그 사본이 원본과 어긋난 사고였다.
function parseRouterRoutes(source) {
  const body = source.slice(source.indexOf("export const routes"));
  const marks = [...body.matchAll(/path:\s*"([^"]+)"/g)].map((match) => ({
    path: match[1],
    index: match.index,
  }));

  return marks.map((mark, i) => ({
    path: mark.path,
    // 다음 path: 선언 전까지가 이 라우트의 본문이다
    redirect: /redirect:/.test(body.slice(mark.index, marks[i + 1]?.index ?? body.length)),
  }));
}

// 회귀 게이트: 라우터에 등록된 정적 라우트(특히 인덱스 라우트)가 사이트맵에 있는가.
//
// 왜 필요한가: "/"가 SEO_ROUTES에서 빠져 있어도 빌드는 통과했고, 프리렌더도 됐고,
// 라이브도 200을 돌려줬다. 사이트맵에서만 조용히 사라져 앱에서 가장 권위 높은 URL이
// 색인 후보 밖에 있었다. 사람 눈으로 XML을 세는 것 말고는 잡을 방법이 없던 결함이다.
//
// 양방향인 이유: 리다이렉트 라우트는 자기 화면이 없어 다른 페이지로 canonical 통합되므로
// 사이트맵에 실으면 안 된다. "홈을 넣어라"만 검사하면 홈을 리다이렉트로 되돌린 뒤
// 사이트맵에만 URL을 남기는, 더 나쁜 모순 상태를 통과시키게 된다.
function validateRouterRoutesAreListed(sitemapUrls) {
  const routerSource = readFileSync(
    resolve(projectRoot, "src", "router", "index.ts"),
    "utf8"
  );
  const routerRoutes = parseRouterRoutes(routerSource);
  const indexRoute = routerRoutes.find((route) => route.path === "/");

  assert(indexRoute, "router/index.ts must register an index route");
  assert(!indexRoute.redirect,
    "Index route must render its own view: a redirect home canonicalizes to the "
      + "target page, and a page that points its canonical elsewhere cannot be listed");

  for (const route of routerRoutes) {
    // 파라미터·캐치올 라우트는 정적 URL이 아니고, 리다이렉트는 위 규칙대로 제외한다
    if (route.redirect || route.path.includes(":")) continue;
    const url = canonicalUrlFor(route.path);
    assert(sitemapUrls.has(url),
      "Router route is missing from the sitemap: " + url);
  }
}

// 회귀 게이트: 소스에 적은 투명도 유틸리티가 실제로 CSS로 생성됐는가.
//
// 왜 필요한가: Tailwind의 슬래시 투명도는 opacity 스케일(5·10·20·25…)에 있는 값만
// 클래스를 만든다. bg-destructive/8 처럼 스케일 밖 숫자를 적으면 빌드는 아무 말 없이
// 통과하고, 클래스는 CSS에 존재하지 않아 그 자리에 배경이 그냥 안 칠해진다.
// 테마에 없는 색 이름(bg-warning — 이 앱의 토큰은 status.warning이다)도 같은 방식으로
// 조용히 사라진다. 화면을 눈으로 보기 전에는 드러나지 않고, 봐도 "원래 그런 줄" 알기 쉽다.
// 실제로 EvVsGasView의 보조금 경고 배너 두 개가 이 상태로 배포돼 있었다.
function collectSourceFiles(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) collectSourceFiles(full, out);
    else if (/\.(vue|ts)$/.test(entry.name) && !/\.test\.ts$/.test(entry.name)) out.push(full);
  }
  return out;
}

function validateOpacityUtilitiesAreGenerated() {
  const cssDir = resolve(distRoot, "assets");
  const cssFiles = readdirSync(cssDir).filter((name) => name.endsWith(".css"));
  assert(cssFiles.length > 0, "No built CSS found to validate utilities against");
  const css = cssFiles.map((name) => readFileSync(resolve(cssDir, name), "utf8")).join("\n");

  // bg-primary/12, hover:bg-card/[92%] 등 "색 유틸리티 + 슬래시 투명도"만 본다.
  // 레이아웃 유틸까지 넓히면 동적 생성 문자열 때문에 오탐이 늘어난다.
  const utility = /(?:[a-z-]+:)*(?:bg|text|border|ring|divide|fill|stroke|outline|placeholder|from|via|to)-[a-z][a-z0-9-]*\/(?:\d+|\[[0-9.]+%?\])/g;
  // Tailwind가 클래스명을 CSS 셀렉터로 바꿀 때 이스케이프하는 문자들
  const toSelector = (cls) => cls.replace(/[/[\]%.:]/g, (ch) => "\\" + ch);

  const missing = [];
  for (const file of collectSourceFiles(resolve(projectRoot, "src"))) {
    const source = readFileSync(file, "utf8");
    for (const cls of new Set(source.match(utility) ?? [])) {
      if (css.includes("." + toSelector(cls))) continue;
      missing.push(cls + "  (" + file.slice(projectRoot.length + 1) + ")");
    }
  }
  assert(missing.length === 0,
    "이 투명도 유틸리티는 CSS로 생성되지 않았다 — Tailwind opacity 스케일 밖 값이면 "
      + "임의값 문법(/[8%])을 쓰고, 색 이름은 테마에 있는 것인지 확인하라:\n  "
      + missing.join("\n  "));

  // 확장 축 1 — spacing: mt-13, p-4.5 처럼 spacing 스케일 밖 값도 색과 똑같이
  // 조용히 사라진다(빌드는 통과, CSS 미생성). 숫자값 spacing 유틸만 좁게 잡아
  // 동적 문자열 오탐을 피하면서 산출 CSS와 대조한다.
  const spacingUtility =
    /(?<![\w/[-])(?:[a-z-]+:)*-?(?:m[trblxyse]?|p[trblxyse]?|gap(?:-[xy])?|space-[xy])-(?:\d+(?:\.\d+)?|px)(?![\w/%.[-])/g;
  const missingSpacing = [];
  for (const file of collectSourceFiles(resolve(projectRoot, "src"))) {
    const source = readFileSync(file, "utf8");
    for (const cls of new Set(source.match(spacingUtility) ?? [])) {
      if (css.includes("." + toSelector(cls))) continue;
      missingSpacing.push(cls + "  (" + file.slice(projectRoot.length + 1) + ")");
    }
  }
  assert(missingSpacing.length === 0,
    "이 spacing 유틸리티는 CSS로 생성되지 않았다 — Tailwind spacing 스케일 밖 값이다. "
      + "스케일 안 값이나 임의값 문법(mt-[52px])을 쓰라:\n  "
      + missingSpacing.join("\n  "));

  // 확장 축 2 — 후행 `!`: Tailwind v3의 important는 접두사(!mt-4)다. 접미사(mt-4!)는
  // v4 문법이라 v3에선 클래스가 아예 생성되지 않고 마크업에만 남는다.
  const trailingBang =
    /(?:[a-z-]+:)*(?:bg|text|border|ring|shadow|rounded|opacity|flex|grid|gap|w|h|z|m[trblxy]?|p[trblxy]?)-[a-z0-9[\]/.%-]+!(?=[\s"'`])/g;
  const bangHits = [];
  for (const file of collectSourceFiles(resolve(projectRoot, "src"))) {
    if (!file.endsWith(".vue")) continue;
    const source = readFileSync(file, "utf8");
    for (const cls of new Set(source.match(trailingBang) ?? [])) {
      bangHits.push(cls + "  (" + file.slice(projectRoot.length + 1) + ")");
    }
  }
  assert(bangHits.length === 0,
    "후행 `!` 유틸리티는 Tailwind v3에서 생성되지 않는다 — 접두사 문법(!mt-4)으로 바꾸라:\n  "
      + bangHits.join("\n  "));
}

validateVercelConfig(resolve(repositoryRoot, "vercel.json"));
validateVercelConfig(resolve(projectRoot, "vercel.json"));
assert(PRERENDER_ROUTES[0] === "/", "Home must be prerendered first");
// validateRoute also runs for PARAM_ROUTES: their static HTML must keep
// existing (soft-404 guard) even though they are absent from the sitemap.
// It covers "/" too now, so the home's canonical/title/H1 are checked there.
SEO_ROUTES.forEach(validateRoute);
const sitemapUrls = validateSitemap();
validateRouterRoutesAreListed(sitemapUrls);
validateOpacityUtilitiesAreGenerated();

// 홈이 실제로 자기 콘텐츠를 갖고 렌더됐는지. 라우터가 리다이렉트로 되돌아가면
// vite-ssg는 대상 페이지를 그대로 index.html에 복사해 /car가 /car/tax의 사본이 된다.
const rootHtml = readFileSync(resolve(distRoot, "index.html"), "utf8");
const titleOf = (html) => html.match(/<title>([^<]+)<\/title>/)?.[1] ?? "";
assert(!/<div id="app">\s*<\/div>/.test(rootHtml),
  "Home must be prerendered, not shipped as the empty shell");
for (const twin of ["/tax", "/all"]) {
  assert(titleOf(rootHtml) !== titleOf(readFileSync(routeOutputPath(twin), "utf8")),
    "Home must not duplicate " + twin + ": identical titles mean the home has no page of its own");
}

const notFoundPath = resolve(distRoot, "404.html");
assert(existsSync(notFoundPath), "Missing custom 404.html output");
const notFoundHtml = readFileSync(notFoundPath, "utf8");
assert(/name="robots" content="noindex,nofollow"/.test(notFoundHtml),
  "404.html must be noindex,nofollow");
validateTitleRecipe(notFoundHtml, "/404");
assert(notFoundHtml.includes('href="/car/tax"'),
  "404.html must contain a recovery link back into the calculators");
// Valuable Inventory: 콘텐츠가 없는 화면에는 광고 로더 자체가 있으면 안 된다.
// noindex는 색인만 막고 정책은 로더의 존재를 본다 — 셸에서 물려받은 태그를
// build.mjs가 지우는데, 그 제거가 조용히 깨지면 이 어서션이 잡는다.
assert(!/adsbygoogle|googlesyndication/i.test(notFoundHtml),
  "404.html must not load the AdSense script (Valuable Inventory: no ads on a contentless screen)");
// 역방향 검증: 정상 라우트의 광고 배선까지 같이 날아가면 안 된다.
const taxHtml = readFileSync(routeOutputPath("/tax"), "utf8");
assert(/googlesyndication\.com/i.test(taxHtml),
  "Content routes must keep the AdSense loader (404-only strip must not leak)");

console.log("Validated " + SEO_ROUTES.length
  + " prerendered routes (" + SITEMAP_ROUTES.length + " sitemap + "
  + PARAM_ROUTES.length + " canonicalized variants), root alias, and custom 404 output.");

// v8b(2026-10-03): 13px 미만 글자 소스 게이트 + 빌드 HTML 문단 ≤250자 게이트
validateNoTinyTextUtilities({ projectRoot });
validateParagraphLength({ distRoot });

// v8c(2026-10-04): 배포되는 CSS·HTML의 글자 크기를 직접 잰다 — 13px 미만은 차트 축 눈금(__scale)·차트 전용 text-[12px]만.
const builtFontDeclarations = validateBuiltFontSizes({ distRoot: distRoot });
console.log(`Validated built font sizes — ${builtFontDeclarations} declarations, 0 under 13px outside the chart-axis allowance.`);
