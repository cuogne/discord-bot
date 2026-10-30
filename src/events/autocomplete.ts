import type { AutocompleteInteraction } from 'discord.js';
import { commandMap } from '../commands/index.ts';
import { checkUserBanned } from '../core/ban/index.ts';
import { logger } from '../logging/logger.ts';

export async function executeAutocomplete(interaction: AutocompleteInteraction) {
  if (checkUserBanned(interaction.user.id)) {
    return;
  }

  const command = commandMap.get(interaction.commandName);
  if (!command?.autocomplete) {
    return;
  }

  try {
    await command.autocomplete(interaction);
  } catch (error) {
    logger.error(
      {
        err: error,
        interactionId: interaction.id,
        userId: interaction.user.id,
        guildId: interaction.guildId ?? 'DM',
        channelId: interaction.channelId,
        command: interaction.commandName,
      },
      'Error in autocomplete',
    );
  }
}
