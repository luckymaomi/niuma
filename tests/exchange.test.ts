import { describe, expect, it } from "vitest";
import { exchangeProgress } from "../src/core/exchange";

describe("exchangeProgress", () => {
  it("splits whole items and next-item progress", () => {
    const row = exchangeProgress(37.5, { id: "luckin", name: "瑞幸咖啡", unit: "杯", price: 15 });
    expect(row.whole).toBe(2);
    expect(row.progress).toBeCloseTo(0.5, 6);
    expect(row.ratio).toBeCloseTo(2.5, 6);
  });

  it("stays at zero when nothing earned", () => {
    const row = exchangeProgress(0, { id: "kfc", name: "肯德基鸡腿堡", unit: "个", price: 18.5 });
    expect(row.whole).toBe(0);
    expect(row.progress).toBe(0);
  });
});
