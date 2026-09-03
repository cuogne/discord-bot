import { EmbedBuilder, MessageFlags } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import { banUser, checkUserBanned, isBotAdmin, parseBanDuration } from '../../../core/ban/index.ts';
import { logger } from '../../../logging/logger.ts';
import { formatVNStoredDate, getVNTimeNow } from '../../../utils/date.ts';

export async function handleBanUsebot(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!isBotAdmin(interaction.user.id)) {
    await interaction.reply({
      content: 'Bạn không có quyền sử dụng lệnh này!',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const targetUser = interaction.options.getUser('user', true);
  const timeInput = interaction.options.getString('time', true);
  const reason = interaction.options.getString('reason') ?? undefined;

  if (targetUser.id === interaction.client.user.id) {
    await interaction.reply({
      content: 'Không thể cấm chính bot!',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (isBotAdmin(targetUser.id)) {
    await interaction.reply({
      content: 'Không thể cấm Admin sử dụng bot!',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const duration = parseBanDuration(timeInput);
  if (!duration) {
    await interaction.reply({
      content: 'Thời gian không hợp lệ!',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const existingBan = checkUserBanned(targetUser.id);
  let targetExpiresAt: Date | null = null;
  let isAccumulated = false;

  if (duration.durationMs === null) {
    // Vĩnh viễn được chọn -> chuyển thành vĩnh viễn
    targetExpiresAt = null;
  } else if (existingBan) {
    if (existingBan.expiresAt === null) {
      // Đã bị cấm vĩnh viễn trước đó -> giữ nguyên vĩnh viễn
      targetExpiresAt = null;
    } else {
      // Cộng dồn vào thời hạn hiện tại
      const baseTime = Math.max(
        getVNTimeNow().getTime(),
        new Date(existingBan.expiresAt).getTime(),
      );
      targetExpiresAt = new Date(baseTime + duration.durationMs);
      isAccumulated = true;
    }
  } else {
    // Người dùng chưa bị cấm -> tính từ hiện tại
    targetExpiresAt = duration.expiresAt;
  }

  try {
    const banRecord = await banUser({
      userId: targetUser.id,
      bannedBy: interaction.user.id,
      expiresAt: targetExpiresAt,
      reason: reason ?? existingBan?.reason,
    });

    const expiryDisplay = banRecord.expiresAt
      ? formatVNStoredDate(new Date(banRecord.expiresAt))
      : 'Vĩnh viễn';

    const timeValue = banRecord.expiresAt
      ? isAccumulated
        ? `+${duration.label} (${expiryDisplay})`
        : `${duration.label} (${expiryDisplay})`
      : 'Vĩnh viễn';

    const embed = new EmbedBuilder()
      .setColor(0xed4245)
      .setDescription(`Đã cấm người dùng ${targetUser} sử dụng bot`)
      .setThumbnail(targetUser.displayAvatarURL({ size: 256 }))
      .addFields(
        {
          name: 'Thời gian',
          value: timeValue,
          inline: true,
        },
        {
          name: 'Lý do',
          value: reason || existingBan?.reason || 'Không có',
          inline: false,
        },
      );

    await interaction.reply({
      embeds: [embed],
    });
  } catch (error) {
    logger.error(
      {
        err: error,
        targetUserId: targetUser.id,
      },
      'Lỗi khi thực hiện cấm người dùng',
    );
    await interaction.reply({
      content: 'Có lỗi xảy ra khi lưu thông tin cấm người dùng!',
      flags: MessageFlags.Ephemeral,
    });
  }
}
