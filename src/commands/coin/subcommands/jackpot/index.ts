import type { ChatInputCommandInteraction } from 'discord.js';
import { applyGameResult } from '../../database/users.ts';
import { jackpotHitKey, rollJackpot } from './game.ts';
import { replyInsufficientBalance } from '../../utils/reply.ts';
import { animateJackpot } from './animation.ts';

export async function handleCoinJackpot(interaction: ChatInputCommandInteraction): Promise<void> {
  const coin = interaction.options.getInteger('amount', true);
  await interaction.deferReply();

  const result = rollJackpot();
  const gameResult = await applyGameResult({
    userId: interaction.user.id,
    game: 'jackpot',
    coin,
    balanceChange: coin * result.multiplier,
    won: result.won,
    jackpotHit: jackpotHitKey(result),
  });

  if (!gameResult) {
    await replyInsufficientBalance(interaction, coin);
    return;
  }

  await animateJackpot(interaction, {
    result,
    user: gameResult.user,
    coin,
    balanceChange: gameResult.balanceChange,
  });
}
