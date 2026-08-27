import type { ChatInputCommandInteraction } from 'discord.js';
import type { CommandUsageLog } from '../types/log.ts';

export function createCommandUsageContext(
  interaction: ChatInputCommandInteraction,
): CommandUsageLog {
  const channelName =
    interaction.channel && 'name' in interaction.channel
      ? (interaction.channel.name ?? 'unknown')
      : 'unknown';

  const options = Object.fromEntries(
    interaction.options.data.flatMap((opt) =>
      opt.options?.length
        ? opt.options.map((sub) => [`${opt.name}.${sub.name}`, sub.value])
        : [[opt.name, opt.value]],
    ),
  ) as Record<string, unknown>;

  return {
    userId: interaction.user.id,
    user: interaction.user.username,
    command: interaction.commandName,
    options,
    guildId: interaction.guildId ?? 'DM',
    guild: interaction.guild?.name ?? 'DM',
    channelId: interaction.channelId,
    channel: channelName,
  };
}
