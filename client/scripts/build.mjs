import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { SITEMAP_ROUTES, PRERENDER_ROUTES } from "./seo-routes.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const sitemapPath = resolve(projectRoot, "public", "sitemap.xml");
const viteSsgBin = resolve(
  projectRoot,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "vite-ssg.cmd" : "vite-ssg"
);

const basePriority = {
  // 홈이 최상위. 다른 앱(invest/loan/biz 등)도 "/" 1.0 / 나머지 0.9 이하를 쓴다.
  "/": "1.0",
  "/all": "0.9",
  "/tax": "0.9",
  "/insurance": "0.9",
  "/lease-vs-loan": "0.9",
  "/parking": "0.8",
  "/maintenance": "0.8",
  "/ev-vs-gas": "0.8",
  "/about": "0.4",
  "/terms": "0.3",
  "/privacy": "0.3",
};

function getRouteConfig(path) {
  if (basePriority[path]) {
    const isInfo = ["about", "terms", "privacy"].some((s) => path.includes(s));
    return {
      changefreq: path === "/tax" ? "weekly" : isInfo ? "yearly" : "weekly",
      priority: basePriority[path],
    };
  }
  return { changefreq: "monthly", priority: "0.5" };
}

function resolveBuildDate() {
  const candidate = process.env.BUILD_DATE?.trim();
  if (candidate && /^\d{4}-\d{2}-\d{2}$/.test(candidate)) {
    return candidate;
  }

  return new Date().toISOString().slice(0, 10);
}

function renderSitemap(buildDate) {
  // Amount-variant routes (PARAM_ROUTES) are intentionally absent: they
  // canonicalize to their base page, so listing them would send crawlers
  // to URLs that immediately point elsewhere.
  const baseUrl = "https://shakilabs.com/car";
  const urls = SITEMAP_ROUTES.map((path) => {
    const { changefreq, priority } = getRouteConfig(path);
    // cleanUrls가 "/car/"를 "/car"로 리다이렉트하므로 홈은 슬래시 없이 실어야 한다
    // (canonical·og:url도 슬래시 없는 형태다 — 셋이 어긋나면 모순 신호가 된다).
    return `  <url>
    <loc>${path === "/" ? baseUrl : `${baseUrl}${path}`}</loc>
    <lastmod>${buildDate}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function routeOutputPath(route) {
  return route === "/"
    ? resolve(projectRoot, "dist", "index.html")
    : resolve(projectRoot, "dist", `${route.slice(1)}.html`);
}

function removeRenderedNoscriptFallbacks() {
  for (const route of [...PRERENDER_ROUTES, "/404"]) {
    const outputPath = routeOutputPath(route);
    if (!existsSync(outputPath)) continue;

    const html = readFileSync(outputPath, "utf8");
    const nextHtml = html.replace(
      /\n?\s*<noscript>[\s\S]*?<\/noscript>/i,
      "",
    );
    writeFileSync(outputPath, nextHtml, "utf8");
  }
}

// 404 화면은 제목 한 줄과 복귀 링크 세 개가 전부다 — 게시자 콘텐츠가 없는 화면에
// 광고 로더를 싣는 것이 Google "Valuable Inventory" 정책이 금지하는 바로 그것이다.
// 모든 라우트가 같은 셸(index.html)에서 나오므로 404도 셸의 AdSense 태그를 물려받는다.
// noindex는 색인만 막을 뿐 로더의 존재 여부를 바꾸지 않으므로 태그 자체를 지운다.
// NotFoundView는 AdSlot을 렌더하지 않고, 광고가 필요한 뷰는 AdSlot이 런타임에
// 로더를 직접 주입(ensureAdsenseScript)하므로 정상 라우트 배선은 영향받지 않는다.
function removeAdsenseLoaderFromNotFound() {
  const outputPath = routeOutputPath("/404");
  if (!existsSync(outputPath)) return;

  const html = readFileSync(outputPath, "utf8");
  const nextHtml = html.replace(
    /\n?\s*<script[^>]*pagead2\.googlesyndication\.com[^>]*>\s*<\/script>/i,
    "",
  );
  writeFileSync(outputPath, nextHtml, "utf8");
}

const buildDate = resolveBuildDate();

mkdirSync(dirname(sitemapPath), { recursive: true });
writeFileSync(sitemapPath, renderSitemap(buildDate), "utf8");

const result = spawnSync(viteSsgBin, ["build"], {
  cwd: projectRoot,
  stdio: "inherit",
  env: {
    ...process.env,
    BUILD_DATE: buildDate,
  },
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

removeRenderedNoscriptFallbacks();
removeAdsenseLoaderFromNotFound();

const validationResult = spawnSync(
  process.execPath,
  [resolve(projectRoot, "scripts", "validate-static-output.mjs")],
  {
    cwd: projectRoot,
    stdio: "inherit",
  }
);

process.exit(validationResult.status ?? 1);
