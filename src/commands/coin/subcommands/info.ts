import { EmbedBuilder } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import { COIN_COLOR } from '../config.ts';
import { getCoinUser } from '../database/users.ts';
import { formatCoins, jackpotStatsText, statsText } from '../utils/format.ts';

export async function handleCoinInfo(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply();
  const user = await getCoinUser(interaction.user.id);

  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setColor(COIN_COLOR)
        .setAuthor({
          name: `Thông tin coin của ${interaction.user.displayName}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setDescription(`👤 User: ${interaction.user}`)
        .setThumbnail(interaction.user.displayAvatarURL())
        .addFields(
          { name: '🪙 Số dư hiện tại', value: `**${formatCoins(user.balance)}** 🪙`, inline: true },
          {
            name: '💰 Tổng coin kiếm được',
            value: `**${formatCoins(user.totalEarned)}** 🪙`,
            inline: true,
          },
          { name: '🔥 Daily streak', value: `**${user.dailyStreak}** ngày`, inline: true },
          { name: '\n', value: '\n' },
          { name: '🪙 Flip', value: statsText(user.flip), inline: true },
          { name: '🎲 Dice', value: statsText(user.dice), inline: true },
          { name: '\n', value: '\n' },
          { name: '🎰 Jackpot', value: jackpotStatsText(user.jackpot, user.jackpotHits) },
        ),
    ],
  });
}
