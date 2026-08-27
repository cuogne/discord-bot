const TIMEZONE = 'Asia/Ho_Chi_Minh';

export interface VietnamDateParts {
  dateStr: string;
  year: number;
  month: number;
  day: number;
}

export function getVietnamDateParts(date: Date = new Date()): VietnamDateParts {
  const formatted = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
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
  const formatted = new Intl.DateTimeFormat('sv-SE', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  const [year, month, day] = formatted.split('-').map(Number);
  return { year: year!, month: month!, day: day! };
}
