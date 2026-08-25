import { SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from '../../types/command.ts';
import { logger } from '../../logging/logger.ts';
import { buildDictionaryEmbed } from './utils/embed.ts';
import { fetchDictionary, WordNotFoundError } from './utils/fetch.ts';
import { parseDictionary } from './utils/parse.ts';

const command: SlashCommand = {
  // prettier-ignore
  data: new SlashCommandBuilder()
    .setName('dictionary')
    .setDescription('Tra từ điển tiếng Anh (định nghĩa, phiên âm, từ đồng nghĩa/trái nghĩa, ...)')
    .addStringOption((option) =>
      option
        .setName('text')
        .setDescription('Nhập từ tiếng Anh cần tra')
        .setRequired(true),
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const text = interaction.options.getString('text', true);

    try {
      const data = await fetchDictionary(text);
      const parsed = parseDictionary(data, text);
      const embed = buildDictionaryEmbed(parsed);

      if ((embed.data.fields?.length ?? 0) === 0) {
        await interaction.editReply({ content: 'Không có nội dung phù hợp để hiển thị.' });
        return;
      }

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      if (error instanceof WordNotFoundError) {
        await interaction.editReply({
          content: error.message,
        });
        return;
      }

      logger.error({ err: error, word: text }, 'Lỗi khi lấy từ điển');
      await interaction.editReply({
        content: 'Đã xảy ra lỗi khi tra từ điển.',
      });
    }
  },
};

export default command;
