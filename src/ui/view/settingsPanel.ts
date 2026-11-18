import type { AppState } from "../types";

const WEEKDAY_LABELS = ["一", "二", "三", "四", "五", "六", "日"];

export function settingsPanelHtml(state: AppState): string {
  const { draft, saveMessage, saveOk } = state;
  const dayChecks = WEEKDAY_LABELS.map((label, index) => {
    const checked = draft.workdays[index] ? "checked" : "";
    const active = draft.workdays[index] ? "is-on" : "";
    return `
      <label class="day-chip ${active}">
        <input type="checkbox" class="day-input" data-day="${index}" ${checked} />
        <span>周${label}</span>
      </label>
    `;
  }).join("");

  const messageClass = saveOk ? "save-note is-ok" : "save-note is-bad";
  const messageHidden = saveMessage ? "" : "hidden";

  return `
    <section class="panel settings-panel">
      <div class="settings-header">
        <h2 class="section-title">设置</h2>
        <p class="${messageClass}" id="saveMessage" ${messageHidden}>${saveMessage}</p>
      </div>

      <div class="field-grid money-grid">
        <label class="field">
          <span class="field-label">到手月薪</span>
          <input id="netMonthlyInput" class="form-control" type="number" min="0" step="0.01" value="${draft.netMonthly}" />
          <span class="field-hint">税后实发</span>
        </label>
        <label class="field">
          <span class="field-label">公积金总额</span>
          <input id="housingFundInput" class="form-control" type="number" min="0" step="0.01" value="${draft.housingFund}" />
          <span class="field-hint">个人 + 公司合计</span>
        </label>
        <label class="field">
          <span class="field-label">年终奖</span>
          <input id="yearBonusInput" class="form-control" type="number" min="0" step="0.01" value="${draft.yearBonus}" />
          <span class="field-hint">按 12 个月摊进每月</span>
        </label>
      </div>

      <div class="field">
        <span class="field-label">每周上班</span>
        <div class="day-row">${dayChecks}</div>
        <span class="field-hint">只勾选的星期会累计；今天不在其中时金额为 0</span>
      </div>

      <div class="field-grid time-grid">
        <label class="field">
          <span class="field-label">上班时间</span>
          <input id="startTimeInput" class="form-control" type="time" value="${draft.startTime}" />
          <span class="field-hint">&nbsp;</span>
        </label>
        <label class="field">
          <span class="field-label">下班时间</span>
          <input id="endTimeInput" class="form-control" type="time" value="${draft.endTime}" />
          <span class="field-hint">&nbsp;</span>
        </label>
      </div>
    </section>
  `;
}
