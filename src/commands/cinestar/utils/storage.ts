import * as fs from 'node:fs';
import * as path from 'node:path';
import type { CachedMovie, Cinema } from '../types/types.ts';

const DATA_DIR = path.join(import.meta.dir, '..', 'data');

function ensureDataDir(): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function getScheduleFilePath(cinema: Cinema, date: string): string {
  const fileDate = date.replaceAll('/', '-');
  return path.join(DATA_DIR, `${fileDate}-${cinema.file_id}.json`);
}

export function hasFreshScheduleCache(cinema: Cinema, date: string): boolean {
  const filePath = getScheduleFilePath(cinema, date);
  if (!fs.existsSync(filePath)) return false;

  try {
    const movies = readScheduleCache(filePath);
    return movies.every((movie) => movie.date === date);
  } catch {
    return false;
  }
}

export function readScheduleCache(filePath: string): CachedMovie[] {
  const data: unknown = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!Array.isArray(data)) throw new Error('Invalid Cinestar schedule cache');

  const movies = new Map<string, CachedMovie>();
  for (const movie of data as CachedMovie[]) {
    const key = `${movie.title}\0${movie.date}`;
    const existing = movies.get(key);

    if (!existing) {
      movies.set(key, {
        ...movie,
        showtimes: [...new Set(movie.showtimes)],
      });
      continue;
    }

    existing.showtimes = [...new Set([...existing.showtimes, ...movie.showtimes])].sort();
  }

  return [...movies.values()];
}

export function writeScheduleCache(filePath: string, movies: CachedMovie[]): void {
  ensureDataDir();
  fs.writeFileSync(filePath, JSON.stringify(movies, null, 2), 'utf8');
}

export function removeOldScheduleCaches(date: string): void {
  ensureDataDir();
  const prefix = date.replaceAll('/', '-');

  for (const file of fs.readdirSync(DATA_DIR)) {
    if (file === '.gitkeep' || file.startsWith(prefix) || !file.endsWith('.json')) continue;
    fs.unlinkSync(path.join(DATA_DIR, file));
  }
}
