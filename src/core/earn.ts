import type { EarnSnapshot, SalarySettings, SettingsValidation, WorkPhase } from "./types";

export const DEFAULT_SETTINGS: SalarySettings = {
  netMonthly: 2600,
  housingFund: 1000,
  yearBonus: 10000,
  workdays: [true, true, true, true, true, false, false],
  startTime: "08:45",
  endTime: "16:45",
};

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/;

export function normalizeTime(value: string): string {
  const match = TIME_RE.exec(value.trim());
  if (!match) return value.trim();
  return `${match[1]}:${match[2]}`;
}

export function parseTimeToMinutes(value: string): number | null {
  const normalized = normalizeTime(value);
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(normalized);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function cloneSettings(settings: SalarySettings): SalarySettings {
  const workdays = settings.workdays.slice(0, 7).map(Boolean);
  while (workdays.length < 7) workdays.push(false);
  return {
    netMonthly: settings.netMonthly,
    housingFund: settings.housingFund,
    yearBonus: settings.yearBonus,
    workdays,
    startTime: settings.startTime,
    endTime: settings.endTime,
  };
}

export function monthlyPool(settings: SalarySettings): number {
  return Math.max(0, settings.netMonthly) + Math.max(0, settings.housingFund) + Math.max(0, settings.yearBonus) / 12;
}

export function jsWeekdayToIndex(jsDay: number): number {
  return (jsDay + 6) % 7;
}

export function isWorkday(settings: SalarySettings, date: Date): boolean {
  const index = jsWeekdayToIndex(date.getDay());
  return Boolean(settings.workdays[index]);
}

export function countWorkdaysInMonth(settings: SalarySettings, year: number, monthIndex: number): number {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  let count = 0;
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, monthIndex, day);
    if (isWorkday(settings, date)) count += 1;
  }
  return count;
}

/** 若当天是上班日，返回「本月第几个」；否则返回 null。 */
export function todayWorkdayOrdinal(settings: SalarySettings, now: Date): number | null {
  if (!isWorkday(settings, now)) return null;
  const year = now.getFullYear();
  const monthIndex = now.getMonth();
  const today = now.getDate();
  let count = 0;
  for (let day = 1; day <= today; day += 1) {
    const date = new Date(year, monthIndex, day);
    if (isWorkday(settings, date)) count += 1;
  }
  return count;
}

export function workdayOrdinalNote(settings: SalarySettings, now: Date): string {
  const ordinal = todayWorkdayOrdinal(settings, now);
  if (ordinal === null) return "今天不上班";
  return `今天是本月第 ${ordinal} 个上班日`;
}

export function workSecondsPerDay(settings: SalarySettings): number {
  const start = parseTimeToMinutes(settings.startTime);
  const end = parseTimeToMinutes(settings.endTime);
  if (start === null || end === null || end <= start) return 0;
  return (end - start) * 60;
}

export function validateSettings(input: Partial<SalarySettings>): SettingsValidation {
  const netMonthly = Number(input.netMonthly);
  const housingFund = Number(input.housingFund);
  const yearBonus = Number(input.yearBonus);
  const startTime = normalizeTime(String(input.startTime ?? ""));
  const endTime = normalizeTime(String(input.endTime ?? ""));
  const workdays = Array.isArray(input.workdays)
    ? input.workdays.slice(0, 7).map(Boolean)
    : DEFAULT_SETTINGS.workdays.slice();

  while (workdays.length < 7) workdays.push(false);

  if (!Number.isFinite(netMonthly) || netMonthly < 0) {
    return { ok: false, message: "到手月薪须为不小于 0 的数字", settings: null };
  }
  if (!Number.isFinite(housingFund) || housingFund < 0) {
    return { ok: false, message: "公积金总额须为不小于 0 的数字", settings: null };
  }
  if (!Number.isFinite(yearBonus) || yearBonus < 0) {
    return { ok: false, message: "年终奖须为不小于 0 的数字", settings: null };
  }
  if (parseTimeToMinutes(startTime) === null || parseTimeToMinutes(endTime) === null) {
    return { ok: false, message: "上下班时间格式为 HH:MM", settings: null };
  }

  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  if (start === null || end === null || end <= start) {
    return { ok: false, message: "下班时间须晚于上班时间", settings: null };
  }
  if (!workdays.some(Boolean)) {
    return { ok: false, message: "至少选择一天上班", settings: null };
  }

  return {
    ok: true,
    message: "已自动保存",
    settings: {
      netMonthly,
      housingFund,
      yearBonus,
      workdays,
      startTime,
      endTime,
    },
  };
}

export function earnedSecondsAt(settings: SalarySettings, now: Date): { phase: WorkPhase; earnedSeconds: number; workSeconds: number } {
  const workSeconds = workSecondsPerDay(settings);
  if (workSeconds <= 0) {
    return { phase: "offday", earnedSeconds: 0, workSeconds: 0 };
  }
  if (!isWorkday(settings, now)) {
    return { phase: "offday", earnedSeconds: 0, workSeconds };
  }

  const startMinutes = parseTimeToMinutes(settings.startTime);
  const endMinutes = parseTimeToMinutes(settings.endTime);
  if (startMinutes === null || endMinutes === null) {
    return { phase: "offday", earnedSeconds: 0, workSeconds: 0 };
  }

  const nowMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60 + now.getMilliseconds() / 60000;
  if (nowMinutes < startMinutes) {
    return { phase: "before", earnedSeconds: 0, workSeconds };
  }
  if (nowMinutes >= endMinutes) {
    return { phase: "after", earnedSeconds: workSeconds, workSeconds };
  }

  const earnedSeconds = (nowMinutes - startMinutes) * 60;
  return { phase: "working", earnedSeconds, workSeconds };
}

export function computeEarn(settings: SalarySettings, now: Date = new Date()): EarnSnapshot {
  const pool = monthlyPool(settings);
  const workdaysInMonth = countWorkdaysInMonth(settings, now.getFullYear(), now.getMonth());
  const dailyExpected = workdaysInMonth > 0 ? pool / workdaysInMonth : 0;
  const { phase, earnedSeconds, workSeconds } = earnedSecondsAt(settings, now);
  const perSecond = workSeconds > 0 ? dailyExpected / workSeconds : 0;
  const todayEarned = perSecond * earnedSeconds;
  const progress = workSeconds > 0 ? earnedSeconds / workSeconds : 0;
  const todayOrdinal = todayWorkdayOrdinal(settings, now);

  return {
    monthlyPool: pool,
    workdaysInMonth,
    todayWorkdayOrdinal: todayOrdinal,
    dailyExpected,
    workSeconds,
    earnedSeconds,
    perSecond,
    perMinute: perSecond * 60,
    perHour: perSecond * 3600,
    todayEarned,
    progress,
    phase,
  };
}

export function phaseLabel(phase: WorkPhase): string {
  switch (phase) {
    case "working":
      return "上班中";
    case "before":
      return "未到上班时间";
    case "after":
      return "已下班";
    default:
      return "今天不上班";
  }
}

export function formatMoney(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "0.00";
  return value.toLocaleString("zh-CN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatPercent(value: number): string {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return `${pct.toFixed(1)}%`;
}
