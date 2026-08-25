import { EmbedBuilder } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';

export async function handleAvatarUser(interaction: ChatInputCommandInteraction) {
  const user = interaction.options.getUser('user', true);
  const avatarUrl = user.displayAvatarURL({ size: 4096 });

  const embed = new EmbedBuilder()
    .setDescription(`### ${interaction.user} muốn xem ảnh của ${user}`)
    .setImage(avatarUrl)
    .setColor(0x0099ff)
    .setFooter({
      text: `Requested by ${interaction.user.username}`,
      iconURL: interaction.user.displayAvatarURL(),
    })
    .setTimestamp(); // Today at HH:MM

  await interaction.reply({
    embeds: [embed],
  });
}
