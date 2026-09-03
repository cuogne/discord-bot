import { isValid, parse } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { getTodayInVietnam, VIETNAM_TIMEZONE } from '../../../utils/date.ts';

export function getToday(): string {
  const { day, month, year } = getTodayInVietnam();
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
}

export function formatDayVN(date: string): string {
  const parsedDate = parse(date, 'MM/dd/yyyy', new Date());
  if (!isValid(parsedDate)) {
    return date;
  }

  return formatInTimeZone(parsedDate, VIETNAM_TIMEZONE, 'dd/MM/yyyy');
}

export function getCurrentTime(): string {
  return formatInTimeZone(new Date(), VIETNAM_TIMEZONE, 'HH:mm');
}
