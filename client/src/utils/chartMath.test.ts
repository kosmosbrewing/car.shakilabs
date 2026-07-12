import { describe, expect, it } from "vitest";
import { normalizeSegments, positiveBarWidth } from "./chartMath";

describe("chartMath", () => {
  it("uses an honest zero baseline", () => {
    expect(positiveBarWidth(0, 100)).toBe(0);
    expect(positiveBarWidth(25, 100)).toBe(25);
    expect(positiveBarWidth(200, 100)).toBe(100);
  });

  it("normalizes exact cost compositions", () => {
    expect(normalizeSegments([20, 30, 50])).toEqual([0.2, 0.3, 0.5]);
    expect(normalizeSegments([0, -5])).toEqual([0, 0]);
  });
});
