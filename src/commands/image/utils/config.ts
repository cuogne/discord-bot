import type { ImageSource } from '../types/types.ts';

export const IMAGE_SOURCES: Record<string, ImageSource | undefined> = {
  cat: {
    url: 'https://api.thecatapi.com/v1/images/search',
    label: 'mèo',
  },
  dog: {
    url: 'https://api.thedogapi.com/v1/images/search',
    label: 'chó',
  },
};
