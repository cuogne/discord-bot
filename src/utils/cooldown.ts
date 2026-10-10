import { MessageFlags } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';

const nextAllowedAtByCommand = new Map<string, Map<string, number>>();

/** Returns true after replying when the user is still on cooldown. */
export async function handleUserCooldown(
  interaction: ChatInputCommandInteraction,
  cooldownMs: number,
): Promise<boolean> {
  const now = Date.now();
  let nextAllowedAtByUser = nextAllowedAtByCommand.get(interaction.commandName);
  if (!nextAllowedAtByUser) {
    nextAllowedAtByUser = new Map<string, number>();
    nextAllowedAtByCommand.set(interaction.commandName, nextAllowedAtByUser);
  }

  const remainingMs = (nextAllowedAtByUser.get(interaction.user.id) ?? 0) - now;
  if (remainingMs > 0) {
    // prettier-ignore
    await interaction.reply({
      content: `Bạn chờ **${Math.ceil(remainingMs / 1000)} giây** rồi dùng /${interaction.commandName} tiếp nha.`,
      flags: MessageFlags.Ephemeral,
    });
    return true;
  }

  nextAllowedAtByUser.set(interaction.user.id, now + cooldownMs);
  return false;
}
