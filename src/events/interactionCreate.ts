import { MessageFlags } from 'discord.js';
import type { Client, Interaction } from 'discord.js';
import { commandMap, commands } from '../commands/index.ts';
import { logger } from '../logging/logger.ts';
import type { SelectHandler } from '../types/command.ts';
import type { BotEvent } from '../types/event.ts';

const selectHandlers = new Map<string, SelectHandler>();
for (const command of commands) {
  const handlers: Record<string, SelectHandler> = command.selectHandlers ?? {};
  for (const [key, handler] of Object.entries(handlers)) {
    selectHandlers.set(key, handler);
  }
}

const event: BotEvent = {
  name: 'interactionCreate',

  async execute(_client: Client<true>, interaction: Interaction) {
    if (interaction.isChatInputCommand()) {
      const command = commandMap.get(interaction.commandName);
      if (!command) {
        await interaction.reply({
          content: 'Command does not exist!',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        logger.error({ err: error, command: interaction.commandName }, 'Lỗi khi chạy command');
        if (interaction.deferred || interaction.replied) {
          await interaction.followUp({
            content: 'Có lỗi xảy ra khi chạy command!',
            flags: MessageFlags.Ephemeral,
          });
        } else {
          await interaction.reply({
            content: 'Có lỗi xảy ra khi chạy command!',
            flags: MessageFlags.Ephemeral,
          });
        }
      }
      return;
    }

    if (interaction.isAutocomplete()) {
      const command = commandMap.get(interaction.commandName);
      if (!command?.autocomplete) return;

      try {
        await command.autocomplete(interaction);
      } catch (error) {
        logger.error({ err: error, command: interaction.commandName }, 'Lỗi autocomplete');
      }
      return;
    }

    if (interaction.isStringSelectMenu()) {
      const key = selectHandlers.has(interaction.customId)
        ? interaction.customId
        : interaction.customId.split('|')[0]!;
      const handler = selectHandlers.get(key);
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
        logger.error({ err: error, customId: interaction.customId }, 'Lỗi xử lý select menu');
      }
    }
  },
};

export default event;
