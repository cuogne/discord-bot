import { fetchWithTimeout } from '../../../../utils/http.ts';
import { VIETNAM_OFFSET_TZ } from '../../../../utils/date.ts';
import { USER_AGENT } from '../../resources/links.ts';
import type { NewsCategory, RawNewsItem } from '../../types/types.ts';
import { normalizeUrl } from '../../utils/url.ts';

interface WpPostItem {
  title?: {
    rendered?: string;
  };
  link?: string;
  date_gmt?: string;
}

export async function crawlJsonNews(url: string, category: NewsCategory): Promise<RawNewsItem[]> {
  const response = await fetchWithTimeout(url, {
    headers: {
      'User-Agent': USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const posts = (await response.json()) as unknown;
  if (!Array.isArray(posts)) {
    return [];
  }

  const result: RawNewsItem[] = [];
  const topPosts = (posts as WpPostItem[]).slice(0, 10);

  for (const post of topPosts) {
    const title = post.title?.rendered?.trim();
    const link = post.link?.trim();
    const publishedAt = post.date_gmt ? new Date(`${post.date_gmt}Z`) : null;

    if (title && link) {
      result.push({
        category,
        title,
        url: normalizeUrl(link),
        ...(publishedAt && !Number.isNaN(publishedAt.getTime())
          ? { publishedAt: new Date(publishedAt.getTime() + VIETNAM_OFFSET_TZ) }
          : {}),
      });
    }
  }

  return result;
}
