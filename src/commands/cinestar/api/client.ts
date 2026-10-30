import { fetchWithTimeout } from '../../../utils/http.ts';
import { logger } from '../../../logging/logger.ts';
import type {
  CachedMovie,
  Cinema,
  CinemaMovie,
  CinestarHomeResponse,
  ComingMovie,
  ShowtimesResponse,
} from '../types/types.ts';

const CINESTAR_BOOKING_URL = 'https://cinestar.com.vn/book-tickets';

export async function getLinkApi(): Promise<string> {
  const response = await fetchWithTimeout(CINESTAR_BOOKING_URL);
  if (!response.ok) throw new Error(`Cinestar page responded with ${response.status}`);

  const html = await response.text();
  const buildId = html.match(/"buildId":"([^"]+)"/)?.[1];
  if (!buildId) throw new Error('Cinestar buildId not found');

  return `https://cinestar.com.vn/_next/data/${buildId}/index.json`;
}

async function fetchHomeData(): Promise<CinestarHomeResponse> {
  const response = await fetchWithTimeout(await getLinkApi());
  if (!response.ok) {
    throw new Error(`Cinestar API responded with ${response.status}`);
  }
  return (await response.json()) as CinestarHomeResponse;
}

export async function fetchComingMovies(): Promise<ComingMovie[]> {
  const data = await fetchHomeData();
  return data.pageProps?.res?.listComingMovie ?? [];
}

async function fetchMovieData(
  id: string | number,
  cinema: Cinema,
  day: string,
): Promise<CinemaMovie[]> {
  const params = new URLSearchParams({
    movie_id: String(id),
    area_id: cinema.area_id,
    id_Server: cinema.server_id,
    date: day,
    id_MovieTheater: cinema.cinema_id,
  });
  const response = await fetchWithTimeout(
    `https://cinestar.com.vn/api/showTime/?${params.toString()}`,
  );
  if (!response.ok) {
    throw new Error(`Cinestar showtime request for movie ${id} returned HTTP ${response.status}`);
  }

  const data = (await response.json()) as ShowtimesResponse;
  return data.data?.filter((movie) => movie.id != null) ?? [];
}

function toCachedMovies(movie: CinemaMovie, date: string, cinema: Cinema): CachedMovie[] {
  const movies: CachedMovie[] = [];

  for (const schedule of movie.schedule ?? []) {
    if (schedule.date !== date) continue;

    const showtimes = (schedule.times ?? [])
      .map((time) => time.time)
      .filter((time): time is string => Boolean(time));
    const showtimeId = schedule.times?.[0]?.showtime_id;
    if (showtimes.length === 0 || movie.id == null || !movie.name_vn) continue;

    movies.push({
      title: movie.name_vn,
      date,
      showtimes,
      image: movie.image ?? '',
      bookingUrl: `https://cinestar.com.vn/movie/${movie.id}/?id=${cinema.area_id}&id_sv=${cinema.server_id}&show_time=${showtimeId ?? ''}&date=${date}`,
      genre: movie.type_name_vn ?? '',
      duration: movie.time_m ?? '',
      country: movie.country_name_vn ?? '',
      language: movie.language_vn ?? '',
      brief: movie.brief_vn ?? '',
      trailer: movie.trailer ? `https://youtu.be/${movie.trailer}` : null,
    });
  }

  return movies;
}

export async function fetchTodayMovies(cinema: Cinema, date: string): Promise<CachedMovie[]> {
  const homeData = await fetchHomeData();
  const movieIds = [
    ...new Set(
      (homeData.pageProps?.res?.listMovie ?? [])
        .map((movie) => movie.id)
        .filter((id): id is string | number => id != null)
        .map(String),
    ),
  ];
  const day = date.split('/')[0]!;

  const results = await Promise.all(
    movieIds.map(async (id) => {
      try {
        const movies = await fetchMovieData(id, cinema, day);
        return { movies: movies.flatMap((movie) => toCachedMovies(movie, date, cinema)) };
      } catch (error) {
        return {
          error: new Error(`Cinestar movie ${id} showtimes failed for ${cinema.name} on ${date}`, {
            cause: error,
          }),
        };
      }
    }),
  );

  const failures = results.flatMap((result) => (result.error ? [result.error] : []));
  const successfulRequests = results.filter((result) => result.movies !== undefined).length;

  if (successfulRequests === 0 && failures.length > 0) {
    throw new AggregateError(
      failures,
      `All Cinestar showtime requests failed for ${cinema.name} on ${date}`,
    );
  }

  for (const failure of failures) {
    logger.warn({ err: failure }, 'Failed to fetch Cinestar movie showtimes');
  }

  return results.flatMap((result) => result.movies ?? []);
}
