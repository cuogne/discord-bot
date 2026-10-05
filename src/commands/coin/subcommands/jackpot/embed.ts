import { EmbedBuilder } from 'discord.js';
import { COIN_COLOR } from '../../config.ts';
import type { SlotSymbol } from './config.ts';
import type { JackpotResult } from './game.ts';
import type { CoinUser } from '../../types.ts';
import { formatCoins } from '../../utils/format.ts';

export interface JackpotRound {
  result: JackpotResult;
  user: CoinUser;
  coin: number;
  balanceChange: number;
}

function displaySlots(symbols: readonly SlotSymbol[], revealedCount: number): string {
  return symbols.map((symbol, index) => (index < revealedCount ? symbol : '❔')).join('  │  ');
}

export function buildJackpotEmbed(round: JackpotRound, revealedCount: number): EmbedBuilder {
  const { result, user, coin, balanceChange } = round;
  const isFinalFrame = revealedCount === result.symbols.length;
  const slots = `# │  ${displaySlots(result.symbols, revealedCount)}  │`;
  const embed = new EmbedBuilder()
    .setColor(isFinalFrame ? (result.won ? 0x2ecc71 : 0xe74c3c) : COIN_COLOR)
    .setTitle('🎰 JACKPOT')
    .setDescription(slots);

  if (!isFinalFrame) {
    return embed.setFooter({ text: `Đang quay... ${revealedCount}/3` });
  }

  const changeText = `${balanceChange > 0 ? '+' : ''}${formatCoins(balanceChange)}`;
  const multiplierText =
    result.multiplier < 0
      ? `-x${Math.abs(result.multiplier)} tiền cược`
      : `x${result.multiplier} tiền cược`;
  const prizeSymbol = result.multiplier === -1 ? '❌' : result.symbols[0];
  const cappedLoss = balanceChange > coin * result.multiplier;

  return embed.setDescription(
    `${slots}\n\n` +
      `Cược: **${formatCoins(coin)}** 🪙 | ${prizeSymbol} ${multiplierText}\n\n` +
      `${result.won ? 'Bạn thắng' : 'Bạn thua'}: **${changeText} 🪙**${cappedLoss ? ' (đã chạm số dư 0)' : ''}\n\n` +
      `**Số dư hiện tại: ${formatCoins(user.balance)}** 🪙`,
  );
}
