import { EmbedBuilder } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import { logger } from './logger.ts';
import type { CommandUsageLog } from '../types/log.ts';
import { formatVietnamDateTime } from '../utils/date.ts';
import { formatOptionValue, truncate } from './utils/format.ts';

export async function sendCommandUsageLog(
  interaction: ChatInputCommandInteraction,
  logData: CommandUsageLog,
): Promise<void> {
  const logChannelId = process.env.LOG_CHANNEL_ID?.trim();
  if (!logChannelId) {
    logger.warn('LOG_CHANNEL_ID is not configured, skipping command usage log');
    return;
  }

  try {
    const channel = await interaction.client.channels.fetch(logChannelId);
    if (!channel?.isSendable()) {
      logger.warn(
        {
          channelId: logChannelId,
        },
        'Configured log channel is not sendable',
      );
      return;
    }

    const subcommand = interaction.options.getSubcommand(false);
    const attachment = interaction.options.getAttachment('attachment');

    const commandLabel = subcommand ? `/${logData.command} ${subcommand}` : `/${logData.command}`;
    const optionsText = Object.entries(logData.options)
      .map(([key, value]) => `• **${key}**: ${formatOptionValue(key, value)}`)
      .join('\n');

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('Command log')
      .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
      .setDescription(`${interaction.user} vừa sử dụng command: **${commandLabel}**\n`)
      .addFields(
        {
          name: 'User',
          value: `${interaction.user}\n\`${logData.user}\``,
          inline: true,
        },
        {
          name: 'Server',
          value: `${logData.guild}\n\`${logData.guildId}\``,
          inline: true,
        },
        {
          name: 'Channel',
          value: `${logData.channel}\n\`${logData.channelId}\``,
          inline: true,
        },
        {
          name: 'Time',
          value: formatVietnamDateTime(interaction.createdAt),
          inline: false,
        },
        {
          name: 'Duration',
          value: logData.durationMs !== undefined ? `${logData.durationMs} ms` : 'Không rõ',
          inline: true,
        },
        {
          name: 'Options',
          value: truncate(optionsText || 'Không có options'),
          inline: false,
        },
      );

    if (logData.gemini) {
      embed.addFields({
        name: 'Gemini Usage',
        value: [
          `⏱️ Response time: **${logData.gemini.responseTime}**`,
          `📥 Input tokens: **${logData.gemini.tokensInput}**`,
          `📤 Output tokens: **${logData.gemini.tokensOutput}**`,
        ].join('\n'),
        inline: false,
      });
    }

    if (logData.error) {
      embed.addFields({
        name: 'Error',
        value: truncate(logData.error),
        inline: false,
      });
    }

    if (attachment?.contentType?.startsWith('image/')) {
      embed.setImage(attachment.url);
    }

    if (attachment?.contentType === 'application/pdf') {
      embed.addFields({
        name: 'Attachment',
        value: `[${attachment.name}](${attachment.url})`,
        inline: false,
      });
    }

    await channel.send({
      embeds: [embed],
      files:
        attachment?.contentType === 'application/pdf'
          ? [
              {
                attachment: attachment.url,
                name: attachment.name,
              },
            ]
          : [],
    });
  } catch (error) {
    logger.warn(
      {
        err: error,
        channelId: logChannelId,
      },
      'Failed to send command log embed',
    );
  }
}
