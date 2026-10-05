import { MessageFlags, SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js';
import type { SlashCommand } from '../../types/command.ts';
import { MAX_COIN } from './config.ts';
import { tryStartCoinCooldown } from './cooldown.ts';
import { handleCoinDaily } from './subcommands/daily.ts';
import { handleCoinDice } from './subcommands/dice.ts';
import { handleCoinFlip } from './subcommands/flip.ts';
import { handleCoinInfo } from './subcommands/info.ts';
import { handleCoinJackpot } from './subcommands/jackpot/index.ts';

const command: SlashCommand = {
  // prettier-ignore
  data: new SlashCommandBuilder()
    .setName('coin')
    .setDescription('Chơi coin ko bạn ? đầu tư sinh lời với bot của mình nè')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('daily')
        .setDescription('Điểm danh nhận coin hàng ngày (có streak 🔥)'),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('flip')
        .setDescription('Tung đồng xu: mặt ngửa thắng, mặt sấp thua')
        .addIntegerOption((option) =>
          option
            .setName('amount')
            .setDescription('Số coin muốn cược')
            .setMinValue(1)
            .setMaxValue(MAX_COIN)
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('dice')
        .setDescription('Đoán số xúc xắc, đúng nhận x3 tiền cược')
        .addIntegerOption((option) =>
          option
            .setName('guess')
            .setDescription('Số bạn đoán (1-6)')
            .setMinValue(1)
            .setMaxValue(6)
            .setRequired(true),
        )
        .addIntegerOption((option) =>
          option
            .setName('amount')
            .setDescription('Số coin muốn cược')
            .setMinValue(1)
            .setMaxValue(MAX_COIN)
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('jackpot')
        .setDescription('Quay jackpot với tiền cược của bạn')
        .addIntegerOption((option) =>
          option
            .setName('amount')
            .setDescription('Số coin muốn cược')
            .setMinValue(1)
            .setMaxValue(MAX_COIN)
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('info')
        .setDescription('Xem số dư và thống kê coin của bạn'),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const remainingMs = tryStartCoinCooldown(interaction.user.id);
    if (remainingMs > 0) {
      await interaction.reply({
        content: `Bạn chờ **${Math.ceil(remainingMs / 1000)} giây** rồi dùng /coin tiếp nha.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    switch (interaction.options.getSubcommand()) {
      case 'daily':
        return handleCoinDaily(interaction);
      case 'flip':
        return handleCoinFlip(interaction);
      case 'dice':
        return handleCoinDice(interaction);
      case 'jackpot':
        return handleCoinJackpot(interaction);
      case 'info':
        return handleCoinInfo(interaction);
    }
  },
};

export default command;
