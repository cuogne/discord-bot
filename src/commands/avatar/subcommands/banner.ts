import { EmbedBuilder, MessageFlags } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';

export async function handleAvatarBanner(interaction: ChatInputCommandInteraction) {
  const user = interaction.options.getUser('user', true);

  const fetched = await interaction.client.users.fetch(user.id, {
    force: true,
  });

  const bannerUrl = fetched.bannerURL({ size: 4096 });

  if (!bannerUrl) {
    await interaction.reply({
      content: `${user} chưa có ảnh bìa!`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.deferReply();

  const embed = new EmbedBuilder()
    .setDescription(`### ${interaction.user} muốn xem ảnh bìa của ${user}`)
    .setImage(bannerUrl)
    .setColor(0x0099ff)
    .setFooter({
      text: `Requested by ${interaction.user.username}`,
      iconURL: interaction.user.displayAvatarURL(),
    })
    .setTimestamp();

  await interaction.editReply({
    embeds: [embed],
  });
}
