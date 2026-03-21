import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import {
  SEO_ROUTES,
  TAX_PRICES,
  INSURANCE_PREMIUMS,
  LEASE_PRICES,
} from "./seo-routes.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const sitemapPath = resolve(projectRoot, "public", "sitemap.xml");
const viteSsgBin = resolve(
  projectRoot,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "vite-ssg.cmd" : "vite-ssg"
);

const paramPaths = new Set([
  ...TAX_PRICES.map((a) => `/tax/${a}`),
  ...INSURANCE_PREMIUMS.map((a) => `/insurance/${a}`),
  ...LEASE_PRICES.map((a) => `/lease-vs-loan/${a}`),
]);

const basePriority = {
  "/": "0.5",
  "/tax": "1.0",
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
  if (paramPaths.has(path)) {
    return { changefreq: "monthly", priority: "0.7" };
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
  const baseUrl = "https://shakilabs.com/car";
  const urls = SEO_ROUTES.map((path) => {
    const { changefreq, priority } = getRouteConfig(path);
    return `  <url>
    <loc>${path === "/" ? `${baseUrl}/` : `${baseUrl}${path}`}</loc>
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

if (typeof result.status === "number") {
  process.exit(result.status);
}

process.exit(1);
