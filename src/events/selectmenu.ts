import { MessageFlags } from 'discord.js';
import type { StringSelectMenuInteraction } from 'discord.js';
import { commands } from '../commands/index.ts';
import { checkUserBanned } from '../core/ban/index.ts';
import { logger } from '../logging/logger.ts';
import type { SelectHandler } from '../types/command.ts';

function getSelectHandler(customId: string): SelectHandler | undefined {
  const exactHandlers = new Map<string, SelectHandler>();

  for (const command of commands) {
    for (const [key, handler] of Object.entries(command.selectHandlers ?? {})) {
      exactHandlers.set(key, handler);
    }
  }

  const key = exactHandlers.has(customId) ? customId : customId.split('|')[0]!;
  return exactHandlers.get(key);
}

export async function executeSelectMenu(interaction: StringSelectMenuInteraction) {
  if (checkUserBanned(interaction.user.id)) {
    await interaction.reply({
      content: 'Bạn đã bị cấm sử dụng bot.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const handler = getSelectHandler(interaction.customId);
  if (!handler) {
    await interaction.reply({
      content: 'Invalid selection!',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  try {
    await handler(interaction);
  } catch (error) {
    logger.error(
      {
        err: error,
        customId: interaction.customId,
      },
      'Error processing select menu',
    );
  }
}
