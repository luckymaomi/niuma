import type { EarnSnapshot, SalarySettings } from "../core/types";

export interface AppState {
  settings: SalarySettings;
  draft: SalarySettings;
  snapshot: EarnSnapshot;
  saveMessage: string;
  saveOk: boolean;
}
