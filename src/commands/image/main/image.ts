import type { ChatInputCommandInteraction } from 'discord.js';
import { setCommandUsageError } from '../../../logging/context.ts';
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
    setCommandUsageError(interaction, error);
    await interaction.editReply({
      content: 'Đã có lỗi xảy ra khi lấy ảnh. Vui lòng thử lại sau.',
    });
  }
}
