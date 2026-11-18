/** workdays[0]=周一 ... workdays[6]=周日 */
export interface SalarySettings {
  netMonthly: number;
  housingFund: number;
  yearBonus: number;
  workdays: boolean[];
  startTime: string;
  endTime: string;
}

export type WorkPhase = "offday" | "before" | "working" | "after";

export interface EarnSnapshot {
  monthlyPool: number;
  workdaysInMonth: number;
  /** 今天是本月第几个上班日；今天不上班则为 null */
  todayWorkdayOrdinal: number | null;
  dailyExpected: number;
  workSeconds: number;
  earnedSeconds: number;
  perSecond: number;
  perMinute: number;
  perHour: number;
  todayEarned: number;
  progress: number;
  phase: WorkPhase;
}

export interface SettingsValidation {
  ok: boolean;
  message: string;
  settings: SalarySettings | null;
}
