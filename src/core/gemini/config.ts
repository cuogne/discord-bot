import { parseGeminiModels } from './parse';

export const GEMINI_TIMEOUT_MS = 15_000;

export class GeminiConfigError extends Error {
  constructor() {
    super('GEMINI_MODELS is not configured. Add at least one model to the environment.');
    this.name = 'GeminiConfigError';
  }
}

export class GeminiApiKeyError extends Error {
  constructor() {
    super('GEMINI_API_KEY is not configured.');
    this.name = 'GeminiApiKeyError';
  }
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

// The order in GEMINI_MODELS is the fallback priority.
export function getGeminiModels(): string[] {
  return parseGeminiModels(process.env.GEMINI_MODELS);
}
