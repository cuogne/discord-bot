const DEFAULT_MAX_FIELD_LENGTH = 1024;

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
