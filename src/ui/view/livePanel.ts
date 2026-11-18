import { BRAND_LOGO_URL } from "../../brand";
import { cheerAt } from "../../core/cheers";
import { formatMoney, formatPercent, phaseLabel } from "../../core/earn";
import type { AppState } from "../types";

export function livePanelHtml(state: AppState, cheerIndex = 0): string {
  const { snapshot, settings } = state;
  const progressPct = Math.max(0, Math.min(100, snapshot.progress * 100));
  const progressWidth = `${progressPct.toFixed(2)}%`;
  const ordinalNote =
    snapshot.todayWorkdayOrdinal === null
      ? "今天不上班"
      : `今天是本月第 ${snapshot.todayWorkdayOrdinal} 个上班日`;
  return `
    <section class="panel live-panel">
      <div class="live-header">
        <div class="brand-row">
          <img class="brand-logo" src="${BRAND_LOGO_URL}" alt="货航标识" />
        </div>
        <div class="live-actions">
          <button type="button" class="export-btn" id="downloadSingleBtn">下载单页</button>
          <span class="phase-pill" id="phasePill">${phaseLabel(snapshot.phase)}</span>
        </div>
      </div>
      <p class="export-hint" id="exportHint" hidden></p>

      <div class="earn-block">
        <div class="earn-label">今天已经挣了</div>
        <div class="earn-value-wrap">
          <span class="earn-currency">¥</span>
          <span id="todayEarned" class="earn-digits mono">${formatMoney(snapshot.todayEarned, 4)}</span>
        </div>
        <p class="cheer-line" id="cheerLine">${cheerAt(cheerIndex)}</p>
      </div>

      <div class="rate-grid">
        <div class="rate-item rate-a">
          <div class="rate-label">每分钟</div>
          <div id="perMinute" class="rate-value mono">¥ ${formatMoney(snapshot.perMinute, 4)}</div>
        </div>
        <div class="rate-item rate-b">
          <div class="rate-label">每小时</div>
          <div id="perHour" class="rate-value mono">¥ ${formatMoney(snapshot.perHour, 2)}</div>
        </div>
        <div class="rate-item rate-c">
          <div class="rate-label">上班日预计</div>
          <div id="dailyExpected" class="rate-value mono">¥ ${formatMoney(snapshot.dailyExpected, 2)}</div>
        </div>
      </div>

      <div class="progress-block">
        <div class="progress-meta">
          <span>今日进度</span>
          <span id="progressText" class="mono">${formatPercent(snapshot.progress)}</span>
        </div>
        <div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(progressPct)}">
          <div id="progressBar" class="progress-fill" style="width: ${progressWidth}">
            <span class="progress-sheen"></span>
          </div>
        </div>
        <div class="progress-note" id="progressNote">${settings.startTime} – ${settings.endTime} · ${ordinalNote}</div>
      </div>
    </section>
  `;
}
