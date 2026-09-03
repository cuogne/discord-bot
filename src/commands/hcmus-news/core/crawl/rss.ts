import { parseStringPromise } from 'xml2js';
import { fetchWithTimeout } from '../../../../utils/http.ts';
import { USER_AGENT } from '../../resources/links.ts';
import type { NewsCategory, RawNewsItem } from '../../types/types.ts';
import { normalizeUrl } from '../../utils/url.ts';

interface RssParsedItem {
  title?: string[];
  link?: string[];
}

interface RssParsedChannel {
  item?: RssParsedItem[];
}

interface RssParsedRoot {
  rss?: {
    channel?: RssParsedChannel[];
  };
}

export async function crawlRssNews(url: string, category: NewsCategory): Promise<RawNewsItem[]> {
  const response = await fetchWithTimeout(url, {
    headers: { 'User-Agent': USER_AGENT },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const xmlText = await response.text();
  const parsed = (await parseStringPromise(xmlText)) as RssParsedRoot;

  const channel = parsed.rss?.channel?.[0];
  const items = channel?.item;
  if (!items || !Array.isArray(items)) {
    return [];
  }

  const result: RawNewsItem[] = [];
  const topItems = items.slice(0, 10);

  for (const item of topItems) {
    const title = item.title?.[0]?.trim();
    const link = item.link?.[0]?.trim();

    if (title && link) {
      result.push({
        category,
        title,
        url: normalizeUrl(link),
      });
    }
  }

  return result;
}
