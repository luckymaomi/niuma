import { describe, expect, it } from "vitest";
import { cheerAt, CHEERS } from "../src/core/cheers";

describe("cheers", () => {
  it("returns stable lines by index", () => {
    expect(cheerAt(0)).toBe(CHEERS[0]);
    expect(cheerAt(CHEERS.length)).toBe(CHEERS[0]);
    expect(cheerAt(-1)).toBe(CHEERS[CHEERS.length - 1]);
  });

  it("includes the main encouragement line", () => {
    expect(CHEERS).toContain("加油，琨哥，你是最棒的");
  });

  it("every cheer contains 琨哥", () => {
    for (const line of CHEERS) {
      expect(line.includes("琨哥")).toBe(true);
    }
  });
});
