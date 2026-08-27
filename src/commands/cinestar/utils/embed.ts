import { EmbedBuilder } from 'discord.js';
import type { CachedMovie, Cinema, ComingMovie } from '../types/types.ts';

const CINESTAR_COLOR = 0x0099ff;
const MAX_DESCRIPTION_LENGTH = 1024;

function truncate(value: string, maxLength = MAX_DESCRIPTION_LENGTH): string {
  return value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value;
}

export function buildTodayEmbed(cinema: Cinema, date: string): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle('📑 Danh sách các phim đang chiếu tại Cinestar')
    .setDescription(
      `**🎬 Rạp**: ${cinema.name}\n\n` +
        `**📅 Ngày**: ${date}\n\n` +
        `📍 **Địa chỉ**: ${cinema.address}\n\n` +
        `🗺️ **Bản đồ**: [Mở Google Maps](${cinema.map_url})\n\n` +
        'Chọn phim bạn muốn xem lịch chiếu hôm nay:',
    )
    .setImage(cinema.image)
    .setColor(CINESTAR_COLOR);
}

export function buildMovieDetailEmbed(
  movie: CachedMovie,
  cinema: Cinema,
  currentTime: string,
): EmbedBuilder {
  const upcomingTimes = [...new Set(movie.showtimes)].filter((time) => time > currentTime).sort();
  const schedule =
    upcomingTimes.length > 0
      ? upcomingTimes.map((time) => `\`${time}\``).join('  ')
      : 'Không còn suất chiếu nào trong hôm nay';

  const embed = new EmbedBuilder()
    .setTitle(`🎬 ${movie.title}`)
    .setColor(CINESTAR_COLOR)
    .addFields(
      { name: '📅 Ngày chiếu', value: movie.date, inline: true },
      { name: '⏱️ Thời lượng', value: `${movie.duration || 'N/A'} phút`, inline: true },
      { name: '📽️ Rạp', value: cinema.name, inline: true },
      { name: '🎭 Thể loại', value: movie.genre || 'N/A', inline: true },
      { name: '📝 Ngôn ngữ', value: movie.language || 'N/A', inline: true },
      {
        name: '📑 Nội dung phim',
        value: truncate(movie.brief || 'N/A'),
      },
      { name: '🕐 Lịch chiếu', value: schedule },
    );

  if (movie.image) embed.setThumbnail(movie.image);
  return embed;
}

export function buildUpcomingEmbed(): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle('📑 Danh sách các phim sắp chiếu tại Cinestar')
    .setDescription('Chọn một bộ phim bên dưới để xem thông tin chi tiết.')
    .setColor(CINESTAR_COLOR);
}

export function buildUpcomingMovieEmbed(movie: ComingMovie, formatDate: string): EmbedBuilder {
  const description = [
    `**📅 Ngày khởi chiếu:** ${formatDate}`,
    `**⏳ Thời lượng:** ${movie.time ?? 'N/A'} phút`,
    `**🎭 Thể loại:** ${movie.type_name_vn ?? 'N/A'}`,
    '',
    '**📒 Giới thiệu phim:**',
    (movie.brief_vn ?? 'N/A').split('. ').join('.\n'),
  ].join('\n');

  const embed = new EmbedBuilder()
    .setTitle(`🎬 ${movie.name_vn ?? 'Không rõ tên phim'}`)
    .setDescription(description)
    .setColor(CINESTAR_COLOR)
    .setFooter({
      text: 'Cinestar',
    });

  if (movie.image) embed.setThumbnail(movie.image);
  return embed;
}
