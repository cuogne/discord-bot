import { SolarDate } from '@nghiavuive/lunar_date_vi';
import { getVietnamDateParts } from '../../../utils/date.ts';

export function getVietnamLunarDate(instant: Date) {
  const { day, month, year } = getVietnamDateParts(instant);
  return new SolarDate({ day, month, year }).toLunarDate();
}
