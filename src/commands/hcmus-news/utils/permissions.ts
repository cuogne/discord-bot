import { ChannelType, PermissionsBitField } from 'discord.js';
import type { ChatInputCommandInteraction, GuildTextBasedChannel } from 'discord.js';

export function isUserAdminOrManageChannels(interaction: ChatInputCommandInteraction): boolean {
  if (!interaction.inCachedGuild()) {
    return false;
  }

  const permissions = interaction.memberPermissions;
  if (!permissions) {
    return false;
  }

  return (
    permissions.has(PermissionsBitField.Flags.Administrator) ||
    permissions.has(PermissionsBitField.Flags.ManageChannels)
  );
}

export function isTextChannel(channel: unknown): channel is GuildTextBasedChannel {
  if (!channel || typeof channel !== 'object') {
    return false;
  }

  const c = channel as { type?: ChannelType };
  return c.type === ChannelType.GuildText;
}

export function checkBotChannelPermissions(
  channel: GuildTextBasedChannel,
  botUserId: string,
): {
  hasPermissions: boolean;
  missing: string[];
} {
  const permissions = channel.permissionsFor(botUserId);
  if (!permissions) {
    return {
      hasPermissions: false,
      missing: ['ViewChannel', 'SendMessages', 'EmbedLinks'],
    };
  }

  const required = [
    { flag: PermissionsBitField.Flags.ViewChannel, name: 'ViewChannel' },
    { flag: PermissionsBitField.Flags.SendMessages, name: 'SendMessages' },
    { flag: PermissionsBitField.Flags.EmbedLinks, name: 'EmbedLinks' },
  ];

  const missing: string[] = [];
  for (const { flag, name } of required) {
    if (!permissions.has(flag)) {
      missing.push(name);
    }
  }

  return {
    hasPermissions: missing.length === 0,
    missing,
  };
}
