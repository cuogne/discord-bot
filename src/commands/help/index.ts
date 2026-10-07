import { SlashCommandBuilder } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import type { SlashCommand } from '../../types/command.ts';
import { handleHelpSelection } from './handlers/selection.ts';
import { buildHelpMenu, HELP_DIRECTORY_ID } from './utils/components.ts';
import { buildHelpEmbed } from './utils/embed.ts';

const command: SlashCommand = {
  // prettier-ignore
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Xem danh sách lệnh của bot'),

  async execute(interaction: ChatInputCommandInteraction) {
    const embed = buildHelpEmbed(HELP_DIRECTORY_ID, interaction.client.user.displayAvatarURL());

    // prettier-ignore
    await interaction.reply({
      embeds: [embed],
      components: [buildHelpMenu(interaction.user.id)],
    });
  },

  selectHandlers: {
    help: handleHelpSelection,
  },
};

export default command;
