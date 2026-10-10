import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import { logger } from '../../logging/logger.ts';
import type { SlashCommand } from '../../types/command.ts';
import { handleUserCooldown } from '../../utils/cooldown.ts';
import { DeepLRequestError, DeepLResponseError, translateText } from './api/client.ts';
import { DeepLConfigError, getDeepLConfig } from './api/config.ts';
import { buildTranslationPresentation } from './utils/embed.ts';

const TRANSLATE_COOLDOWN_MS = 10_000;

const command: SlashCommand = {
  // prettier-ignore
  data: new SlashCommandBuilder()
    .setName('translate')
    .setDescription('Dịch văn bản, tự nhận biết ngôn ngữ gốc')
    .addStringOption((option) =>
      option
        .setName('to')
        .setDescription('Ngôn ngữ đích')
        .setRequired(true)
        .addChoices(
          { name: '🇻🇳 Tiếng Việt', value: 'VI' },
          { name: '🇺🇸 Tiếng Anh (Mỹ)', value: 'EN-US' },
          { name: '🇬🇧 Tiếng Anh (Anh)', value: 'EN-GB' },
          { name: '🇯🇵 Tiếng Nhật', value: 'JA' },
          { name: '🇰🇷 Tiếng Hàn', value: 'KO' },
          { name: '🇨🇳 Tiếng Trung', value: 'ZH' },
          { name: '🇫🇷 Tiếng Pháp', value: 'FR' },
          { name: '🇩🇪 Tiếng Đức', value: 'DE' },
          { name: '🇪🇸 Tiếng Tây Ban Nha', value: 'ES' },
          { name: '🇧🇷 Tiếng Brazil', value: 'PT-BR' },
        )
    )
    .addStringOption((option) =>
      option
        .setName('text')
        .setDescription('Nội dung cần dịch (tối đa 1000 ký tự)')
        .setRequired(true)
        .setMaxLength(1000),
    ),

  async execute(interaction) {
    const original = interaction.options.getString('text', true).trim();
    const targetLanguage = interaction.options.getString('to', true);

    if (!original) {
      // prettier-ignore
      await interaction.reply({
        content: 'Bạn cần nhập nội dung để dịch.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    let config;
    try {
      config = getDeepLConfig();
    } catch (error) {
      if (error instanceof DeepLConfigError) {
        // prettier-ignore
        await interaction.reply({
          content: 'Bot chưa cấu hình DeepL API. Vui lòng báo cho quản trị viên.',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      throw error;
    }

    if (await handleUserCooldown(interaction, TRANSLATE_COOLDOWN_MS)) {
      return;
    }

    await interaction.deferReply();

    try {
      const result = await translateText(original, targetLanguage, config);
      const presentation = buildTranslationPresentation(original, targetLanguage, result);

      // prettier-ignore
      await interaction.editReply({
        embeds: [presentation.embed],
        files: presentation.files,
        allowedMentions: {
          parse: []
        },
      });
    } catch (error) {
      if (error instanceof DeepLRequestError) {
        logger.warn(
          {
            status: error.status,
            userId: interaction.user.id,
            command: 'translate',
          },
          'DeepL translation request failed',
        );

        const message =
          error.status === 429
            ? 'DeepL đang nhận quá nhiều yêu cầu. Vui lòng thử lại sau.'
            : error.status === 456
              ? 'DeepL đã hết hạn mức dịch. Vui lòng thử lại sau.'
              : error.status === 403
                ? 'Bot không thể xác thực với DeepL. Vui lòng báo cho quản trị viên.'
                : 'Không thể dịch nội dung lúc này. Vui lòng thử lại sau.';

        // prettier-ignore
        await interaction.editReply({
          content: message,
        });
        return;
      }

      // prettier-ignore
      logger.error(
        {
          err: error,
          userId: interaction.user.id,
          command: 'translate',
        },
        error instanceof DeepLResponseError
          ? 'DeepL returned an invalid response'
          : 'Failed to translate text',
      );
      // prettier-ignore
      await interaction.editReply({
        content: 'Không thể dịch nội dung lúc này. Vui lòng thử lại sau.',
      });
    }
  },
};

export default command;
