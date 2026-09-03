import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { logger } from '../../../logging/logger.ts';
import { fetchWithTimeout } from '../../../utils/http.ts';
import { USER_AGENT } from '../resources/links.ts';

const MAX_CONTENT_LENGTH = 10_000;

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
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article || !article.textContent) {
      return '';
    }

    const content = article.textContent.trim();
    if (content.length > MAX_CONTENT_LENGTH) {
      return content.slice(0, MAX_CONTENT_LENGTH);
    }

    return content;
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
