import { EmbedBuilder, MessageFlags } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import { BAUCUA_ROLL_DELAY_MS } from '../../config.ts';
import { applyGameResult, getCoinUser } from '../../database/users.ts';
import { balanceText, formatCoins } from '../../utils/format.ts';
import { replyInsufficientBalance } from '../../utils/reply.ts';
import { logger } from '../../../../logging/logger.ts';
import {
  BAUCUA_SYMBOL_BY_KEY,
  type BauCuaSymbolKey,
} from './config.ts';
import { rollBauCua } from './game.ts';

export async function handleCoinBauCua(interaction: ChatInputCommandInteraction): Promise<void> {
  const guess = interaction.options.getString('symbol', true) as BauCuaSymbolKey;
  const coin = interaction.options.getInteger('amount', true);
  const picked = BAUCUA_SYMBOL_BY_KEY[guess];

  if (!picked) {
    await interaction.reply({
      content: 'Con bạn đặt không hợp lệ, chọn lại giúp mình nha.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.deferReply();

  // Fast-fail before the animation; the settle below stays the source of
  // truth in case the balance changes mid-spin.
  if ((await getCoinUser(interaction.user.id)).balance < coin) {
    await replyInsufficientBalance(interaction, coin);
    return;
  }

  const result = rollBauCua(guess);
  const balanceChange = result.won ? coin * result.multiplier : -coin;

  try {
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(0xf1c40f)
          .setTitle('🎲 Đang lắc bầu cua...')
          .setDescription(`Bạn đặt **${picked.label} ${picked.emoji}** • Cược **${formatCoins(coin)} 🪙**`),
      ],
    });
    await new Promise((resolve) => setTimeout(resolve, BAUCUA_ROLL_DELAY_MS));
  } catch (error) {
    logger.warn(
      {
        err: error,
        userId: interaction.user.id,
      },
      'Failed to show baucua animation',
    );
  }

  const faces = result.faces.map((face) => BAUCUA_SYMBOL_BY_KEY[face]!.emoji).join('  │  ');

  const gameResult = await applyGameResult({
    userId: interaction.user.id,
    game: 'baucua',
    coin,
    balanceChange,
    won: result.won,
  });

  if (!gameResult) {
    await replyInsufficientBalance(interaction, coin);
    return;
  }
  const { user } = gameResult;

  const finalReply = {
    embeds: [
      new EmbedBuilder()
        .setColor(result.won ? 0x2ecc71 : 0xe74c3c)
        .setTitle(
          result.won
            ? `🎲 Ra ${result.count} ${picked.label} — Bạn thắng!`
            : `🎲 Không ra ${picked.label} — Bạn thua!`,
        )
        .setDescription(
          result.won
            ? `# │  ${faces}  │\n**+${formatCoins(balanceChange)} 🪙** (x${result.multiplier} tiền cược).\n\n${balanceText(user)}`
            : `# │  ${faces}  │\n**-${formatCoins(coin)} 🪙**.\n\n${balanceText(user)}`,
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
      'Failed to show baucua result',
    );
    await interaction.followUp(finalReply);
  }
}
