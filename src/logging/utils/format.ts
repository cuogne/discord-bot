const DEFAULT_MAX_FIELD_LENGTH = 1024;
const VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh';

export function truncate(value: string, maxLength = DEFAULT_MAX_FIELD_LENGTH): string {
  return value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value;
}

export function formatOptionValue(key: string, value: unknown): string {
  if (typeof value === 'string' && /^\d{17,20}$/.test(value) && key.endsWith('.user')) {
    return `<@${value}>`;
  }

  if (typeof value === 'string') return `\`${value}\``;
  return `\`${JSON.stringify(value)}\``;
}

export function formatLogTime(date: Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: VIETNAM_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}
