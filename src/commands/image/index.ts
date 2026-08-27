import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from '../../types/command.ts';
import { handleImage } from './main/image.ts';
import { IMAGE_SOURCES } from './utils/config.ts';

const command: SlashCommand = {
  // prettier-ignore
  data: new SlashCommandBuilder()
    .setName('image')
    .setDescription('Xem ảnh động vật')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('cat')
        .setDescription('Xem ảnh mèo'),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('dog')
        .setDescription('Xem ảnh chó'),
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const source = IMAGE_SOURCES[subcommand];

    if (!source) {
      await interaction.reply({
        content: 'Subcommand không hợp lệ.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await handleImage(interaction, source);
  },
};

export default command;
