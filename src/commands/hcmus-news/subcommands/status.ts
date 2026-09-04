import { EmbedBuilder, MessageFlags } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import { logger } from '../../../logging/logger.ts';
import { getUserConfig } from '../core/database/config.ts';

export async function handleStatusSubcommand(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  await interaction.deferReply({
    flags: MessageFlags.Ephemeral,
  });

  if (!interaction.guild) {
    await interaction.editReply({
      content: 'Lệnh này chỉ có thể sử dụng trong server!',
    });
    return;
  }

  try {
    const config = await getUserConfig(interaction.guildId ?? '');
    const channelExists = Boolean(
      config?.channelId && interaction.guild.channels.cache.has(config.channelId),
    );

    if (!config || !config.isActive) {
      const notSetupEmbed = new EmbedBuilder()
        .setTitle('📊 Trạng thái HCMUS News')
        .setDescription('Server này hiện **chưa thiết lập** nhận thông báo tin tức từ HCMUS.')
        .setColor(0x999999)
        .addFields({
          name: '💡 Hướng dẫn kích hoạt',
          value: 'Sử dụng lệnh `/hcmus-news setup` để chọn kênh nhận tin.',
          inline: false,
        });

      await interaction.editReply({
        embeds: [notSetupEmbed],
      });
      return;
    }

    const setupTimeSec = Math.floor(new Date(config.setupAt).getTime() / 1000);
    const channelDisplay = channelExists
      ? `<#${config.channelId}> (#${config.channelName})`
      : `#${config.channelName} *(Kênh không tồn tại hoặc bot mất quyền xem)*`;

    const embed = new EmbedBuilder()
      .setTitle('📊 Trạng thái HCMUS News')
      .setColor(0x00ff00)
      .addFields(
        {
          name: '📍 Kênh nhận thông báo',
          value: channelDisplay,
          inline: false,
        },
        {
          name: '👤 Người setup',
          value: config.userId ? `<@${config.userId}>` : (config.userSetup ?? 'Không rõ'),
          inline: true,
        },
        {
          name: '📅 Thời gian setup',
          value: `<t:${setupTimeSec}:F> (<t:${setupTimeSec}:R>)`,
          inline: true,
        },
        {
          name: '🟢 Trạng thái',
          value: config.isActive ? 'Đang hoạt động' : 'Tạm dừng',
          inline: false,
        },
      );

    await interaction.editReply({
      embeds: [embed],
    });
  } catch (error) {
    logger.error(
      {
        err: error,
      },
      'Error retrieving subscription status',
    );
    await interaction.editReply({
      content: 'Có lỗi xảy ra khi kiểm tra trạng thái cấu hình.',
    });
  }
}
