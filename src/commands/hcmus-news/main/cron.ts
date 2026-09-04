import type { Client } from 'discord.js';
import { logger } from '../../../logging/logger.ts';
import { getVNTimeNow } from '../../../utils/date.ts';
import { crawlAllSources } from '../core/crawler.ts';
import { getActiveUserConfigs } from '../core/database/config.ts';
import { pruneOldNews, saveNewsItems } from '../core/database/news.ts';
import { extractArticleContent } from '../core/extractor.ts';
import { filterNewNews } from '../core/filter.ts';
import { summarizeNewsWithGemini } from '../core/gemini.ts';
import type { NewsCategory, ProcessedNewsItem } from '../types/types.ts';
import { sendNewsToGuild, sleep } from './sendNews.ts';

const SCAN_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

const SKIP_SUMMARY_CATEGORIES: ReadonlySet<NewsCategory> = new Set(['lichthi', 'thongbao']);

let cronTimeout: Timer | null = null;
let isRunning = false;

export async function processAndSendNews(client: Client): Promise<void> {
  try {
    const crawled = await crawlAllSources();
    if (crawled.length === 0) {
      // logger.info('No news crawled from sources');
      return;
    }

    const newNews = await filterNewNews(crawled);
    if (newNews.length === 0) {
      return;
    }

    // logger.info(
    //   {
    //     count: newNews.length,
    //   },
    //   'New news detected',
    // );

    // Process each new news item (extract & summarize)
    const processedNews: ProcessedNewsItem[] = [];
    const affectedCategories = new Set<NewsCategory>();

    for (const item of newNews) {
      affectedCategories.add(item.category);
      logger.info(
        {
          title: item.title,
          // category: item.category,
          // url: item.url,
        },
        // 'New news item detected',
      );

      let summary = '';
      let prompt_token = 0;
      let completion_token = 0;

      if (!SKIP_SUMMARY_CATEGORIES.has(item.category)) {
        try {
          const content = await extractArticleContent(item.url);
          if (content) {
            // summarize the article content using Gemini API
            const summaryRes = await summarizeNewsWithGemini(content, item.title);

            summary = summaryRes.summary;
            prompt_token = summaryRes.prompt_token;
            completion_token = summaryRes.completion_token;
          }
        } catch (err) {
          logger.warn(
            {
              err,
              title: item.title,
              url: item.url,
            },
            'Failed to summarize article, skipping summary',
          );
        }
      }

      processedNews.push({
        category: item.category,
        title: item.title,
        url: item.url,
        summary,
        sentAt: getVNTimeNow(),
        prompt_token,
        completion_token,
      });

      // Small delay between AI requests to be gentle on quotas
      await sleep(500);
    }

    // Get active servers
    const activeConfigs = await getActiveUserConfigs();
    if (activeConfigs.length > 0) {
      // Deliver to all guilds concurrently (each guild is independent)
      await Promise.all(
        activeConfigs.map((config) =>
          sendNewsToGuild(client, config, processedNews).catch((serverErr) => {
            logger.error(
              {
                err: serverErr,
                guildId: config.guildId,
              },
              'Failed to process news delivery for guild',
            );
          }),
        ),
      );
    }

    // Save to database
    await saveNewsItems(processedNews);

    // Prune old news (keep max 20 per category)
    for (const category of affectedCategories) {
      await pruneOldNews(category, 20);
    }

    // logger.info(
    //   {
    //     count: processedNews.length,
    //   },
    //   'Completed saving and broadcasting new news',
    // );
  } catch (error) {
    logger.error(
      {
        err: error,
      },
      'Error during HCMUS news scan cycle',
    );
  }
}

export function startHcmusNewsCron(client: Client): void {
  logger.info('Starting HCMUS news cron job (every 10 minutes)');

  const runCycle = async () => {
    if (isRunning) {
      logger.warn('Previous news scan cycle is still running, skipping this tick');
      return;
    }

    isRunning = true;
    try {
      await processAndSendNews(client);
    } catch (err) {
      logger.error(
        {
          err,
        },
        'Unexpected error in HCMUS news cron job',
      );
    } finally {
      isRunning = false;
      cronTimeout = setTimeout(() => void runCycle(), SCAN_INTERVAL_MS);
    }
  };

  // Run initial cycle after 5 seconds of bot startup
  setTimeout(() => void runCycle(), 5_000);
}

export function stopHcmusNewsCron(): void {
  if (cronTimeout) {
    clearTimeout(cronTimeout);
    cronTimeout = null;
  }
}
