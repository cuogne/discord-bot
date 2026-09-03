import type { Client, TextChannel } from 'discord.js';
import { logger } from '../../../logging/logger.ts';
import type { IUserConfig, ProcessedNewsItem } from '../types/types.ts';
import { checkBotChannelPermissions, isTextChannel } from '../utils/permissions.ts';

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendNewsToGuild(
  client: Client,
  config: IUserConfig,
  processedNews: ProcessedNewsItem[],
): Promise<void> {
  const guild = client.guilds.cache.get(config.guildId);
  if (!guild) {
    logger.warn(
      {
        guildId: config.guildId,
      },
      'Bot is not in guild or guild is not cached',
    );
    return;
  }

  const channel = guild.channels.cache.get(config.channelId);
  if (!channel) {
    logger.warn(
      {
        guildId: config.guildId,
        channelId: config.channelId,
      },
      'Channel does not exist in guild',
    );
    return;
  }

  if (!isTextChannel(channel)) {
    logger.warn(
      {
        guildId: config.guildId,
        channelId: config.channelId,
      },
      'Channel is not a text channel',
    );
    return;
  }

  const textChannel = channel as TextChannel;
  const { hasPermissions, missing } = checkBotChannelPermissions(
    textChannel,
    client.user?.id ?? '',
  );

  if (!hasPermissions) {
    logger.warn(
      {
        guildId: config.guildId,
        channelId: config.channelId,
        missing,
      },
      'Bot lacks permissions in channel',
    );
    return;
  }

  // Send each news item sequentially within the channel to avoid spam
  for (const news of processedNews) {
    try {
      await textChannel.send(
        `📰 | **${news.title}**\n\n` +
          `${news.summary.trim() ? `${news.summary.trim()}\n\n` : ''}` +
          `🔗 **Chi tiết xem tại: **${news.url}`,
      );
      await sleep(500);
    } catch (err) {
      logger.error(
        {
          err,
          guildId: config.guildId,
          channelId: config.channelId,
          url: news.url,
        },
        'Failed to send news message to channel',
      );
    }
  }
}
