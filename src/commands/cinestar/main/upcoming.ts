import type { ChatInputCommandInteraction } from 'discord.js';
import { logger } from '../../../logging/logger.ts';
import { fetchComingMovies } from '../api/client.ts';
import { buildUpcomingMovieSelect } from '../utils/components.ts';
import { formatDayVN } from '../utils/date.ts';
import { buildUpcomingEmbed } from '../utils/embed.ts';

export async function handleUpcoming(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply();

  try {
    const movies = await fetchComingMovies();
    if (movies.length === 0) {
      await interaction.editReply('Không có lịch phim sắp chiếu.');
      return;
    }

    const options = movies.slice(0, 25).map((movie) => ({
      name: movie.name_vn ?? 'Không rõ tên phim',
      releaseDate: formatDayVN(movie.release_date?.split(' ')[0] ?? ''),
    }));

    await interaction.editReply({
      embeds: [buildUpcomingEmbed()],
      components: [buildUpcomingMovieSelect(options)],
    });
  } catch (error) {
    logger.error(
      {
        err: error,
      },
      'Lỗi khi lấy lịch phim sắp chiếu Cinestar',
    );
    await interaction.editReply('Có lỗi khi lấy lịch phim sắp chiếu tại Cinestar.');
  }
}
