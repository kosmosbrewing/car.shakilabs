// scripts/brand-font-charset.txt(체크인된 렌더 스캔 결과)로 GmarketSans 브랜드
// 서브셋을 재생성한다. 문자셋 자체를 바꾸려면 scripts/collect-brand-font-chars.mjs를
// 먼저 다시 돌려라 — 이 스크립트는 저장된 문자셋을 그대로 신뢰한다.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { brandFontJob, charsetFile, manifestFile } from "./font-subset-config.mjs";

const characters = readFileSync(charsetFile, "utf8");
const temporaryRoot = mkdtempSync(join(tmpdir(), "brand-font-"));
const characterFile = resolve(temporaryRoot, "characters.txt");

function hash(content) {
  return createHash("sha256").update(content).digest("hex");
}

try {
  writeFileSync(characterFile, characters);
  const result = spawnSync("python3", [
    "-m", "fontTools.subset",
    brandFontJob.source,
    `--text-file=${characterFile}`,
    "--flavor=woff2",
    `--output-file=${brandFontJob.output}`,
    "--no-hinting",
  ], { encoding: "utf8" });

  if (result.error || result.status !== 0) {
    throw new Error(`Font subsetting failed: ${result.error?.message ?? result.stderr.trim()}`);
  }

  const content = readFileSync(brandFontJob.output);
  if (content.byteLength > brandFontJob.maxBytes) {
    throw new Error(`${brandFontJob.publicName} is ${content.byteLength}B, exceeds ${brandFontJob.maxBytes}B budget`);
  }

  const manifest = {
    schemaVersion: 1,
    characterCount: [...characters].length,
    characterSha256: hash(characters),
    font: {
      publicName: brandFontJob.publicName,
      bytes: content.byteLength,
      sha256: hash(content),
    },
  };
  writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Generated ${brandFontJob.publicName}: ${content.byteLength}B for ${manifest.characterCount} characters.`);
} finally {
  rmSync(temporaryRoot, { force: true, recursive: true });
}
