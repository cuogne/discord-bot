import { MessageFlags } from 'discord.js';
import type { StringSelectMenuInteraction } from 'discord.js';
import { logger } from '../../../logging/logger.ts';
import { getChatInputCommandId } from '../../../utils/command.ts';
import { HELP_PAGES } from '../utils/commands.ts';
import { buildHelpMenu, HELP_DIRECTORY_ID } from '../utils/components.ts';
import { buildHelpEmbed } from '../utils/embed.ts';

export async function handleHelpSelection(interaction: StringSelectMenuInteraction) {
  const [, ownerId] = interaction.customId.split('|');

  try {
    if (!ownerId || ownerId !== interaction.user.id) {
      // prettier-ignore
      await interaction.reply({
        content: 'Chỉ người mở /help mới chọn được danh mục.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const selectedId = interaction.values[0];
    if (
      !selectedId ||
      (selectedId !== HELP_DIRECTORY_ID && !HELP_PAGES.some((page) => page.id === selectedId))
    ) {
      // prettier-ignore
      await interaction.reply({
        content: 'Danh mục không hợp lệ. Vui lòng dùng lại /help.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (selectedId === 'hcmus') {
      await interaction.deferUpdate();

      const hcmusCommandId =
        (await getChatInputCommandId(interaction.client, 'hcmus-news')) ?? undefined;

      // prettier-ignore
      await interaction.editReply({
        embeds: [buildHelpEmbed(selectedId, interaction.client.user.displayAvatarURL(), hcmusCommandId)],
        components: [buildHelpMenu(ownerId, selectedId)],
      });
      return;
    }

    // prettier-ignore
    await interaction.update({
      embeds: [buildHelpEmbed(selectedId, interaction.client.user.displayAvatarURL())],
      components: [buildHelpMenu(ownerId, selectedId)],
    });
  } catch (error) {
    // prettier-ignore
    logger.error(
      {
        err: error,
        userId: interaction.user.id,
        customId: interaction.customId,
      },
      'Failed to handle help category selection',
    );

    if (interaction.deferred) {
      try {
        // prettier-ignore
        await interaction.editReply({
          content: 'Không thể mở danh mục lúc này. Vui lòng thử lại sau.',
          embeds: [],
          components: [],
        });
      } catch (replyError) {
        // prettier-ignore
        logger.warn(
          {
            err: replyError,
            userId: interaction.user.id,
          },
          'Failed to edit help selection error reply',
        );
      }
    } else if (!interaction.replied) {
      try {
        // prettier-ignore
        await interaction.reply({
          content: 'Không thể mở danh mục lúc này. Vui lòng thử lại sau.',
          flags: MessageFlags.Ephemeral,
        });
      } catch (replyError) {
        // prettier-ignore
        logger.warn(
          {
            err: replyError,
            userId: interaction.user.id,
          },
          'Failed to send help selection error reply',
        );
      }
    }
  }
}
