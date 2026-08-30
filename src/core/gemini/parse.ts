import { GeminiConfigError } from './config';

export function parseGeminiModels(value: string | undefined): string[] {
  const models = (value ?? '')
    .split(',')
    .map((model) => model.trim().replace(/^['"]+|['"]+$/g, ''))
    .filter(Boolean);

  if (models.length === 0) {
    throw new GeminiConfigError();
  }

  return models;
}
