import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

export async function getContentFromURL(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    const dom = new JSDOM(html, {
      url,
    });

    const reader = new Readability(dom.window.document);

    const article = reader.parse();

    if (!article || !article.textContent) {
      return '';
    }

    let content = article.textContent.trim();

    // const MAX_CONTENT_LENGTH = 8000;

    // if (content.length > MAX_CONTENT_LENGTH) {
    //   content = content.slice(0, MAX_CONTENT_LENGTH);
    // }

    return content;
  } catch (err) {
    console.error(`Error extracting content from ${url}:`, err);

    return '';
  }
}