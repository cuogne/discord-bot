const VN_TIMEZONE = 'Asia/Ho_Chi_Minh';

export const FOOTBALL_EMBED_COLOR = 0x0099ff;

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function toEspnDate(date: Date): string {
  // yyyyMMdd base on timezone Asia/Ho_Chi_Minh
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: VN_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(date)
    .replaceAll('-', '');
}

export function getVietnamDateParts(date: Date = new Date()): {
  dateStr: string;
  year: number;
  month: number;
  day: number;
} {
  const formatted = new Intl.DateTimeFormat('en-CA', {
    timeZone: VN_TIMEZONE,
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

export function formatKickoff(isoDate: string): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat('vi-VN', {
    timeZone: VN_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date(isoDate));

  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';

  return {
    date: `${get('day')}-${get('month')}-${get('year')}`,
    time: `${get('hour')}:${get('minute')}`,
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
