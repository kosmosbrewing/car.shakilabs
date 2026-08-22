import { existsSync, readFileSync } from "node:fs";
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
  assert(/<title>[^<]+<\/title>/.test(html), "Missing title for " + route);
  assert(html.includes('id="app"'), "Missing app root for " + route);
  assert(h1Count === 1, "Expected one H1 for " + route + ", found " + h1Count);
  assert(!/<noscript>/i.test(html),
    "Rendered route must not retain the shell noscript for " + route);
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

validateVercelConfig(resolve(repositoryRoot, "vercel.json"));
validateVercelConfig(resolve(projectRoot, "vercel.json"));
assert(PRERENDER_ROUTES[0] === "/", "Home must be prerendered first");
// validateRoute also runs for PARAM_ROUTES: their static HTML must keep
// existing (soft-404 guard) even though they are absent from the sitemap.
// It covers "/" too now, so the home's canonical/title/H1 are checked there.
SEO_ROUTES.forEach(validateRoute);
const sitemapUrls = validateSitemap();
validateRouterRoutesAreListed(sitemapUrls);

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
