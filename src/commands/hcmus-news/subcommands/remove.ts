import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
} from 'discord.js';
import type { ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { logger } from '../../../logging/logger.ts';
import { deleteUserConfig, getUserConfig } from '../core/database/config.ts';
import { isUserAdminOrManageChannels } from '../utils/permissions.ts';

const CONFIRM_TIMEOUT_MS = 30_000;

export async function handleRemoveSubcommand(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  await interaction.deferReply({
    flags: MessageFlags.Ephemeral,
  });

  if (!interaction.inCachedGuild() || !interaction.guild) {
    await interaction.editReply({
      content: 'Lệnh này chỉ có thể sử dụng trong server!',
    });
    return;
  }

  if (!isUserAdminOrManageChannels(interaction)) {
    await interaction.editReply({
      content:
        'Bạn cần có quyền **Manage Channels** hoặc **Administrator** trong server để hủy nhận tin tức.',
    });
    return;
  }

  const guildId = interaction.guildId;
  const config = await getUserConfig(guildId);

  if (!config || !config.isActive) {
    await interaction.editReply({
      content: 'Server này hiện chưa thiết lập kênh nhận tin tức nào để xóa.',
    });
    return;
  }

  const yesId = `remove_yes_${interaction.id}`;
  const noId = `remove_no_${interaction.id}`;

  const confirmEmbed = new EmbedBuilder()
    .setTitle('🗑️ Xác nhận xóa thiết lập kênh')
    .setDescription(
      `Bạn có chắc chắn muốn hủy nhận tin tức từ HCMUS cho kênh <#${config.channelId}> (#${config.channelName ?? 'kênh đã cấu hình'}) không?`,
    )
    .addFields(
      { name: '📍 Kênh hiện tại', value: `<#${config.channelId}>`, inline: true },
      { name: '🏠 Server', value: interaction.guild.name, inline: true },
    )
    .setColor(0xff9900)
    .setFooter({
      text: 'Xác nhận sẽ hết hạn sau 30 giây',
    });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    // prettier-ignore
    new ButtonBuilder()
      .setCustomId(yesId)
      .setLabel('Xác nhận')
      .setStyle(ButtonStyle.Success),
    // prettier-ignore
    new ButtonBuilder()
      .setCustomId(noId)
      .setLabel('Hủy bỏ')
      .setStyle(ButtonStyle.Danger),
  );

  const confirmMessage = await interaction.editReply({
    embeds: [confirmEmbed],
    components: [row],
  });

  const collector = confirmMessage.createMessageComponentCollector({
    filter: (i) => i.user.id === interaction.user.id && [yesId, noId].includes(i.customId),
    time: CONFIRM_TIMEOUT_MS,
  });

  collector.on('collect', async (i) => {
    try {
      await i.deferUpdate();

      if (i.customId === noId) {
        await interaction.editReply({
          content: 'Thao tác hủy nhận tin tức đã bị hủy.',
          embeds: [],
          components: [],
        });
        collector.stop('cancelled');
        return;
      }

      await deleteUserConfig(guildId);

      await interaction.editReply({
        content: `🗑️ **Đã hủy thiết lập thành công!** Server sẽ không còn nhận thông báo tin tức từ HCMUS nữa.`,
        embeds: [],
        components: [],
      });

      // Optionally notify target channel
      const targetChannel = interaction.guild.channels.cache.get(config.channelId) as
        TextChannel | undefined;

      if (targetChannel && typeof targetChannel.send === 'function') {
        try {
          await targetChannel.send({
            content:
              '👋 **Kênh này đã được hủy nhận thông báo tin tức từ HCMUS.**\nSử dụng `/hcmus-news setup` nếu muốn kích hoạt lại.',
          });
        } catch (sendErr) {
          logger.warn(
            {
              err: sendErr,
              channelId: config.channelId,
            },
            'Failed to send cancellation notice to target channel',
          );
        }
      }

      collector.stop('success');
    } catch (err) {
      logger.error(
        {
          err,
        },
        'Error processing news subscription removal',
      );
      await interaction.editReply({
        content: 'Có lỗi xảy ra khi xóa cấu hình.',
        components: [],
      });
      collector.stop('error');
    }
  });

  collector.on('end', async (_collected, reason) => {
    if (reason === 'time') {
      try {
        await interaction.editReply({
          content: '⏰ Đã hết thời gian xác nhận (30 giây). Thao tác đã bị hủy.',
          embeds: [],
          components: [],
        });
      } catch (err) {
        logger.warn(
          {
            err,
          },
          'Error sending remove timeout message',
        );
      }
    }
  });
}
