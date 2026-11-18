import { cloneSettings, DEFAULT_SETTINGS, validateSettings } from "../core/earn";
import type { SalarySettings } from "../core/types";

const STORAGE_KEY = "niuma.settings.v1";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function loadSettings(storage: StorageLike = window.localStorage): SalarySettings {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return cloneSettings(DEFAULT_SETTINGS);

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isPlainObject(parsed)) return cloneSettings(DEFAULT_SETTINGS);
    const result = validateSettings({
      netMonthly: parsed.netMonthly as number,
      housingFund: parsed.housingFund as number,
      yearBonus: parsed.yearBonus as number,
      workdays: parsed.workdays as boolean[],
      startTime: parsed.startTime as string,
      endTime: parsed.endTime as string,
    });
    return result.settings ? cloneSettings(result.settings) : cloneSettings(DEFAULT_SETTINGS);
  } catch {
    return cloneSettings(DEFAULT_SETTINGS);
  }
}

export function saveSettings(settings: SalarySettings, storage: StorageLike = window.localStorage): void {
  const result = validateSettings(settings);
  if (!result.settings) {
    throw new Error(result.message);
  }
  storage.setItem(STORAGE_KEY, JSON.stringify(result.settings));
}
