import { MAX_CONTENT_LENGTH } from './const.ts';

export function cleanText(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim();
}

export function truncate(content: string): string {
  if (content.length > MAX_CONTENT_LENGTH) {
    return content.slice(0, MAX_CONTENT_LENGTH);
  }
  return content;
}
