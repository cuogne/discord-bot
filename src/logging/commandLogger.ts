import type { Interaction } from 'discord.js';
import { logger } from './logger.ts';

export function logCommandUsage(interaction: Interaction): void {
  if (!interaction.isChatInputCommand()) return;

  const channelName =
    interaction.channel && 'name' in interaction.channel ? interaction.channel.name : 'unknown';

  const options = Object.fromEntries(
    interaction.options.data.flatMap((opt) =>
      opt.options?.length
        ? opt.options.map((sub) => [`${opt.name}.${sub.name}`, sub.value])
        : [[opt.name, opt.value]],
    ),
  );

  logger.info(
    {
      userId: interaction.user.id,
      user: interaction.user.username,
      command: interaction.commandName,
      options,
      guildId: interaction.guildId ?? 'DM',
      guild: interaction.guild?.name ?? 'DM',
      channelId: interaction.channelId,
      channel: channelName,
    },
    'command used',
  );
}
