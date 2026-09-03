import { logger } from '../../../logging/logger.ts';
import { NEWS_SOURCES } from '../resources/links.ts';
import type { NewsSource, RawNewsItem } from '../types/types.ts';
import { crawlJsonNews } from './crawl/json.ts';
import { crawlRssNews } from './crawl/rss.ts';

export async function crawlSource(source: NewsSource): Promise<RawNewsItem[]> {
  if (source.type === 'rss') {
    return crawlRssNews(source.url, source.category);
  } else if (source.type === 'json') {
    return crawlJsonNews(source.url, source.category);
  }
  throw new Error(`Unknown source type: ${source.type}`);
}

export async function crawlAllSources(): Promise<RawNewsItem[]> {
  const results = await Promise.allSettled(
    NEWS_SOURCES.map((source) =>
      crawlSource(source).catch((err) => {
        logger.warn(
          {
            err,
            source: source.name,
            category: source.category,
            url: source.url,
          },
          'Failed to crawl news source',
        );
        return [] as RawNewsItem[];
      }),
    ),
  );

  const allNews: RawNewsItem[] = [];
  for (const res of results) {
    if (res.status === 'fulfilled') {
      allNews.push(...res.value);
    }
  }

  return allNews;
}
