import { EmbedBuilder } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import { COIN_COLOR } from '../config.ts';
import { getCoinUser } from '../database/users.ts';
import { formatCoins } from '../utils/format.ts';

export async function handleCoinCash(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply();
  const user = await getCoinUser(interaction.user.id);

  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setColor(COIN_COLOR)
        .setAuthor({
          name: '💰 Cash',
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setDescription(`Số dư coin của ${interaction.user}:** ${formatCoins(user.balance)}** 🪙`),
    ],
  });
}
