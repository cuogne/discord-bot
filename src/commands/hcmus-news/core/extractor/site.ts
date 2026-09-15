import { load } from 'cheerio';
import { MIN_FAST_PATH_LENGTH } from './const.ts';
import { resolveSelectors } from './selectors.ts';
import { cleanText, truncate } from './clean.ts';

/** Fast path: cheerio + fixed selectors — fast, lightweight, accurate for known sites. */
export function extractWithSiteSelectors(html: string, hostname: string): string {
  const selectors = resolveSelectors(hostname);

  const $ = load(html);

  // remove script/style/nav/header/footer from the entire document before extracting text
  $('script, style, nav, header, footer').remove();
  for (const selector of selectors) {
    const el = $(selector).first();
    el.find('script, style, nav, header, footer').remove();
    const text = cleanText(el.text());
    if (text.length >= MIN_FAST_PATH_LENGTH) {
      return truncate(text);
    }
  }
  return '';
}
