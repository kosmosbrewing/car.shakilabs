import { describe, expect, it } from "vitest";

// tailwind.config.ts를 실제로 import하지 않고 텍스트로 스캔한다 — 직접 import하면
// tsconfig "include" 밖(src/ 바깥)인 이 파일이 vue-tsc 프로그램에 끌려 들어가,
// 이 테스트와 무관한 keyframes 섹션의 기존 타입 결함(height: 0)까지 typecheck를 깨뜨린다.
const configSources = import.meta.glob("../../tailwind.config.ts", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;
const tailwindConfigSource = Object.values(configSources)[0] ?? "";

/**
 * 2026-10-03 v8 점검: /car/ev-vs-gas의 "더 유리" 배지가 12px 검정(#0A0A0A) on #1B7A4A = 3.70:1이었다.
 * 원인은 소스가 아니라 토큰이었다 — 마크업은 처음부터 text-status-success-foreground를 썼지만
 * tailwind.config.ts·main.css 어디에도 --status-success-foreground가 없어 그 유틸리티 자체가
 * 생성되지 않았다. 클래스는 마크업에 남고 글자색만 기본 --foreground(거의 검정)로 조용히
 * 떨어졌다 — 빌드도 타입체크도 못 잡는다.
 *
 * 실제 HSL 대비 수치(main.css :root/.dark 기준 ≥4.5:1 재현·역검증)는
 * `scripts/verify-accent-tokens.mjs`가 build.mjs 체인에서 맡는다(순수 Node, 실제 CSS 텍스트를
 * 읽는다). 이 테스트는 그 토큰이 애초에 "생성되는 유틸리티"로 등록돼 있는지(tailwind.config.ts)와,
 * 같은 결함 패턴(꽉 찬 색 배지에 전경 토큰 누락·13px 미만)이 다른 배지에 다시 쓰이지 않는지를
 * 소스 레벨에서 본다.
 */

const vueSources = import.meta.glob("../**/*.vue", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

describe("status-success 배지 토큰 등록", () => {
  it("tailwind.config.ts가 status.success를 DEFAULT+foreground 객체로 등록한다", () => {
    // 과거엔 success가 평문 문자열(hsl(var(--status-success)))이라 bg-status-success는
    // 만들어지되 text-status-success-foreground는 애초에 유틸리티로 생성되지 않았다.
    // status 블록 안에서 success: { ... } 객체를 찾고, 그 안에 DEFAULT·foreground가
    // 올바른 CSS 변수를 참조하는지 본다(순서는 상관없다).
    const statusBlockMatch = tailwindConfigSource.match(/status:\s*\{([\s\S]*?)\n\s{8}\},/);
    expect(statusBlockMatch, "tailwind.config.ts에서 status 블록을 찾을 수 없다").not.toBeNull();
    const statusBlock = statusBlockMatch?.[1] ?? "";

    const successMatch = statusBlock.match(/success:\s*\{([\s\S]*?)\},/);
    expect(successMatch, "status.success가 객체가 아니다(평문 문자열로 되돌아갔다)").not.toBeNull();
    const successBlock = successMatch?.[1] ?? "";

    expect(successBlock).toMatch(/DEFAULT:\s*"hsl\(var\(--status-success\)\)"/);
    expect(successBlock).toMatch(/foreground:\s*"hsl\(var\(--status-success-foreground\)\)"/);
  });
});

describe("status-success 배지 소스 스캔 (같은 패턴 재발 방지)", () => {
  // 꽉 찬(투명도 없는) bg-status-success 배지는 반드시 전경 토큰과 13px 이상 크기를
  // 같이 써야 한다. 슬래시 투명도(bg-status-success/[12%])는 다른 패턴(연한 틴트 배경 +
  // 색 글자, 예: EvAnnualCostComparison.vue의 금액 표시)이라 이 가드 대상이 아니다.
  const SOLID_SUCCESS_BG = /(?:^|\s)bg-status-success(?=\s|$)/;
  const ANY_TEXT_UTILITY = /(?:^|\s)text-[a-z]/;
  const SUB_13PX = /(?:^|\s)(?:text-tiny|text-xs|text-\[(?:[1-9]|1[0-2])px\])(?=\s|$)/;

  // 글자가 없는 순수 장식 점(예: 상태 표시 dot)은 전경 토큰을 쓸 이유가 없다 — class
  // 안에 text- 유틸리티가 하나도 없으면 "글자가 있는 배지"가 아니므로 대상에서 뺀다.
  function classAttrsWithSolidSuccessBg(): Array<{ path: string; classes: string }> {
    const hits: Array<{ path: string; classes: string }> = [];
    for (const [path, source] of Object.entries(vueSources)) {
      for (const match of source.matchAll(/\bclass="([^"]*)"/g)) {
        const classes = match[1];
        if (SOLID_SUCCESS_BG.test(classes) && ANY_TEXT_UTILITY.test(classes)) {
          hits.push({ path, classes });
        }
      }
    }
    return hits;
  }

  it("꽉 찬 bg-status-success는 text-status-success-foreground를 함께 쓴다", () => {
    const offenders = classAttrsWithSolidSuccessBg()
      .filter(({ classes }) => !/\btext-status-success-foreground\b/.test(classes))
      .map(({ path, classes }) => `${path}: ${classes}`);
    expect(offenders).toEqual([]);
  });

  it("꽉 찬 bg-status-success 배지에 13px 미만 글자 크기를 쓰지 않는다", () => {
    const offenders = classAttrsWithSolidSuccessBg()
      .filter(({ classes }) => SUB_13PX.test(classes))
      .map(({ path, classes }) => `${path}: ${classes}`);
    expect(offenders).toEqual([]);
  });

  it("고정값(sanity): 실제로 꽉 찬 배지 3곳을 찾았다 (스캔 자체가 빈 집합으로 거짓 통과하지 않는다)", () => {
    // 이 수가 0이면 스캔 정규식이 깨져 위 두 테스트가 항상 통과하는 거짓 그린일 수 있다.
    expect(classAttrsWithSolidSuccessBg().length).toBeGreaterThanOrEqual(3);
  });
});
