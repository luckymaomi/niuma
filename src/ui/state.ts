import { cloneSettings, computeEarn } from "../core/earn";
import { loadSettings } from "../storage/settingsStore";
import type { AppState } from "./types";

export function createAppState(now: Date = new Date()): AppState {
  const settings = loadSettings();
  return {
    settings,
    draft: cloneSettings(settings),
    snapshot: computeEarn(settings, now),
    saveMessage: "",
    saveOk: true,
  };
}
