import type { ChatInputCommandInteraction } from 'discord.js';
import { logger } from '../../../logging/logger.ts';
import { getCinema } from '../data/cinemas.ts';
import { fetchTodayMovies } from '../api/client.ts';
import { buildMovieSelect } from '../utils/components.ts';
import { getToday } from '../utils/date.ts';
import { buildTodayEmbed } from '../utils/embed.ts';
import {
  getScheduleFilePath,
  hasFreshScheduleCache,
  readScheduleCache,
  removeOldScheduleCaches,
  writeScheduleCache,
} from '../utils/storage.ts';

export async function handleToday(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply();

  const cinemaName = interaction.options.getString('cinema', true);
  const cinema = getCinema(cinemaName);
  if (!cinema) {
    await interaction.editReply('Không tìm thấy rạp Cinestar được chọn.');
    return;
  }

  const today = getToday();
  const filePath = getScheduleFilePath(cinema, today);

  try {
    if (!hasFreshScheduleCache(cinema, today)) {
      removeOldScheduleCaches(today);
      await interaction.editReply('🔄 Đang cập nhật lịch chiếu phim...');
      const movies = await fetchTodayMovies(cinema, today);
      writeScheduleCache(filePath, movies);
    }

    const movies = readScheduleCache(filePath);
    writeScheduleCache(filePath, movies);
    if (movies.length === 0) {
      await interaction.editReply('Không có lịch chiếu phim cho hôm nay.');
      return;
    }

    await interaction.editReply({
      embeds: [buildTodayEmbed(cinema, today)],
      components: [
        buildMovieSelect(
          cinema.file_id,
          movies.map((movie) => movie.title),
        ),
      ],
    });
  } catch (error) {
    logger.error(
      {
        err: error,
        cinema: cinema.name,
        date: today,
      },
      'Lỗi khi lấy lịch chiếu Cinestar',
    );
    await interaction.editReply('Có lỗi xảy ra khi cập nhật lịch chiếu phim.');
  }
}
