import { describe, expect, it } from "vitest";
import { positiveBarWidth } from "./chartMath";

describe("chartMath", () => {
  it("uses an honest zero baseline", () => {
    expect(positiveBarWidth(0, 100)).toBe(0);
    expect(positiveBarWidth(25, 100)).toBe(25);
    expect(positiveBarWidth(200, 100)).toBe(100);
  });

});
