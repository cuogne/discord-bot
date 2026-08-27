export class GeminiConfigError extends Error {
  constructor() {
    super('GEMINI_MODELS is not configured. Add at least one model to the environment.');
    this.name = 'GeminiConfigError';
  }
}

function parseGeminiModels(value: string | undefined): string[] {
  const models = (value ?? '')
    .split(',')
    .map((model) => model.trim().replace(/^['"]+|['"]+$/g, ''))
    .filter(Boolean);

  if (models.length === 0) {
    throw new GeminiConfigError();
  }

  return models;
}

// The order in GEMINI_MODELS is the fallback priority.
export function getGeminiModels(): string[] {
  return parseGeminiModels(process.env.GEMINI_MODELS);
}

export const GEMINI_TIMEOUT_MS = 15_000;
