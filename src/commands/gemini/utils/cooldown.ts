import { MessageFlags } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import { GEMINI_COOLDOWN_MS } from './config.ts';

const userCooldowns = new Map<string, number>();

function getRemainingMs(userId: string): number {
  const elapsed = Date.now() - (userCooldowns.get(userId) ?? 0);
  return Math.max(0, GEMINI_COOLDOWN_MS - elapsed);
}

/**
 * Checks the user cooldown. If the user is still on cooldown, replies with
 * the remaining time (ephemeral) and returns true — the caller should stop.
 */
export async function handleCooldown(interaction: ChatInputCommandInteraction): Promise<boolean> {
  const remainingMs = getRemainingMs(interaction.user.id);

  if (remainingMs <= 0) {
    return false;
  }

  const remainingSeconds = Math.ceil(remainingMs / 1000);
  await interaction.reply({
    content: `Bạn chờ ${remainingSeconds}s rồi dùng /gemini tiếp nha.`,
    flags: MessageFlags.Ephemeral,
  });
  return true;
}

export function markCooldown(userId: string): void {
  userCooldowns.set(userId, Date.now());
}
