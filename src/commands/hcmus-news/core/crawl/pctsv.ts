import { fetchWithTimeout } from '../../../../utils/http.ts';
import { USER_AGENT } from '../../resources/links.ts';
import type { NewsCategory, RawNewsItem } from '../../types/types.ts';

export async function crawlPctsvNews(url: string, category: NewsCategory): Promise<RawNewsItem[]> {
  const response = await fetchWithTimeout(url, {
    headers: {
      'User-Agent': USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const payload: unknown = await response.json();
  if (
    typeof payload !== 'object' ||
    payload === null ||
    !('data' in payload) ||
    !Array.isArray(payload.data)
  ) {
    throw new Error('Invalid CTSV news response');
  }

  const result: RawNewsItem[] = [];
  for (const item of payload.data.slice(0, 10) as unknown[]) {
    if (typeof item !== 'object' || item === null) {
      continue;
    }

    const title = 'title' in item && typeof item.title === 'string' ? item.title.trim() : '';
    const slug = 'slug' in item && typeof item.slug === 'string' ? item.slug.trim() : '';
    if (!title || !slug) {
      continue;
    }

    result.push({
      category,
      title,
      url: new URL(`/news/${encodeURIComponent(slug)}`, url).toString(),
    });
  }

  return result;
}
