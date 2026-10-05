import { EmbedBuilder } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import { FLIP_TOSS_DELAY_MS } from '../config.ts';
import { applyGameResult } from '../database/users.ts';
import { balanceText, formatCoins } from '../utils/format.ts';
import { replyInsufficientBalance } from '../utils/reply.ts';
import { logger } from '../../../logging/logger.ts';

export async function handleCoinFlip(interaction: ChatInputCommandInteraction): Promise<void> {
  const coin = interaction.options.getInteger('amount', true);
  await interaction.deferReply();

  // logic for coin flip game
  const won = Math.random() < 0.5;
  const balanceChange = won ? coin : -coin;

  const gameResult = await applyGameResult({
    userId: interaction.user.id,
    game: 'flip',
    coin,
    balanceChange,
    won,
  });

  if (!gameResult) {
    await replyInsufficientBalance(interaction, coin);
    return;
  }
  const { user } = gameResult;

  try {
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(0xf1c40f)
          .setTitle('🪙 Đang tung đồng xu...')
          .setDescription(`Cược **${formatCoins(coin)} 🪙**`),
      ],
    });
    await new Promise((resolve) => setTimeout(resolve, FLIP_TOSS_DELAY_MS));
  } catch (error) {
    logger.warn(
      {
        err: error,
        userId: interaction.user.id,
      },
      'Failed to show coin flip animation',
    );
  }

  const resultText = won
    ? `Bạn thắng **+${formatCoins(coin)} 🪙**.`
    : `Bạn thua **-${formatCoins(coin)} 🪙**.`;

  const finalReply = {
    embeds: [
      new EmbedBuilder()
        .setColor(won ? 0x2ecc71 : 0xe74c3c)
        .setTitle(won ? '🪙 Mặt ngửa!' : '⚫ Mặt sấp!')
        .setDescription(`${resultText}\n\n${balanceText(user)}`),
    ],
  };

  try {
    await interaction.editReply(finalReply);
  } catch (error) {
    logger.warn(
      {
        err: error,
        userId: interaction.user.id,
      },
      'Failed to show coin flip result',
    );
    await interaction.followUp(finalReply);
  }
}
