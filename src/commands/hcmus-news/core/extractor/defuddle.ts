import { load } from 'cheerio';
import { Defuddle } from 'defuddle/node';
import { parseHTML } from 'linkedom';
import { cleanText, truncate } from './clean.ts';

export async function extractWithDefuddle(html: string, url: string): Promise<string> {
  const { document } = parseHTML(html);
  const result = await Defuddle(document as unknown as Parameters<typeof Defuddle>[0], url, {
    // useAsync: false (that flag only disables third-party async extractors).
    useAsync: false,
  });

  if (!result?.content) {
    return '';
  }

  // clean text from the HTML returned by Defuddle before sending it to Gemini
  const text = cleanText(load(result.content).text());
  return truncate(text);
}
