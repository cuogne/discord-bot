import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from '../../types/command.ts';
import { handleUnbanUsebot } from './subcommands/usebot.ts';

const command: SlashCommand = {
  // prettier-ignore
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Lệnh gỡ cấm')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('usebot')
        .setDescription('Gỡ cấm người dùng sử dụng bot')
        .addUserOption((option) =>
          option
            .setName('user')
            .setDescription('Người dùng cần gỡ cấm')
            .setRequired(true),
        ),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'usebot': {
        return handleUnbanUsebot(interaction);
      }
    }
  },
};

export default command;
