import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';

export function buildMovieSelect(
  cinemaId: string,
  movieNames: string[],
): ActionRowBuilder<StringSelectMenuBuilder> {
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`cinestar_movie|${cinemaId}`)
      .setPlaceholder('Chọn phim...')
      .addOptions(
        movieNames.slice(0, 25).map((name, index) => ({
          label: name.slice(0, 100),
          value: String(index),
          description: `Phim số ${index + 1}`,
        })),
      ),
  );
}

export function buildUpcomingMovieSelect(
  movies: { name: string; releaseDate: string }[],
): ActionRowBuilder<StringSelectMenuBuilder> {
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('cinestar_upcoming_movie')
      .setPlaceholder('Chọn một bộ phim để xem thông tin chi tiết...')
      .addOptions(
        movies.slice(0, 25).map((movie, index) => ({
          label: movie.name.slice(0, 100),
          value: String(index),
          description: `Ngày chiếu: ${movie.releaseDate}`.slice(0, 100),
        })),
      ),
  );
}

export function buildMovieButtons(bookingUrl: string, trailerUrl: string | null, mapUrl: string) {
  const buttons = [
    // prettier-ignore
    new ButtonBuilder()
      .setLabel('🎟️ Đặt vé ngay')
      .setStyle(ButtonStyle.Link)
      .setURL(bookingUrl),
  ];

  if (trailerUrl) {
    buttons.push(
      // prettier-ignore
      new ButtonBuilder()
        .setLabel('🎬 Xem trailer')
        .setStyle(ButtonStyle.Link)
        .setURL(trailerUrl),
    );
  }

  buttons.push(
    // prettier-ignore
    new ButtonBuilder()
      .setLabel('📍 Địa chỉ')
      .setStyle(ButtonStyle.Link)
      .setURL(mapUrl),
  );

  return [new ActionRowBuilder<ButtonBuilder>().addComponents(buttons)];
}

export function buildTrailerButton(trailer: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setLabel('🔗 Xem trailer')
      .setStyle(ButtonStyle.Link)
      .setURL(`https://youtu.be/${trailer}`),
  );
}
