import type { Model } from 'mongoose';
import { useMongoDatabase } from '../../../../core/database/mongodb/index.ts';
import { logger } from '../../../../logging/logger.ts';
import type { INewsConfig, NewsCategory, ProcessedNewsItem } from '../../types/types.ts';
import { newsConfigSchema } from './schema.ts';

let newsConfigModel: Model<INewsConfig> | null = null;

function getNewsConfigModel(): Model<INewsConfig> {
  if (!newsConfigModel) {
    const connection = useMongoDatabase().getConnection();

    newsConfigModel =
      (connection.models.NewsConfig as Model<INewsConfig>) ||
      connection.model<INewsConfig>('NewsConfig', newsConfigSchema);
  }

  return newsConfigModel;
}

export async function getExistingNewsUrls(urls: string[]): Promise<Set<string>> {
  if (urls.length === 0) {
    return new Set();
  }

  const model = getNewsConfigModel();
  const existingDocs = await model
    .find(
      {
        url: { $in: urls },
      },
      { url: 1 },
    )
    .lean<{ url: string }[]>();

  return new Set(existingDocs.map((item) => item.url));
}

export async function saveNewsItems(items: ProcessedNewsItem[]): Promise<void> {
  if (items.length === 0) {
    return;
  }

  const model = getNewsConfigModel();
  const operations = items.map((item) => ({
    updateOne: {
      filter: { url: item.url },
      update: {
        $setOnInsert: {
          category: item.category,
          url: item.url,
          title: item.title,
          summary: item.summary,
          sentAt: item.sentAt,
          prompt_token: item.prompt_token,
          completion_token: item.completion_token,
        },
      },
      upsert: true,
    },
  }));

  await model.bulkWrite(operations);
}

export async function pruneOldNews(category: NewsCategory, keepCount = 20): Promise<void> {
  const model = getNewsConfigModel();
  try {
    const docsToKeep = await model
      .find({ category }, { _id: 1 })
      .sort({ sentAt: -1 })
      .limit(keepCount)
      .lean<{ _id: unknown }[]>();

    if (docsToKeep.length >= keepCount) {
      const idsToKeep = docsToKeep.map((doc) => doc._id);
      await model.deleteMany({
        category,
        _id: { $nin: idsToKeep },
      });
    }
  } catch (error) {
    logger.error(
      {
        err: error,
        category,
      },
      'Failed to prune old news',
    );
  }
}

export async function getLatestNewsByCategory(
  category: NewsCategory,
  limit = 1,
): Promise<INewsConfig[]> {
  const model = getNewsConfigModel();
  return model
    .find({
      category,
    })
    .sort({ sentAt: -1 })
    .limit(limit)
    .lean<INewsConfig[]>();
}
