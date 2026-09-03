import type { ChatInputCommandInteraction } from 'discord.js';
import type { CommandUsageLog, GeminiUsageLog } from '../types/log.ts';

const commandUsageDetails = new WeakMap<ChatInputCommandInteraction, GeminiUsageLog>();
const commandUsageErrors = new WeakMap<ChatInputCommandInteraction, string>();

export function setGeminiUsageLog(
  interaction: ChatInputCommandInteraction,
  details: GeminiUsageLog,
): void {
  commandUsageDetails.set(interaction, details);
}

export function setCommandUsageError(
  interaction: ChatInputCommandInteraction,
  error: unknown,
): void {
  const message = error instanceof Error ? error.message : String(error);
  commandUsageErrors.set(interaction, message);
}

export function createCommandUsageContext(
  interaction: ChatInputCommandInteraction,
): CommandUsageLog {
  const isDirectMessage = interaction.guildId === null;
  const channelName =
    interaction.channel && 'name' in interaction.channel
      ? (interaction.channel.name ?? (isDirectMessage ? 'DM' : 'No access'))
      : isDirectMessage
        ? 'DM'
        : 'No access';

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
    guild: interaction.guild?.name ?? (isDirectMessage ? 'DM' : 'No access'),
    channelId: interaction.channelId,
    channel: channelName,
    gemini: commandUsageDetails.get(interaction),
    error: commandUsageErrors.get(interaction),
  };
}
