import { EmbedBuilder, MessageFlags } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';

export async function handleAvatarServer(interaction: ChatInputCommandInteraction) {
  if (!interaction.inGuild() || !interaction.guild) {
    await interaction.reply({
      content: 'Lệnh này chỉ dùng trong server thôi nhé!',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const guild = interaction.guild;

  if (!interaction.client.guilds.cache.has(guild.id)) {
    await interaction.reply({
      content: 'Bot chưa nằm trong server này nên không lấy được ảnh!',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const imgServer = guild.iconURL({ size: 4096 });

  if (!imgServer) {
    await interaction.reply({
      content: 'Server này chưa có ảnh đại diện!',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const embed = new EmbedBuilder()
    .setDescription(`### ${interaction.user} muốn xem ảnh của server ${guild.name}`)
    .setImage(imgServer)
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
