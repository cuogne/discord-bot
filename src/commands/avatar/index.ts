import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from '../../types/command.ts';
import { handleAvatarBanner } from './subcommands/banner.ts';
import { handleAvatarServer } from './subcommands/server.ts';
import { handleAvatarUser } from './subcommands/user.ts';

const command: SlashCommand = {
  // prettier-ignore
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Xem avatar')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('user')
        .setDescription('Xem avatar của user được chọn')
        .addUserOption((option) =>
          option
            .setName('user')
            .setDescription('Chọn user để xem avatar')
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('banner')
        .setDescription('Xem ảnh bìa của user được chọn')
        .addUserOption((option) =>
          option
            .setName('user')
            .setDescription('Chọn user để xem ảnh bìa')
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('server')
        .setDescription('Xem avatar của server'),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'user':
        return handleAvatarUser(interaction);
      case 'banner':
        return handleAvatarBanner(interaction);
      case 'server':
        return handleAvatarServer(interaction);
    }
  },
};

export default command;
