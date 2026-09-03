import { parseGeminiModels } from './parse';

export const GEMINI_DEFAULT_TIMEOUT_MS = 15_000;

// Per-model response timeouts (ms). Models not listed use GEMINI_DEFAULT_TIMEOUT_MS.
const GEMINI_MODEL_TIMEOUTS_MS: Record<string, number> = {
  'gemini-3.5-flash-lite': 30_000,
  'gemini-3.7-flash': 30_000,
  'gemini-3.6-flash': 30_000,
};

export function getGeminiTimeoutMs(model: string): number {
  return GEMINI_MODEL_TIMEOUTS_MS[model] ?? GEMINI_DEFAULT_TIMEOUT_MS;
}

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

export class GeminiApiKeyForSummaryError extends Error {
  constructor() {
    super('GEMINI_API_KEY_FOR_SUMMARY is not configured.');
    this.name = 'GeminiApiKeyForSummaryError';
  }
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export function isGeminiSummaryConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY_FOR_SUMMARY);
}

// The order in GEMINI_MODELS is the fallback priority.
export function getGeminiModels(): string[] {
  return parseGeminiModels(process.env.GEMINI_MODELS);
}
