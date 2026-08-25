const TIMEZONE = 'Asia/Ho_Chi_Minh';

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
