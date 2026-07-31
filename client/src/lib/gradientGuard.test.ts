import { describe, expect, it } from "vitest";

/**
 * 공유 UI(@shakilabs/ui)는 플랫 디자인을 강제하려고 아래 규칙을 갖고 있다.
 *   .design-system-shell :is([class*=gradient], .summary-card, .hero-field) { background-image: none !important }
 * AppLayout이 design-system-shell을 쓰므로, 앱에서 Tailwind 그라디언트 유틸
 * (bg-gradient-to-*, from-*, via-*, to-*)을 쓰면 background-image가 통째로 죽는다.
 * 배경색이 사라진 자리에 흰 글자만 남아 "흰 배경에 흰 글자"가 되는 사고가 실제로 났다.
 * (2026-07-31: /lease-vs-loan · /parking · /ev-vs-gas · /maintenance 히어로)
 * 배경이 필요하면 그라디언트가 아니라 background-color(bg-primary 등)를 써야 한다.
 */

const sources = import.meta.glob("../**/*.{vue,ts}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

// 변형 접두사(sm:, dark: …)까지 감안한 Tailwind 그라디언트 유틸 판별
const GRADIENT_UTILITY = /^(?:[a-z-]+:)*(?:bg-gradient-to-[a-z]+|(?:from|via|to)-[a-z[])/;

describe("shared shell gradient guard", () => {
  it("Tailwind 그라디언트 유틸을 쓰지 않는다 (공유 UI가 background-image를 죽인다)", () => {
    const offenders: string[] = [];

    for (const [path, source] of Object.entries(sources)) {
      if (path.endsWith(".test.ts")) continue;
      // class 속성 안에서만 검사한다 — 주석·산문의 "gradient" 언급은 무해하다.
      for (const match of source.matchAll(/\bclass(?:Name)?="([^"]*)"/g)) {
        const bad = match[1]
          .split(/\s+/)
          .filter((cls: string) => GRADIENT_UTILITY.test(cls));
        if (bad.length > 0) offenders.push(`${path}: ${bad.join(" ")}`);
      }
    }

    expect(offenders).toEqual([]);
  });
});
