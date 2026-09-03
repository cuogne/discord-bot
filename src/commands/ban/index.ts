import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from '../../types/command.ts';
import { handleBanUsebot } from './subcommands/usebot.ts';

const command: SlashCommand = {
  // prettier-ignore
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Lệnh cấm')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('usebot')
        .setDescription('Cấm người dùng sử dụng bot')
        .addUserOption((option) =>
          option
            .setName('user')
            .setDescription('Người dùng cần cấm')
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName('time')
            .setDescription('Thời gian cấm')
            .setRequired(true)
            .addChoices(
              { name: '10 phút', value: '10m' },
              { name: '30 phút', value: '30m' },
              { name: '60 phút', value: '60m' },
              { name: '3 tiếng', value: '3h' },
              { name: '12 tiếng', value: '12h' },
              { name: '1 ngày', value: '1d' },
              { name: '3 ngày', value: '3d' },
              { name: '7 ngày', value: '7d' },
              { name: 'Vĩnh viễn', value: 'permanent' },
            ),
        )
        .addStringOption((option) =>
          option
            .setName('reason')
            .setDescription('Lý do cấm')
            .setRequired(false),
        ),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'usebot': {
        return handleBanUsebot(interaction);
      }
    }
  },
};

export default command;
