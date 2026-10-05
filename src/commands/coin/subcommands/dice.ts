import { EmbedBuilder } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import { DICE_ROLL_DELAY_MS } from '../config.ts';
import { applyGameResult } from '../database/users.ts';
import { balanceText, formatCoins } from '../utils/format.ts';
import { replyInsufficientBalance } from '../utils/reply.ts';
import { logger } from '../../../logging/logger.ts';

const DICE_NUMBER_EMOJI: Record<number, string> = {
  1: ':one:',
  2: ':two:',
  3: ':three:',
  4: ':four:',
  5: ':five:',
  6: ':six:',
};

export async function handleCoinDice(interaction: ChatInputCommandInteraction): Promise<void> {
  const guess = interaction.options.getInteger('guess', true);
  const coin = interaction.options.getInteger('amount', true);

  await interaction.deferReply();

  const rolled = Math.floor(Math.random() * 6) + 1; // random number between 1 and 6 (dice roll)
  const won = rolled === guess; // check if the user guessed correctly
  const balanceChange = won ? coin * 4 : -coin; // calculate the balance change based on the result of the dice roll

  const gameResult = await applyGameResult({
    userId: interaction.user.id,
    game: 'dice',
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
          .setTitle('🎲 Đang tung xúc xắc...')
          .setDescription(`Bạn đoán **${guess}** nút • Cược **${formatCoins(coin)} 🪙**`),
      ],
    });
    await new Promise((resolve) => setTimeout(resolve, DICE_ROLL_DELAY_MS));
  } catch (error) {
    logger.warn(
      {
        err: error,
        userId: interaction.user.id,
      },
      'Failed to show dice animation',
    );
  }

  const diceEmoji = DICE_NUMBER_EMOJI[rolled] ?? '🎲';

  const finalReply = {
    embeds: [
      new EmbedBuilder()
        .setColor(won ? 0x2ecc71 : 0xe74c3c)
        .setTitle(
          won
            ? `🎲 ${rolled} nút — Bạn đoán ${guess} nút đúng rồi!`
            : `🎲 ${rolled} nút — Bạn đoán ${guess} nút sai rồi!`,
        )
        .setDescription(
          won
            ? `# ${diceEmoji}\n**+${formatCoins(balanceChange)} 🪙** (x4 tiền cược).\n\n${balanceText(user)}`
            : `# ${diceEmoji}\n**-${formatCoins(coin)} 🪙**.\n\n${balanceText(user)}`,
        ),
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
      'Failed to show dice result',
    );
    await interaction.followUp(finalReply);
  }
}
