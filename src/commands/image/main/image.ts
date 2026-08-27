import type { ChatInputCommandInteraction } from 'discord.js';
import { logger } from '../../../logging/logger.ts';
import { fetchImage } from '../utils/api.ts';
import { buildImageEmbed } from '../utils/embed.ts';
import type { ImageSource } from '../types/types.ts';

export async function handleImage(
  interaction: ChatInputCommandInteraction,
  source: ImageSource,
): Promise<void> {
  await interaction.deferReply();

  try {
    const imageUrl = await fetchImage(source.url);
    const embed = buildImageEmbed(interaction.user.username, source.label, imageUrl);

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    logger.error(
      {
        err: error,
        animal: source.label,
      },
      'Lỗi khi lấy ảnh động vật',
    );
    await interaction.editReply({
      content: 'Đã có lỗi xảy ra khi lấy ảnh. Vui lòng thử lại sau.',
    });
  }
}
