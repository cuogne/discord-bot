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

let inFlightCoinCommands = 0;
const DRAIN_POLL_MS = 100;

export async function waitForCoinCommandsToFinish(timeoutMs: number): Promise<void> {
  const start = Date.now();
  while (inFlightCoinCommands > 0 && Date.now() - start < timeoutMs) {
    await new Promise((resolve) => setTimeout(resolve, DRAIN_POLL_MS));
  }
}

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
        .setDescription('Đoán số xúc xắc, đúng nhận x4 tiền cược')
        .addIntegerOption((option) =>
          option
            .setName('guess')
            .setDescription('Số bạn đoán (1-6)')
            .addChoices(
              { name: '1️⃣', value: 1 },
              { name: '2️⃣', value: 2 },
              { name: '3️⃣', value: 3 },
              { name: '4️⃣', value: 4 },
              { name: '5️⃣', value: 5 },
              { name: '6️⃣', value: 6 },
            )
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
        .setDescription('Đặt bầu cua: trúng 1 con x1, 2 con x2, 3 con x5')
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
    inFlightCoinCommands += 1;
    try {
      const subcommand = interaction.options.getSubcommand();

      // Read-only lookup: never consume the game cooldown.
      if (subcommand !== 'cash' && subcommand !== 'info') {
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
    } finally {
      inFlightCoinCommands -= 1;
    }
  },
};

export default command;
