import { formatInTimeZone } from 'date-fns-tz';

export const VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh';
export const VIETNAM_OFFSET_TZ = 7 * 60 * 60 * 1000;

export function getVNTimeNow(): Date {
  return new Date(Date.now() + VIETNAM_OFFSET_TZ);
}

export function formatVietnamDateTime(date: Date): string {
  return formatInTimeZone(date, VIETNAM_TIMEZONE, 'dd/MM/yyyy HH:mm:ss');
}

export function formatVNStoredDate(date: Date): string {
  return formatInTimeZone(date, 'UTC', 'dd/MM/yyyy HH:mm:ss');
}

export interface VietnamDateParts {
  dateStr: string;
  year: number;
  month: number;
  day: number;
}

export function getVietnamDateParts(date: Date = new Date()): VietnamDateParts {
  const formatted = formatInTimeZone(date, VIETNAM_TIMEZONE, 'yyyy-MM-dd');
  const [year, month, day] = formatted.split('-').map(Number);
  return {
    dateStr: formatted,
    year: year!,
    month: month!,
    day: day!,
  };
}

export interface VietnamDate {
  year: number;
  month: number;
  day: number;
}

export function getTodayInVietnam(): VietnamDate {
  const formatted = formatInTimeZone(new Date(), VIETNAM_TIMEZONE, 'yyyy-MM-dd');

  const [year, month, day] = formatted.split('-').map(Number);
  return { year: year!, month: month!, day: day! };
}
