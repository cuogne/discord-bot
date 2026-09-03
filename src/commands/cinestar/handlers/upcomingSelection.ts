import { MessageFlags } from 'discord.js';
import type { StringSelectMenuInteraction } from 'discord.js';
import { logger } from '../../../logging/logger.ts';
import { fetchComingMovies } from '../api/client.ts';
import { buildTrailerButton } from '../utils/components.ts';
import { formatDayVN } from '../utils/date.ts';
import { buildUpcomingMovieEmbed } from '../utils/embed.ts';

export async function handleUpcomingMovieSelection(
  interaction: StringSelectMenuInteraction,
): Promise<void> {
  const movieIndex = Number(interaction.values[0]);
  if (!Number.isInteger(movieIndex) || movieIndex < 0) {
    await interaction.reply({
      content: 'Dữ liệu phim không hợp lệ.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.deferReply();

  try {
    const movie = (await fetchComingMovies())[movieIndex];
    if (!movie) {
      await interaction.editReply('Không tìm thấy phim được chọn.');
      return;
    }

    await interaction.editReply({
      embeds: [
        buildUpcomingMovieEmbed(movie, formatDayVN(movie.release_date?.split(' ')[0] ?? '')),
      ],
      components: movie.trailer ? [buildTrailerButton(movie.trailer)] : [],
    });
  } catch (error) {
    logger.error(
      {
        err: error,
        movieIndex,
      },
      'Lỗi khi chọn phim sắp chiếu Cinestar',
    );
    await interaction.editReply('Có lỗi xảy ra khi xử lý phim đã chọn.');
  }
}
