import type { ChatInputCommandInteraction } from 'discord.js';
import { applyGameResult, getCoinUser } from '../../database/users.ts';
import { rollJackpot, jackpotHitKey } from './game.ts';
import { replyInsufficientBalance } from '../../utils/reply.ts';
import { revealSlots, showFinalResult } from './animation.ts';

export async function handleCoinJackpot(interaction: ChatInputCommandInteraction): Promise<void> {
  const coin = interaction.options.getInteger('amount', true);
  await interaction.deferReply();

  // Roll first, settle after the animation: if the process dies mid-spin,
  // money never moves without a result being shown. Animation frames don't
  // need settled numbers, so they use a read-only preview of the user.
  const result = rollJackpot();
  const previewUser = await getCoinUser(interaction.user.id);
  await revealSlots(interaction, {
    result,
    user: previewUser,
    coin,
    balanceChange: 0,
  });

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

  await showFinalResult(interaction, {
    result,
    user: gameResult.user,
    coin,
    balanceChange: gameResult.balanceChange,
  });
}
