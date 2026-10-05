import { EmbedBuilder, type ChatInputCommandInteraction } from 'discord.js';
import { getCoinUser } from '../database/users.ts';
import { formatCoins } from './format.ts';

export async function replyInsufficientBalance(
  interaction: ChatInputCommandInteraction,
  coin: number,
): Promise<void> {
  const user = await getCoinUser(interaction.user.id);
  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle('🪙 Không đủ số dư')
        .setDescription(
          `Bạn không đủ 🪙 để cược **${formatCoins(coin)} 🪙**.\n\n` +
            `Số dư hiện tại: **${formatCoins(user.balance)} 🪙**.`,
        ),
    ],
  });
}
