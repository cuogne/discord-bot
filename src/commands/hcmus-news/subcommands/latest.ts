import type { ChatInputCommandInteraction } from 'discord.js';
import { logger } from '../../../logging/logger.ts';
import { getLatestNewsByCategory } from '../core/database/news.ts';
import { CATEGORY_NAMES } from '../resources/links.ts';
import type { NewsCategory } from '../types/types.ts';

export async function handleLatestSubcommand(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  await interaction.deferReply();

  try {
    const category = interaction.options.getString('category', true) as NewsCategory;
    const number = interaction.options.getInteger('number') ?? 1;

    const newsList = await getLatestNewsByCategory(category, number);

    if (newsList.length === 0) {
      const categoryName = CATEGORY_NAMES[category] ?? category;

      await interaction.editReply({
        content: `Chưa có tin tức nào cho category **${categoryName}**`,
      });
      return;
    }

    if (number === 1 || newsList.length === 1) {
      const news = newsList[0]!;
      await interaction.editReply({
        content:
          `📰 | **${news.title}**\n\n` +
          `${news.summary.trim() ? `${news.summary.trim()}\n\n` : ''}` +
          `🔗 **Chi tiết xem tại: **${news.url}`,
      });
      return;
    }

    const categoryName = CATEGORY_NAMES[category] ?? category;
    const lines = [`📰 **Tin tức mới nhất từ ${categoryName}:**`];

    newsList.forEach((news, idx) => {
      lines.push(`${idx + 1}. **${news.title}**\n🔗 <${news.url}>`);
    });

    await interaction.editReply({
      content: lines.join('\n\n'),
    });
  } catch (error) {
    logger.error(
      {
        err: error,
      },
      'Error executing /hcmus-news latest',
    );
    await interaction.editReply({
      content: 'Có lỗi xảy ra khi lấy tin tức. Vui lòng thử lại sau!',
    });
  }
}
