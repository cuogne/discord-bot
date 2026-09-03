import type { RawNewsItem } from '../types/types.ts';
import { getExistingNewsUrls } from './database/news.ts';

export async function filterNewNews(items: RawNewsItem[]): Promise<RawNewsItem[]> {
  if (items.length === 0) {
    return [];
  }

  // Deduplicate by URL in current batch
  const uniqueItemsMap = new Map<string, RawNewsItem>();
  for (const item of items) {
    if (!uniqueItemsMap.has(item.url)) {
      uniqueItemsMap.set(item.url, item);
    }
  }

  const uniqueUrls = Array.from(uniqueItemsMap.keys());
  const existingUrls = await getExistingNewsUrls(uniqueUrls);

  const newItems: RawNewsItem[] = [];
  for (const [url, item] of uniqueItemsMap) {
    if (!existingUrls.has(url)) {
      newItems.push(item);
    }
  }

  return newItems;
}
