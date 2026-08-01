// SBOM 신원 검증 — 재생성/diff 방식은 timestamp·documentNamespace·npm 버전 때문에
// 상시 red가 되므로 쓰지 않는다. 결정적인 신원 필드 3개만 대조한다(네트워크 불필요).
// 커밋·생성된 SBOM이 없으면 no-op으로 빠져 12개 앱에 그대로 복사할 수 있다.
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cyclonedxPath = resolve(projectRoot, "artifacts/sbom/production.cyclonedx.json");
const spdxPath = resolve(projectRoot, "artifacts/sbom/production.spdx.json");

if (!existsSync(cyclonedxPath)) {
  console.log("verify-sbom-identity: no SBOM present, skipping");
  process.exit(0);
}

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const pkg = readJson(resolve(projectRoot, "package.json"));
const errors = [];

const component = readJson(cyclonedxPath).metadata?.component ?? {};

if (component.name !== pkg.name) {
  errors.push(`cyclonedx metadata.component.name "${component.name}" !== package.json name "${pkg.name}"`);
}

if (component.version !== pkg.version) {
  errors.push(`cyclonedx metadata.component.version "${component.version}" !== package.json version "${pkg.version}"`);
}

// GITHUB_REPOSITORY는 CI에서만 주어진다. 로컬 실행 시에는 vcs 검사를 건너뛴다.
if (process.env.GITHUB_REPOSITORY) {
  const expected = `https://github.com/${process.env.GITHUB_REPOSITORY}`;
  const vcs = (component.externalReferences ?? []).find((ref) => ref.type === "vcs")?.url;

  if (vcs !== expected) {
    errors.push(`cyclonedx vcs reference "${vcs ?? "(missing)"}" !== "${expected}"`);
  }
}

if (existsSync(spdxPath)) {
  const spdx = readJson(spdxPath);
  const rootId = spdx.documentDescribes?.[0];
  const rootPackage = spdx.packages?.find((item) => item.SPDXID === rootId) ?? spdx.packages?.[0];

  if (rootPackage?.name !== pkg.name) {
    errors.push(`spdx root package name "${rootPackage?.name}" !== package.json name "${pkg.name}"`);
  }
}

if (errors.length > 0) {
  console.error("verify-sbom-identity: FAILED");
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(`verify-sbom-identity: OK (${pkg.name}@${pkg.version})`);
