import type { AppState } from "../types";
import { exchangePanelHtml } from "./exchangePanel";
import { livePanelHtml } from "./livePanel";
import { settingsPanelHtml } from "./settingsPanel";

export function appHtml(state: AppState, cheerIndex = 0): string {
  return `
    <main class="app-shell">
      ${livePanelHtml(state, cheerIndex)}
      ${exchangePanelHtml(state.snapshot.todayEarned)}
      ${settingsPanelHtml(state)}
    </main>
  `;
}
