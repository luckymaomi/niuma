import { describe, expect, it } from "vitest";
import {
  computeEarn,
  countWorkdaysInMonth,
  DEFAULT_SETTINGS,
  monthlyPool,
  normalizeTime,
  todayWorkdayOrdinal,
  validateSettings,
  workdayOrdinalNote,
  workSecondsPerDay,
} from "../src/core/earn";
import type { SalarySettings } from "../src/core/types";

function settings(partial: Partial<SalarySettings> = {}): SalarySettings {
  const { workdays, ...rest } = partial;
  return {
    ...DEFAULT_SETTINGS,
    ...rest,
    workdays: (workdays ?? DEFAULT_SETTINGS.workdays).slice(),
  };
}

describe("monthlyPool", () => {
  it("sums net monthly, housing fund and bonus / 12", () => {
    expect(monthlyPool(settings({ netMonthly: 5000, housingFund: 1700, yearBonus: 12000 }))).toBe(7700);
  });
});

describe("countWorkdaysInMonth", () => {
  it("counts selected weekdays in a month", () => {
    const monToFri = settings({
      workdays: [true, true, true, true, true, false, false],
    });
    // 2026-11 has 21 Mon-Fri days
    expect(countWorkdaysInMonth(monToFri, 2026, 10)).toBe(21);
  });
});

describe("workSecondsPerDay", () => {
  it("uses end minus start", () => {
    expect(workSecondsPerDay(settings({ startTime: "09:00", endTime: "18:00" }))).toBe(9 * 3600);
  });
});

describe("validateSettings", () => {
  it("rejects end before start", () => {
    const result = validateSettings(settings({ startTime: "18:00", endTime: "09:00" }));
    expect(result.ok).toBe(false);
  });

  it("accepts valid settings", () => {
    const result = validateSettings(settings());
    expect(result.ok).toBe(true);
    expect(result.settings?.netMonthly).toBe(2600);
  });
});

describe("todayWorkdayOrdinal", () => {
  const monToFri = settings({
    workdays: [true, true, true, true, true, false, false],
  });

  it("counts which workday today is in the month", () => {
    // 2026-11-18 Wednesday → 13th Mon-Fri day
    expect(todayWorkdayOrdinal(monToFri, new Date(2026, 10, 18, 12, 0, 0))).toBe(13);
    expect(workdayOrdinalNote(monToFri, new Date(2026, 10, 18, 12, 0, 0))).toBe(
      "今天是本月第 13 个上班日",
    );
  });

  it("returns null on off days", () => {
    expect(todayWorkdayOrdinal(monToFri, new Date(2026, 10, 21, 12, 0, 0))).toBeNull();
    expect(workdayOrdinalNote(monToFri, new Date(2026, 10, 21, 12, 0, 0))).toBe("今天不上班");
  });
});

describe("computeEarn", () => {
  const base = settings({
    netMonthly: 5000,
    housingFund: 1700,
    yearBonus: 12000,
    workdays: [true, true, true, true, true, false, false],
    startTime: "09:00",
    endTime: "18:00",
  });

  it("is zero before work on a workday", () => {
    const now = new Date(2026, 10, 18, 8, 30, 0);
    const snap = computeEarn(base, now);
    expect(snap.phase).toBe("before");
    expect(snap.todayEarned).toBe(0);
    expect(snap.progress).toBe(0);
    expect(snap.dailyExpected).toBeCloseTo(7700 / 21, 6);
  });

  it("accrues during work hours", () => {
    const now = new Date(2026, 10, 18, 13, 30, 0);
    const snap = computeEarn(base, now);
    expect(snap.phase).toBe("working");
    expect(snap.earnedSeconds).toBe(4.5 * 3600);
    expect(snap.progress).toBeCloseTo(0.5, 6);
    expect(snap.todayEarned).toBeCloseTo(snap.dailyExpected * 0.5, 6);
  });

  it("caps after work hours", () => {
    const now = new Date(2026, 10, 18, 20, 0, 0);
    const snap = computeEarn(base, now);
    expect(snap.phase).toBe("after");
    expect(snap.todayEarned).toBeCloseTo(snap.dailyExpected, 6);
    expect(snap.progress).toBe(1);
  });

  it("stays zero on off days", () => {
    const now = new Date(2026, 10, 21, 12, 0, 0); // Saturday
    const snap = computeEarn(base, now);
    expect(snap.phase).toBe("offday");
    expect(snap.todayEarned).toBe(0);
    expect(snap.progress).toBe(0);
  });

  it("keeps daily expected when only one weekday is selected and today is off", () => {
    const onlyMonday = settings({
      netMonthly: 2600,
      housingFund: 1000,
      yearBonus: 10000,
      workdays: [true, false, false, false, false, false, false],
    });
    const wednesday = new Date(2026, 10, 18, 12, 0, 0);
    const snap = computeEarn(onlyMonday, wednesday);
    expect(snap.phase).toBe("offday");
    expect(snap.todayEarned).toBe(0);
    expect(snap.workdaysInMonth).toBe(5);
    expect(snap.todayWorkdayOrdinal).toBeNull();
    expect(snap.dailyExpected).toBeCloseTo((2600 + 1000 + 10000 / 12) / 5, 6);
    expect(snap.perMinute).toBeGreaterThan(0);
  });
});

describe("normalizeTime", () => {
  it("strips seconds from browser time values", () => {
    expect(normalizeTime("09:00:00")).toBe("09:00");
    expect(normalizeTime("18:30")).toBe("18:30");
  });
});
