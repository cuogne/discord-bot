import { MessageFlags, SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js';
import type { SlashCommand } from '../../types/command.ts';
import { MAX_COIN } from './config.ts';
import { tryStartCoinCooldown } from './cooldown.ts';
import { handleCoinBauCua } from './subcommands/baucua/index.ts';
import { handleCoinCash } from './subcommands/cash.ts';
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
        .setDescription('Tung đồng xu: mặt ngửa thắng, mặt sấp thua (x2 tiền cược)')
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
        .setName('baucua')
        .setDescription('Đặt bầu cua: 1 con x1, 2 con x3, 3 con x5')
        .addStringOption((option) =>
          option
            .setName('symbol')
            .setDescription('Con bạn đặt')
            .setRequired(true)
            .addChoices(
              { name: 'Bầu 🍐', value: 'bau' },
              { name: 'Cua 🦀', value: 'cua' },
              { name: 'Tôm 🦐', value: 'tom' },
              { name: 'Cá 🐟', value: 'ca' },
              { name: 'Gà 🐔', value: 'ga' },
              { name: 'Nai 🦌', value: 'nai' },
            ),
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
        .setName('cash')
        .setDescription('Xem số dư coin hiện tại'),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('info')
        .setDescription('Xem số dư và thống kê coin của bạn'),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    // Read-only lookup: never consume the game cooldown.
    if (subcommand !== 'cash') {
      const remainingMs = tryStartCoinCooldown(interaction.user.id);
      if (remainingMs > 0) {
        await interaction.reply({
          content: `Bạn chờ **${Math.ceil(remainingMs / 1000)} giây** rồi dùng /coin tiếp nha.`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
    }

    switch (subcommand) {
      case 'cash':
        return handleCoinCash(interaction);
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
      case 'baucua':
        return handleCoinBauCua(interaction);
    }
  },
};

export default command;
