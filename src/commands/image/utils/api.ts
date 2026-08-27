import { fetchWithTimeout } from '../../../utils/http.ts';
import type { ImageApiItem } from '../types/types.ts';

export async function fetchImage(url: string): Promise<string> {
  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    throw new Error(`Image API responded with ${response.status}`);
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error('Unexpected image API response format');
  }

  const item = data[0];
  if (!isImageApiItem(item)) {
    throw new Error('Image API response does not contain an image URL');
  }

  return item.url;
}

function isImageApiItem(value: unknown): value is ImageApiItem {
  return (
    typeof value === 'object' &&
    value !== null &&
    'url' in value &&
    typeof value.url === 'string' &&
    value.url.length > 0
  );
}
