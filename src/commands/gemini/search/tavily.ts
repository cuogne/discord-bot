import { logger } from '../../../logging/logger.ts';
import { fetchWithTimeout } from '../../../utils/http.ts';
import {
  TAVILY_MAX_CHARS_PER_RESULT,
  TAVILY_MAX_RESULTS,
  TAVILY_MIN_SCORE,
  TAVILY_SEARCH_URL,
} from './const.ts';
import type { TavilySearchResponse, TavilyWebContext } from '../types/types.ts';

export async function getWebContext(query: string): Promise<TavilyWebContext | undefined> {
  return searchTavily(query); // comment this line to disable Tavily
  logger.debug(
    {
      query,
    },
    'Tavily disabled, skipping web search',
  );
  return undefined;
}

// search web via Tavily
export async function searchTavily(query: string): Promise<TavilyWebContext | undefined> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    return undefined;
  }

  try {
    const response = await fetchWithTimeout(TAVILY_SEARCH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query,
        search_depth: 'basic', // ultra-fast(1), fast(1), basic(1: default), advanced(2)
        max_results: TAVILY_MAX_RESULTS,
        chunks_per_source: 2,
      }),
    });

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 200);
      logger.warn(
        { status: response.status, detail, query },
        'Tavily search failed, answering without web context',
      );
      return undefined;
    }

    const data = (await response.json()) as TavilySearchResponse;
    const results = (data.results ?? [])
      .filter(
        (r) =>
          // prettier-ignore
          r.url &&
          r.content &&
          (r.score ?? 0) >= TAVILY_MIN_SCORE,
      )
      .slice(0, TAVILY_MAX_RESULTS);

    if (results.length === 0) {
      return undefined;
    }

    const lines = results.map(
      (r, i) => `
        [${i + 1}] ${r.title ?? r.url}
        URL: ${r.url}
        Content: ${(r.content ?? '').slice(0, TAVILY_MAX_CHARS_PER_RESULT)}`,
    );

    return {
      contextBlock:
        `<web_search_results query="${query}">\n${lines.join('\n\n')}\n</web_search_results>\n` +
        'Dùng kết quả tìm kiếm trên khi trả lời nếu liên quan, ưu tiên thông tin mới nhất. ' +
        'Nếu kết quả không liên quan, cứ trả lời bằng kiến thức của bạn.',
      sources: results.map((r) => ({
        title: r.title ?? r.url ?? '',
        url: r.url ?? '',
      })),

      resultCount: results.length,
      searchTimeSeconds: data.response_time,
    };
  } catch (err) {
    logger.warn(
      {
        err,
        query,
      },
      'Tavily search error, answering without web context',
    );
    return undefined;
  }
}
