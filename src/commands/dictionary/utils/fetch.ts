import type { DictionaryEntry } from '../types/types.ts';

const API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';

export class WordNotFoundError extends Error {
  constructor(word: string) {
    super(`Không tìm thấy từ "${word}". Kiểm tra lại chính tả.`);
    this.name = 'WordNotFoundError';
  }
}

export async function fetchDictionary(word: string): Promise<DictionaryEntry[]> {
  const link = `${API_URL}/${encodeURIComponent(word)}`;

  const response = await fetch(link);
  if (!response.ok) {
    throw new WordNotFoundError(word);
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data) || data.length === 0) {
    throw new WordNotFoundError(word);
  }

  return data as DictionaryEntry[];
}
