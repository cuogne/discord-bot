import { formatInTimeZone } from 'date-fns-tz';
import { VIETNAM_TIMEZONE } from '../../../utils/date.ts';

export function getToday(): string {
  return formatInTimeZone(new Date(), VIETNAM_TIMEZONE, 'yyyy-MM-dd');
}
