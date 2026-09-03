import { EmbedBuilder, MessageFlags } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import { checkUserBanned, isBotAdmin, unbanUser } from '../../../core/ban/index.ts';
import { logger } from '../../../logging/logger.ts';

export async function handleUnbanUsebot(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!isBotAdmin(interaction.user.id)) {
    await interaction.reply({
      content: 'Bạn không có quyền sử dụng lệnh này!',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const targetUser = interaction.options.getUser('user', true);
  const existingBan = checkUserBanned(targetUser.id);

  if (!existingBan) {
    await interaction.reply({
      content: `Người dùng ${targetUser} hiện không bị cấm dùng bot.`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  try {
    await unbanUser(targetUser.id);

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setDescription(`Đã gỡ cấm người dùng ${targetUser} sử dụng bot`);
    // .setThumbnail(targetUser.displayAvatarURL({ size: 256 }));

    await interaction.reply({
      embeds: [embed],
    });
  } catch (error) {
    logger.error(
      {
        err: error,
        targetUserId: targetUser.id,
      },
      'Lỗi khi gỡ cấm người dùng',
    );
    await interaction.reply({
      content: 'Có lỗi xảy ra khi gỡ cấm người dùng!',
      flags: MessageFlags.Ephemeral,
    });
  }
}
