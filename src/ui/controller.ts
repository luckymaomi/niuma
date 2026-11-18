import { cheerAt, CHEERS } from "../core/cheers";
import {
  cloneSettings,
  computeEarn,
  formatMoney,
  formatPercent,
  normalizeTime,
  phaseLabel,
  validateSettings,
} from "../core/earn";
import { exchangeList } from "../core/exchange";
import { saveSettings } from "../storage/settingsStore";
import { downloadSinglePage } from "./downloadSingle";
import { createAppState } from "./state";
import type { AppState } from "./types";
import { appHtml } from "./view/appView";

export function createController(root: HTMLElement): { state: AppState; render: () => void; destroy: () => void } {
  const state = createAppState();
  let timer: number | undefined;
  let saveTimer: number | undefined;
  let cheerTimer: number | undefined;
  let cheerIndex = Math.floor(Math.random() * CHEERS.length);
  let exportHintTimer: number | undefined;

  function render(): void {
    root.innerHTML = appHtml(state, cheerIndex);
    bindEvents();
    paintLive();
  }

  function bindEvents(): void {
    numberInput("netMonthlyInput", (value) => {
      state.draft.netMonthly = value;
      queueAutoSave();
    });
    numberInput("housingFundInput", (value) => {
      state.draft.housingFund = value;
      queueAutoSave();
    });
    numberInput("yearBonusInput", (value) => {
      state.draft.yearBonus = value;
      queueAutoSave();
    });
    timeInput("startTimeInput", (value) => {
      state.draft.startTime = normalizeTime(value);
      queueAutoSave();
    });
    timeInput("endTimeInput", (value) => {
      state.draft.endTime = normalizeTime(value);
      queueAutoSave();
    });

    root.querySelectorAll<HTMLInputElement>(".day-input").forEach((input) => {
      input.addEventListener("change", () => {
        const day = Number(input.dataset.day);
        if (!Number.isInteger(day) || day < 0 || day > 6) return;
        state.draft.workdays[day] = input.checked;
        input.closest(".day-chip")?.classList.toggle("is-on", input.checked);
        queueAutoSave();
      });
    });

    const downloadBtn = byId("downloadSingleBtn");
    if (downloadBtn instanceof HTMLButtonElement) {
      downloadBtn.addEventListener("click", () => {
        void onDownloadSingle(downloadBtn);
      });
    }
  }

  async function onDownloadSingle(btn: HTMLButtonElement): Promise<void> {
    btn.disabled = true;
    try {
      const result = await downloadSinglePage();
      showExportHint(result.message, result.ok);
    } finally {
      btn.disabled = false;
    }
  }

  function showExportHint(message: string, ok: boolean): void {
    const el = byId("exportHint");
    if (!(el instanceof HTMLElement)) return;
    el.hidden = false;
    el.textContent = message;
    el.classList.toggle("is-ok", ok);
    el.classList.toggle("is-bad", !ok);
    if (exportHintTimer !== undefined) window.clearTimeout(exportHintTimer);
    exportHintTimer = window.setTimeout(() => {
      el.hidden = true;
    }, 3200);
  }

  function paintCheer(): void {
    setText("cheerLine", cheerAt(cheerIndex));
  }

  function rotateCheer(): void {
    cheerIndex = (cheerIndex + 1) % CHEERS.length;
    paintCheer();
  }

  function queueAutoSave(): void {
    if (saveTimer !== undefined) window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      applyAutoSave();
    }, 280);
  }

  function applyAutoSave(): void {
    const draft = {
      ...state.draft,
      startTime: normalizeTime(state.draft.startTime),
      endTime: normalizeTime(state.draft.endTime),
    };
    const result = validateSettings(draft);
    if (!result.settings) {
      state.saveOk = false;
      state.saveMessage = result.message;
      paintSaveMessage();
      return;
    }

    try {
      saveSettings(result.settings);
      state.settings = cloneSettings(result.settings);
      state.draft = cloneSettings(result.settings);
      state.saveOk = true;
      state.saveMessage = "已自动保存";
      paintSaveMessage();
      paintLive();
    } catch (error) {
      state.saveOk = false;
      state.saveMessage = error instanceof Error ? error.message : "保存失败";
      paintSaveMessage();
    }
  }

  function paintSaveMessage(): void {
    const el = byId("saveMessage");
    if (!(el instanceof HTMLElement)) return;
    el.hidden = !state.saveMessage;
    el.textContent = state.saveMessage;
    el.classList.toggle("is-ok", state.saveOk);
    el.classList.toggle("is-bad", !state.saveOk);
  }

  function paintExchange(earned: number): void {
    const rows = exchangeList(earned);
    for (const row of rows) {
      const card = root.querySelector<HTMLElement>(`[data-exchange-id="${row.item.id}"]`);
      if (!card) continue;
      const count = card.querySelector<HTMLElement>('[data-role="count"]');
      const next = card.querySelector<HTMLElement>('[data-role="next"]');
      const fill = card.querySelector<HTMLElement>('[data-role="fill"]');
      const track = card.querySelector(".exchange-track");
      if (count) count.textContent = `当前 ${row.ratio.toFixed(2)} ${row.item.unit}`;
      if (next) next.textContent = `下一${row.item.unit} ${formatPercent(row.progress)}`;
      if (fill) fill.style.width = `${(row.progress * 100).toFixed(2)}%`;
      if (track instanceof HTMLElement) {
        track.setAttribute("aria-valuenow", String(Math.round(row.progress * 100)));
      }
    }
  }

  function paintLive(): void {
    state.snapshot = computeEarn(state.settings);
    const snapshot = state.snapshot;
    const progressPct = Math.max(0, Math.min(100, snapshot.progress * 100));

    setText("todayEarned", formatMoney(snapshot.todayEarned, 4));
    setText("perMinute", `¥ ${formatMoney(snapshot.perMinute, 4)}`);
    setText("perHour", `¥ ${formatMoney(snapshot.perHour, 2)}`);
    setText("dailyExpected", `¥ ${formatMoney(snapshot.dailyExpected, 2)}`);
    setText("progressText", formatPercent(snapshot.progress));
    setText("phasePill", phaseLabel(snapshot.phase));
    const ordinalNote =
      snapshot.todayWorkdayOrdinal === null
        ? "今天不上班"
        : `今天是本月第 ${snapshot.todayWorkdayOrdinal} 个上班日`;
    setText(
      "progressNote",
      `${state.settings.startTime} – ${state.settings.endTime} · ${ordinalNote}`,
    );

    const bar = byId("progressBar");
    if (bar) bar.style.width = `${progressPct.toFixed(2)}%`;

    const track = root.querySelector(".progress-track");
    if (track instanceof HTMLElement) {
      track.setAttribute("aria-valuenow", String(Math.round(progressPct)));
    }

    paintExchange(snapshot.todayEarned);
    paintCheer();
  }

  function numberInput(id: string, onChange: (value: number) => void): void {
    const el = byId(id);
    if (!(el instanceof HTMLInputElement)) return;
    el.addEventListener("input", () => {
      if (el.value.trim() === "") return;
      const value = Number(el.value);
      if (!Number.isFinite(value)) return;
      onChange(value);
    });
  }

  function timeInput(id: string, onChange: (value: string) => void): void {
    const el = byId(id);
    if (!(el instanceof HTMLInputElement)) return;
    el.addEventListener("input", () => {
      onChange(el.value);
    });
    el.addEventListener("change", () => {
      onChange(el.value);
    });
  }

  function byId(id: string): HTMLElement | null {
    return root.querySelector(`#${CSS.escape(id)}`);
  }

  function setText(id: string, text: string): void {
    const el = byId(id);
    if (el) el.textContent = text;
  }

  timer = window.setInterval(() => {
    paintLive();
  }, 250);
  cheerTimer = window.setInterval(() => {
    rotateCheer();
  }, 8000);
  render();

  return {
    state,
    render,
    destroy() {
      if (timer !== undefined) window.clearInterval(timer);
      if (saveTimer !== undefined) window.clearTimeout(saveTimer);
      if (cheerTimer !== undefined) window.clearInterval(cheerTimer);
      if (exportHintTimer !== undefined) window.clearTimeout(exportHintTimer);
    },
  };
}
