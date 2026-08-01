// vendor tgz ↔ vendor/README.md ↔ package.json 3자 대조.
// README의 SHA-256은 공급망 무결성 기록이므로 드리프트하면 검증자에게 오답을 준다.
// vendor 디렉터리가 없으면 no-op으로 빠져 12개 앱에 그대로 복사할 수 있다.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const vendorDir = resolve(projectRoot, "vendor");

if (!existsSync(vendorDir)) {
  console.log("verify-vendor-artifact: no vendor directory, skipping");
  process.exit(0);
}

const tarballs = readdirSync(vendorDir).filter((name) => name.endsWith(".tgz"));

if (tarballs.length === 0) {
  console.log("verify-vendor-artifact: no vendored tarball, skipping");
  process.exit(0);
}

const errors = [];
const readmePath = resolve(vendorDir, "README.md");
const readme = existsSync(readmePath) ? readFileSync(readmePath, "utf8") : "";
const pkg = JSON.parse(readFileSync(resolve(projectRoot, "package.json"), "utf8"));
const deps = { ...pkg.dependencies, ...pkg.devDependencies };

if (!readme) {
  errors.push("vendor/README.md is missing");
}

for (const tarball of tarballs) {
  const digest = createHash("sha256").update(readFileSync(resolve(vendorDir, tarball))).digest("hex");
  const version = tarball.replace(/\.tgz$/, "").match(/(\d+\.\d+\.\d+)$/)?.[1];

  if (!readme.includes(tarball)) {
    errors.push(`${tarball}: not referenced in vendor/README.md`);
  }

  if (!readme.includes(digest)) {
    errors.push(`${tarball}: SHA-256 ${digest} not recorded in vendor/README.md`);
  }

  if (version && !new RegExp(`\`@[\\w/.-]+\` ${version.replace(/\./g, "\\.")}\\b`).test(readme)) {
    errors.push(`${tarball}: version ${version} not stated in vendor/README.md`);
  }

  const referenced = Object.values(deps).some((spec) => spec === `file:vendor/${tarball}`);

  if (!referenced) {
    errors.push(`${tarball}: no package.json dependency resolves to file:vendor/${tarball}`);
  }
}

for (const [name, spec] of Object.entries(deps)) {
  if (typeof spec === "string" && spec.startsWith("file:vendor/") && !existsSync(resolve(projectRoot, spec.slice("file:".length)))) {
    errors.push(`${name}: ${spec} referenced in package.json but the file is missing`);
  }
}

if (errors.length > 0) {
  console.error("verify-vendor-artifact: FAILED");
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(`verify-vendor-artifact: OK (${tarballs.join(", ")})`);
