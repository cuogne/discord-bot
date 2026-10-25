import { fetchWithTimeout } from '../../../../utils/http.ts';
import { load } from 'cheerio';
import { USER_AGENT } from '../../resources/links.ts';
import type { NewsCategory, RawNewsItem } from '../../types/types.ts';
import { cleanText, truncate } from '../extractor/clean.ts';

export function extractPctsvContent(html: string): string {
  const $ = load(html);
  $('script, style').remove();
  $('p, li, br, h1, h2, h3, h4, tr, td').append(' ');
  return truncate(cleanText($('body').text()));
}

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
    const html = 'content' in item && typeof item.content === 'string' ? item.content : '';
    if (!title || !slug) {
      continue;
    }

    result.push({
      category,
      title,
      url: new URL(`/news/${encodeURIComponent(slug)}`, url).toString(),
      content: html ? extractPctsvContent(html) : undefined,
    });
  }

  return result;
}
