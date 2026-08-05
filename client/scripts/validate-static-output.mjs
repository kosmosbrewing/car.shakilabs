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
  const expectedCanonical = canonicalBase + canonicalPathFor(route);
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
  const expectedUrls = SITEMAP_ROUTES.map((route) => canonicalBase + route);
  const variantUrls = new Set(PARAM_ROUTES.map((route) => canonicalBase + route));

  assert(JSON.stringify(actualUrls) === JSON.stringify(expectedUrls),
    "Sitemap must contain exactly the self-canonical routes");
  assert(actualUrls.every((url) => !variantUrls.has(url)),
    "Sitemap must not list canonicalized amount-variant routes");
}

validateVercelConfig(resolve(repositoryRoot, "vercel.json"));
validateVercelConfig(resolve(projectRoot, "vercel.json"));
assert(PRERENDER_ROUTES[0] === "/", "Root alias must remain prerendered");
// validateRoute also runs for PARAM_ROUTES: their static HTML must keep
// existing (soft-404 guard) even though they are absent from the sitemap.
SEO_ROUTES.forEach(validateRoute);
validateSitemap();

const rootHtml = readFileSync(resolve(distRoot, "index.html"), "utf8");
assert(canonicalFrom(rootHtml) === canonicalBase + "/tax",
  "Root alias must canonicalize to /car/tax");
assert((rootHtml.match(/<h1\b/gi)?.length ?? 0) === 1,
  "Root alias must contain exactly one H1");
assert(!/<noscript>/i.test(rootHtml),
  "Root alias must not retain the shell noscript");

const notFoundPath = resolve(distRoot, "404.html");
assert(existsSync(notFoundPath), "Missing custom 404.html output");
const notFoundHtml = readFileSync(notFoundPath, "utf8");
assert(/name="robots" content="noindex,nofollow"/.test(notFoundHtml),
  "404.html must be noindex,nofollow");

console.log("Validated " + SEO_ROUTES.length
  + " prerendered routes (" + SITEMAP_ROUTES.length + " sitemap + "
  + PARAM_ROUTES.length + " canonicalized variants), root alias, and custom 404 output.");
