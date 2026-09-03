/**
 * Normalizes a news URL to ensure consistent comparison and storage.
 * - Forces HTTPS protocol for all HCMUS news links
 * - Trims whitespace
 */
export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed.startsWith('http://')) {
    return trimmed.replace(/^http:\/\//i, 'https://');
  }
  return trimmed;
}
