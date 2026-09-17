import { describe, expect, it } from "vitest";

/**
 * 결과 히어로는 브랜드 서체(GmarketSans)로 렌더돼야 한다.
 *
 * 2026-09-17 라이브 실측: /car/ev-vs-gas의 "더 유리한 쪽" 히어로만 26px Pretendard로
 * 떠 있었다. car에서 히어로 크기(text-display · car-result-amount)를 쓰면서 font-brand를
 * 빠뜨리면 폰트가 조용히 본문 서체로 떨어진다 — 빌드도 타입체크도 잡지 못한다.
 *
 * font-brand는 car에서 (1) 페이지 h1 (2) 결과 히어로 두 곳에만 쓴다. 배지(rounded-full
 * 칩)와 스탯 카드 값(text-h1)은 보조 정보라 의도적으로 본문 서체를 유지한다.
 */

const sources = import.meta.glob("../**/*.vue", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const HERO_SIZE = /\b(?:text-display|car-result-amount)\b/;

describe("result hero font guard", () => {
  it("히어로 크기 + 굵기를 쓰는 금액은 font-brand를 함께 단다", () => {
    const offenders: string[] = [];

    for (const [path, source] of Object.entries(sources)) {
      for (const match of source.matchAll(/\bclass="([^"]*)"/g)) {
        const classes = match[1];
        // font-bold가 없으면 히어로 금액이 아니다(예: 404 표기).
        if (!HERO_SIZE.test(classes) || !/\bfont-bold\b/.test(classes)) continue;
        if (!/\bfont-brand\b/.test(classes)) offenders.push(`${path}: ${classes}`);
      }
    }

    expect(offenders).toEqual([]);
  });
});
