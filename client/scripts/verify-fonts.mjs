// 빌드마다 도는 빠른 게이트: 브라우저 재실행 없이 매니페스트 대조만 한다.
// 문자셋 자체의 정확성(미커버 0)은 생성 시점에 scripts/collect-brand-font-chars.mjs +
// fontTools cmap 대조로 보증한다 — 여기서는 "체크인된 산출물이 그대로 배포되는지"만 본다.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { brandFontJob, charsetFile, clientRoot, manifestFile } from "./font-subset-config.mjs";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function hash(content) {
  return createHash("sha256").update(content).digest("hex");
}

const manifest = JSON.parse(readFileSync(manifestFile, "utf8"));
const characters = readFileSync(charsetFile, "utf8");
assert(
  manifest.characterSha256 === hash(characters),
  "brand-font-charset.txt가 바뀌었는데 매니페스트가 갱신 안 됨; npm run fonts:subset 다시 실행해라"
);

const distRoot = resolve(clientRoot, "dist");
const fontPath = resolve(distRoot, "fonts", brandFontJob.publicName);
assert(existsSync(fontPath), `Missing shipped font: ${brandFontJob.publicName}`);
const font = readFileSync(fontPath);
assert(font.subarray(0, 4).toString("ascii") === "wOF2", "Shipped font must be WOFF2");
assert(font.byteLength <= brandFontJob.maxBytes, `${brandFontJob.publicName} exceeds its ${brandFontJob.maxBytes}-byte budget`);
assert(manifest.font.bytes === font.byteLength, `${brandFontJob.publicName} manifest size is stale`);
assert(manifest.font.sha256 === hash(font), `${brandFontJob.publicName} hash does not match — regenerate with npm run fonts:subset`);

const css = readdirSync(resolve(distRoot, "assets"))
  .filter((file) => file.endsWith(".css"))
  .map((file) => readFileSync(resolve(distRoot, "assets", file), "utf8"))
  .join("\n");
assert(css.includes(`/fonts/${brandFontJob.publicName}`), `Built CSS misses ${brandFontJob.publicName}`);
assert(!css.includes("GmarketSansBold.woff)"), "원본 GmarketSansBold.woff(966KB)를 CSS가 여전히 참조한다");

console.log(`Validated brand font subset (${font.byteLength}B, ${manifest.characterCount} chars).`);
