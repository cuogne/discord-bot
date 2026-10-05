import type { CoinGameStats, CoinUser, JackpotHits } from '../types.ts';
import { JACKPOT_CONFIG } from '../subcommands/jackpot/config.ts';
import { jackpotHitKeyForPrize } from '../subcommands/jackpot/game.ts';

export function formatCoins(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount);
}

export function balanceText(user: CoinUser): string {
  return `**Số dư hiện tại: ${formatCoins(user.balance)}** 🪙`;
}

export function statsText(stats: CoinGameStats): string {
  const total = stats.wins + stats.losses;
  const sign = stats.netCoins > 0 ? '+' : '';

  return [
    `**${formatCoins(total)}** lượt • Thắng **${formatCoins(stats.wins)}** • Thua **${formatCoins(stats.losses)}**`,
    `Lãi/lỗ: **${sign}${formatCoins(stats.netCoins)}** 🪙`,
  ].join('\n');
}

export function jackpotStatsText(stats: CoinGameStats, hits?: JackpotHits): string {
  const base = statsText(stats);
  if (!hits) {
    return base;
  }

  const items = JACKPOT_CONFIG.prizes.map((prize) => {
    const count = hits[jackpotHitKeyForPrize(prize)] ?? 0;
    const label = prize.kind === 'miss' ? 'Trượt' : prize.symbol;
    return `${label} **${formatCoins(count)}** lần`;
  });

  const lines: string[] = [];
  for (let i = 0; i < items.length; i += 4) {
    lines.push(items.slice(i, i + 4).join(' • '));
  }

  return `${base}\n\n**Trúng:**\n${lines.join('\n')}`;
}
