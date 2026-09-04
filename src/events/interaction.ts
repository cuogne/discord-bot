import type { Client, Interaction } from 'discord.js';
import type { BotEvent } from '../types/event.ts';
import { executeAutocomplete } from './autocomplete.ts';
import { executeCommand } from './command.ts';
import { executeSelectMenu } from './selectmenu.ts';

const event: BotEvent = {
  name: 'interactionCreate',

  async execute(_client: Client<true>, interaction: Interaction) {
    if (interaction.isChatInputCommand()) {
      await executeCommand(interaction);
      return;
    }

    if (interaction.isAutocomplete()) {
      await executeAutocomplete(interaction);
      return;
    }

    if (interaction.isStringSelectMenu()) {
      await executeSelectMenu(interaction);
    }
  },
};

export default event;
