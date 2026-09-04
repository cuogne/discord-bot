import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
} from 'discord.js';
import type { ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { logger } from '../../../logging/logger.ts';
import { getUserConfig, saveUserConfig } from '../core/database/config.ts';
import {
  checkBotChannelPermissions,
  isTextChannel,
  isUserAdminOrManageChannels,
} from '../utils/permissions.ts';

const CONFIRM_TIMEOUT_MS = 30_000;

export async function handleSetupSubcommand(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  await interaction.deferReply({
    flags: MessageFlags.Ephemeral,
  });

  // check if the command is used in a guild
  if (!interaction.inCachedGuild() || !interaction.guild) {
    await interaction.editReply({
      content: 'Lệnh này chỉ có thể sử dụng trong server!',
    });
    return;
  }

  // check if the user has the required permissions (admin or manage channels)
  if (!isUserAdminOrManageChannels(interaction)) {
    await interaction.editReply({
      content:
        'Bạn cần có quyền **Manage Channels** hoặc **Administrator** trong server để thiết lập kênh nhận tin tức.',
    });
    return;
  }

  const selectedChannel = interaction.options.getChannel('channel', true);

  // check if the selected channel is a text channel
  if (!isTextChannel(selectedChannel)) {
    await interaction.editReply({
      content: 'Chỉ có thể thiết lập tin tức cho **Text Channel** trong server.',
    });
    return;
  }

  const textChannel = selectedChannel as TextChannel;
  const botUserId = interaction.client.user.id;
  const { hasPermissions, missing } = checkBotChannelPermissions(textChannel, botUserId);

  // check if the bot has the required permissions in the selected channel
  if (!hasPermissions) {
    await interaction.editReply({
      content: `Bot thiếu các quyền sau trong kênh <#${textChannel.id}>: **${missing.join(', ')}**. Vui lòng cấp quyền cho bot trước khi thiết lập!`,
    });
    return;
  }

  const guildId = interaction.guildId;
  const existingConfig = await getUserConfig(guildId);

  if (existingConfig && existingConfig.channelId === textChannel.id && existingConfig.isActive) {
    await interaction.editReply({
      content: `Kênh <#${textChannel.id}> đã được thiết lập để nhận tin tức từ trước đó rồi!`,
    });
    return;
  }

  const yesId = `setup_yes_${interaction.id}`;
  const noId = `setup_no_${interaction.id}`;

  const previousChannelDisplay = existingConfig?.channelId
    ? `<#${existingConfig.channelId}> (#${existingConfig.channelName ?? 'kênh cũ'})`
    : 'Chưa thiết lập';

  const confirmEmbed = new EmbedBuilder()
    .setTitle('📢 Xác nhận thiết lập kênh nhận tin tức')
    .setDescription(
      `Bạn có chắc chắn muốn thiết lập kênh <#${textChannel.id}> để nhận thông báo tin tức từ **HCMUS** không?`,
    )
    .addFields(
      {
        name: '📍 Kênh được chọn',
        value: `<#${textChannel.id}> (#${textChannel.name})`,
        inline: false,
      },
      {
        name: 'Kênh đã thiết lập trước đó',
        value: previousChannelDisplay,
        inline: false,
      },
      { name: '🏠 Server', value: interaction.guild.name, inline: false },
    )
    .setColor(0x0099ff)
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
          content: 'Thao tác thiết lập kênh đã bị hủy.',
          embeds: [],
          components: [],
        });
        collector.stop('cancelled');
        return;
      }

      // Save to database
      await saveUserConfig({
        guildId,
        channelId: textChannel.id,
        channelName: textChannel.name,
        guildName: interaction.guild.name,
        userSetup: interaction.user.tag,
        userId: interaction.user.id,
        isActive: true,
      });

      const successEmbed = new EmbedBuilder()
        .setTitle('Thiết lập thành công!')
        .setDescription(
          `Kênh <#${textChannel.id}> (#${textChannel.name}) đã được thiết lập để nhận tin tức tự động từ **HCMUS**.`,
        )
        .setColor(0x00ff00)
        .addFields(
          { name: '📍 Kênh nhận tin', value: `<#${textChannel.id}>`, inline: true },
          { name: '🏠 Server', value: interaction.guild.name, inline: true },
          { name: '👤 Setup bởi', value: `<@${interaction.user.id}>`, inline: true },
        )
        .setTimestamp();

      await interaction.editReply({
        embeds: [successEmbed],
        components: [],
      });

      // Send welcome message to target channel
      try {
        await textChannel.send({
          content: `🎉 **Kênh này đã được thiết lập để nhận tin tức tự động từ HCMUS!**\nSử dụng \`/hcmus-news remove\` nếu bạn muốn hủy nhận thông báo.`,
        });
      } catch (sendErr) {
        logger.warn(
          {
            err: sendErr,
            channelId: textChannel.id,
          },
          'Failed to send welcome message to setup channel',
        );
      }

      collector.stop('success');
    } catch (err) {
      logger.error(
        {
          err,
        },
        'Error processing setup confirmation',
      );
      await interaction.editReply({
        content: 'Có lỗi xảy ra trong quá trình lưu cấu hình.',
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
          'Error sending setup timeout message',
        );
      }
    }
  });
}
