import { logger } from '../../../../logging/logger.ts';
import { fetchWithTimeout } from '../../../../utils/http.ts';
import { USER_AGENT } from '../../resources/links.ts';
import { extractWithDefuddle } from './defuddle.ts';
import { extractWithSiteSelectors } from './site.ts';

export async function extractArticleContent(url: string): Promise<string> {
  try {
    const response = await fetchWithTimeout(url, {
      headers: {
        'User-Agent': USER_AGENT,
      },
    });

    if (!response.ok) {
      return '';
    }

    const html = await response.text();
    if (!html) {
      return '';
    }

    const hostname = new URL(url).hostname;

    // fast path for known sites
    const fast = extractWithSiteSelectors(html, hostname);
    if (fast) {
      return fast;
    }

    // if not, fallback to defuddle + linkedom for auto-detection
    // when the website layout changes
    return await extractWithDefuddle(html, url);
  } catch (err) {
    logger.warn(
      {
        err,
        url,
      },
      'Failed to extract article content from URL',
    );
    return '';
  }
}
