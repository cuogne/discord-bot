import { EmbedBuilder } from 'discord.js';

export async function getAvatarUserCommand(interaction) {
    const user = interaction.options.getUser('user') || interaction.user // lay thong tin cua nguoi can lay avt
    const avatarUrl = user.displayAvatarURL({ size: 512 }); // lay link avt

    // create embed
    const embed = new EmbedBuilder()
        .setDescription(`### ${interaction.user} muốn xem ảnh của ${user}`)
        // .setThumbnail(avatarUrl)
        .setImage(avatarUrl)
        .setColor(0x0099ff)
        .setFooter({
            text: `Requested by ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL()
        })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}
