import { SlashCommandBuilder } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import type { SlashCommand } from '../../types/command.ts';
import { buildHelpEmbed } from './utils/embed.ts';

const command: SlashCommand = {
  // prettier-ignore
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Hiển thị thông tin cơ bản về bot và danh sách câu lệnh'),

  async execute(interaction: ChatInputCommandInteraction) {
    const embed = buildHelpEmbed();

    await interaction.reply({
      embeds: [embed],
    });
  },
};

export default command;
