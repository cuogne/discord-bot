import { EmbedBuilder } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import { FLIP_TOSS_DELAY_MS } from '../config.ts';
import { applyGameResult, getCoinUser } from '../database/users.ts';
import { balanceText, formatCoins } from '../utils/format.ts';
import { replyInsufficientBalance } from '../utils/reply.ts';
import { logger } from '../../../logging/logger.ts';

export async function handleCoinFlip(interaction: ChatInputCommandInteraction): Promise<void> {
  const coin = interaction.options.getInteger('amount', true);
  await interaction.deferReply();

  // Roll first, settle after the animation: if the process dies mid-spin,
  // money never moves without a result being shown.
  const won = Math.random() < 0.5;
  const balanceChange = won ? coin : -coin;

  // Fast-fail before the animation; the settle below stays the source of
  // truth in case the balance changes mid-spin.
  if ((await getCoinUser(interaction.user.id)).balance < coin) {
    await replyInsufficientBalance(interaction, coin);
    return;
  }

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
