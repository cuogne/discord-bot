import { MessageFlags } from 'discord.js';
import type { StringSelectMenuInteraction } from 'discord.js';
import { logger } from '../../../logging/logger.ts';
import { getCinemaByFileId } from '../data/cinemas.ts';
import { getCurrentTime, getToday } from '../utils/date.ts';
import { buildMovieButtons } from '../utils/components.ts';
import { buildMovieDetailEmbed } from '../utils/embed.ts';
import { getScheduleFilePath, readScheduleCache } from '../utils/storage.ts';

export async function handleTodayMovieSelection(
  interaction: StringSelectMenuInteraction,
): Promise<void> {
  const cinemaId = interaction.customId.split('|')[1];
  const cinema = cinemaId ? getCinemaByFileId(cinemaId) : undefined;
  const movieIndex = Number(interaction.values[0]);

  if (!cinema || !Number.isInteger(movieIndex) || movieIndex < 0) {
    await interaction.reply({
      content: 'Dữ liệu phim không hợp lệ.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  try {
    const today = getToday();
    const movies = readScheduleCache(getScheduleFilePath(cinema, today));
    const movie = movies[movieIndex];

    if (!movie) {
      await interaction.reply({
        content: 'Không tìm thấy thông tin phim.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.reply({
      embeds: [buildMovieDetailEmbed(movie, cinema, getCurrentTime())],
      components: buildMovieButtons(movie.bookingUrl, movie.trailer, cinema.map_url),
    });
  } catch (error) {
    logger.error(
      {
        err: error,
        cinemaId,
        movieIndex,
      },
      'Lỗi khi chọn phim Cinestar',
    );
    await interaction.reply({
      content: 'Có lỗi xảy ra khi xử lý phim được chọn.',
      flags: MessageFlags.Ephemeral,
    });
  }
}
