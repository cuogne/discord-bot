import type { ChatInputCommandInteraction } from 'discord.js';
import type { CommandUsageLog, GeminiUsageLog, StudocuTimingLog } from '../types/log.ts';

const commandUsageDetails = new WeakMap<ChatInputCommandInteraction, GeminiUsageLog>();
const studocuTimingDetails = new WeakMap<ChatInputCommandInteraction, StudocuTimingLog>();
const commandUsageErrors = new WeakMap<ChatInputCommandInteraction, unknown>();
const commandReplyErrors = new WeakMap<ChatInputCommandInteraction, unknown>();
const commandUsageRejections = new WeakMap<ChatInputCommandInteraction, string>();
const commandUsageMetadata = new WeakMap<ChatInputCommandInteraction, Record<string, unknown>>();

export function setGeminiUsageLog(
  interaction: ChatInputCommandInteraction,
  details: GeminiUsageLog,
): void {
  commandUsageDetails.set(interaction, details);
}

export function setStudocuTimingLog(
  interaction: ChatInputCommandInteraction,
  details: StudocuTimingLog,
): void {
  studocuTimingDetails.set(interaction, details);
}

export function setCommandUsageError(
  interaction: ChatInputCommandInteraction,
  error: unknown,
): void {
  if (!commandUsageErrors.has(interaction)) {
    commandUsageErrors.set(interaction, error);
  } else {
    commandReplyErrors.set(interaction, error);
  }
}

export function setCommandReplyError(
  interaction: ChatInputCommandInteraction,
  error: unknown,
): void {
  commandReplyErrors.set(interaction, error);
}

export function setCommandUsageRejection(
  interaction: ChatInputCommandInteraction,
  reason: string,
): void {
  commandUsageRejections.set(interaction, reason);
}

export function setCommandUsageDetails(
  interaction: ChatInputCommandInteraction,
  details: Record<string, unknown>,
): void {
  commandUsageMetadata.set(interaction, {
    ...commandUsageMetadata.get(interaction),
    ...details,
  });
}

export async function createCommandUsageContext(
  interaction: ChatInputCommandInteraction,
): Promise<CommandUsageLog> {
  const isDirectMessage = interaction.guildId === null;
  const guild =
    interaction.guild ??
    (interaction.guildId
      ? await interaction.client.guilds.fetch(interaction.guildId).catch(() => null)
      : null);
  const channel =
    interaction.channel ??
    interaction.client.channels.cache.get(interaction.channelId) ??
    (await interaction.client.channels.fetch(interaction.channelId).catch(() => null));
  const channelName = channel && 'name' in channel ? channel.name : undefined;

  const options = Object.fromEntries(
    interaction.options.data.flatMap((opt) =>
      opt.options?.length
        ? opt.options.map((sub) => [`${opt.name}.${sub.name}`, sub.value])
        : [[opt.name, opt.value]],
    ),
  ) as Record<string, unknown>;

  return {
    outcome: commandUsageErrors.has(interaction)
      ? 'failed'
      : commandUsageRejections.has(interaction)
        ? 'rejected'
        : 'completed',
    userId: interaction.user.id,
    interactionId: interaction.id,
    user: interaction.user.username,
    command: interaction.commandName,
    subcommand: interaction.options.getSubcommand(false) ?? undefined,
    options,
    guildId: interaction.guildId ?? 'DM',
    guild: guild?.name ?? (isDirectMessage ? 'DM' : 'No access'),
    channelId: interaction.channelId,
    channel: channelName ?? (isDirectMessage ? 'DM' : 'No access'),
    gemini: commandUsageDetails.get(interaction),
    studocu: studocuTimingDetails.get(interaction),
    details: commandUsageMetadata.get(interaction),
    err: commandUsageErrors.get(interaction),
    replyErr: commandReplyErrors.get(interaction),
    reason: commandUsageRejections.get(interaction),
  };
}
