import { EmbedBuilder } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import { getVietnamDateParts, VIETNAM_OFFSET_TZ } from '../../../utils/date.ts';
import { COIN_COLOR } from '../config.ts';
import { claimDaily, DAILY_REWARD } from '../database/users.ts';
import { balanceText, formatCoins } from '../utils/format.ts';

function nextVietnamMidnightUnix(now: Date): number {
  const { year, month, day } = getVietnamDateParts(now);
  const utcTime = Date.UTC(year, month - 1, day + 1) - VIETNAM_OFFSET_TZ;
  return Math.floor(utcTime / 1000);
}

export async function handleCoinDaily(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply();
  const now = new Date();
  const result = await claimDaily(interaction.user.id, now);

  if (!result.claimed) {
    const nextClaim = nextVietnamMidnightUnix(now);
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(COIN_COLOR)
          .setTitle('🪙 Bạn đã điểm danh hôm nay rồi, ngày mai hãy quay lại')
          .setDescription(`Có thể nhận tiếp <t:${nextClaim}:R>.
            \n${balanceText(result.user)}
            \n🔥**Streak hiện tại: ${result.user.dailyStreak} ngày**`),
        // .addFields({
        //   name: '🔥 Streak hiện tại',
        //   value: `${result.user.dailyStreak} ngày`,
        // }),
      ],
    });
    return;
  }

  const streakBonus = result.reward - DAILY_REWARD;

  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setColor(COIN_COLOR)
        .setTitle('🪙 Điểm danh thành công!')
        .setDescription(
          `Bạn nhận được **${formatCoins(result.reward)} 🪙**` +
            (streakBonus > 0
              ? ` (gồm ${formatCoins(DAILY_REWARD)} daily + ${formatCoins(streakBonus)} thưởng streak 🔥).`
              : '.') +
            `\n\n${balanceText(result.user)}
          \n🔥 Streak: ${result.user.dailyStreak} ngày`,
        ),
      // .addFields({
      //   name: `🔥 Streak: ${result.user.dailyStreak} ngày`,
      //   value: ' ',
      // }),
    ],
  });
}
