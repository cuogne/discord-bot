import { addDays as addDaysFns, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { VIETNAM_TIMEZONE } from '../../../utils/date.ts';

export const FOOTBALL_EMBED_COLOR = 0x0099ff;

export function addDays(date: Date, days: number): Date {
  return addDaysFns(date, days);
}

export function toEspnDate(date: Date): string {
  // yyyyMMdd base on timezone Asia/Ho_Chi_Minh
  return formatInTimeZone(date, VIETNAM_TIMEZONE, 'yyyyMMdd');
}

export function formatKickoff(isoDate: string): { date: string; time: string } {
  const date = parseISO(isoDate);

  return {
    date: formatInTimeZone(date, VIETNAM_TIMEZONE, 'dd-MM-yyyy'),
    time: formatInTimeZone(date, VIETNAM_TIMEZONE, 'HH:mm'),
  };
}

export function formatMatchScore(
  homeTeam: string,
  scoreHome: string,
  scoreAway: string,
  awayTeam: string,
): string {
  const teamMaxLength = 22; // độ dài tối đa tên đội
  const scoreLength = 7;

  const homeShort =
    homeTeam.length > teamMaxLength ? homeTeam.substring(0, teamMaxLength - 2) + '..' : homeTeam;

  const awayShort =
    awayTeam.length > teamMaxLength ? awayTeam.substring(0, teamMaxLength - 2) + '..' : awayTeam;

  const homePadded = homeShort.padEnd(teamMaxLength);

  const rawScore = `${scoreHome} - ${scoreAway}`;
  const score = rawScore
    .padStart(Math.floor((scoreLength + rawScore.length) / 2))
    .padEnd(scoreLength);

  const awayPadded = awayShort.padEnd(teamMaxLength);

  return `\`${homePadded} ${score} ${awayPadded}\``;
}

export function joinWithLimit(lines: string[], maxLength = 1000): string {
  const result: string[] = [];
  let totalLength = 0;

  for (const line of lines) {
    if (totalLength + line.length > maxLength && result.length > 0) break;
    result.push(line);
    totalLength += line.length + 1;
  }

  return result.join('\n');
}
