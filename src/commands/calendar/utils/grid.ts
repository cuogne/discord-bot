const CELL_WIDTH = 4;
const UNDERLINE = '\u0332';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function underlineText(text: string): string {
  return [...text].map((char) => char + UNDERLINE).join('');
}

function getDaysInMonth(month: number, year: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function getFirstWeekday(month: number, year: number): number {
  return (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
}

export function buildCalendarGrid(month: number, year: number, today: number): string {
  const header = WEEKDAYS.map((day) => day.padEnd(CELL_WIDTH)).join('').trimEnd();

  const firstWeekday = getFirstWeekday(month, year);
  const daysInMonth = getDaysInMonth(month, year);

  const rows: string[] = [];
  let row = ' '.repeat(firstWeekday * CELL_WIDTH);

  for (let day = 1; day <= daysInMonth; day++) {
    const label = String(day);
    const cell = day === today ? underlineText(label) : label;
    row += cell + ' '.repeat(CELL_WIDTH - label.length);

    if ((firstWeekday + day) % 7 === 0 || day === daysInMonth) {
      rows.push(row.trimEnd());
      row = '';
    }
  }

  return [header, ...rows].join('\n');
}
