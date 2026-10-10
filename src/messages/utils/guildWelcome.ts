import { AuditLogEvent, ChannelType, PermissionFlagsBits } from 'discord.js';
import type { Guild, GuildMember, TextChannel } from 'discord.js';
import { logger } from '../../logging/logger.ts';

const REQUIRED_CHANNEL_PERMISSIONS = [
  PermissionFlagsBits.ViewChannel,
  PermissionFlagsBits.SendMessages,
  PermissionFlagsBits.EmbedLinks,
  PermissionFlagsBits.AttachFiles,
];

export function findWelcomeChannel(guild: Guild, botMember: GuildMember): TextChannel | null {
  const channels = [guild.systemChannel, ...guild.channels.cache.values()];

  for (const channel of channels) {
    if (channel?.type !== ChannelType.GuildText) {
      continue;
    }

    const permissions = channel.permissionsFor(botMember);
    if (permissions?.has(REQUIRED_CHANNEL_PERMISSIONS)) {
      return channel;
    }
  }

  return null;
}

export async function findInviterId(guild: Guild, botMember: GuildMember): Promise<string | null> {
  if (!botMember.permissions.has(PermissionFlagsBits.ViewAuditLog)) {
    return null;
  }

  try {
    for (let attempt = 0; attempt < 3; attempt++) {
      // prettier-ignore
      const auditLogs = await guild.fetchAuditLogs({
        type: AuditLogEvent.BotAdd,
        limit: 10,
      });
      const entry = auditLogs.entries.find(
        (item) =>
          item.target?.id === botMember.id && Date.now() - item.createdTimestamp < 5 * 60_000,
      );
      if (entry?.executorId) {
        return entry.executorId;
      }

      if (attempt < 2) {
        await Bun.sleep(1_000);
      }
    }
    return null;
  } catch (error) {
    // prettier-ignore
    logger.warn(
      {
        err: error,
        guildId: guild.id,
      },
      'Could not read bot addition audit log',
    );
    return null;
  }
}
