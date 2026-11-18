import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "../src/core/earn";
import { loadSettings, saveSettings, type StorageLike } from "../src/storage/settingsStore";

function memoryStorage(seed: Record<string, string> = {}): StorageLike {
  const map = new Map(Object.entries(seed));
  return {
    getItem(key) {
      return map.has(key) ? map.get(key)! : null;
    },
    setItem(key, value) {
      map.set(key, value);
    },
    removeItem(key) {
      map.delete(key);
    },
  };
}

describe("settingsStore", () => {
  it("returns defaults when empty", () => {
    const loaded = loadSettings(memoryStorage());
    expect(loaded.netMonthly).toBe(DEFAULT_SETTINGS.netMonthly);
    expect(loaded.housingFund).toBe(DEFAULT_SETTINGS.housingFund);
  });

  it("round-trips saved settings", () => {
    const storage = memoryStorage();
    const next = {
      ...DEFAULT_SETTINGS,
      netMonthly: 8000,
      housingFund: 2400,
      yearBonus: 16000,
      workdays: [true, true, true, true, false, false, false],
      startTime: "09:30",
      endTime: "18:30",
    };
    saveSettings(next, storage);
    const loaded = loadSettings(storage);
    expect(loaded).toEqual(next);
  });
});
