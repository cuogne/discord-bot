import { fetchWithTimeout } from '../../../utils/http.ts';
import type { DeepLConfig } from './config.ts';

export interface TranslationResult {
  detectedSourceLanguage: string;
  text: string;
}

export interface TranslationOptions {
  fetcher?: typeof fetchWithTimeout;
}

export class DeepLRequestError extends Error {
  constructor(public readonly status: number) {
    super(`DeepL translation request failed with HTTP ${status}`);
    this.name = 'DeepLRequestError';
  }
}

export class DeepLResponseError extends Error {
  constructor() {
    super('DeepL returned an invalid translation response');
    this.name = 'DeepLResponseError';
  }
}

export function parseTranslationResponse(payload: unknown): TranslationResult {
  if (typeof payload !== 'object' || payload === null || !('translations' in payload)) {
    throw new DeepLResponseError();
  }

  const translations = payload.translations;
  if (!Array.isArray(translations) || translations.length === 0) {
    throw new DeepLResponseError();
  }

  const first: unknown = translations[0];
  if (
    typeof first !== 'object' ||
    first === null ||
    !('text' in first) ||
    !('detected_source_language' in first) ||
    typeof first.text !== 'string' ||
    !first.text.trim() ||
    typeof first.detected_source_language !== 'string' ||
    !first.detected_source_language.trim()
  ) {
    throw new DeepLResponseError();
  }

  return {
    text: first.text,
    detectedSourceLanguage: first.detected_source_language,
  };
}

export async function translateText(
  text: string,
  targetLanguage: string,
  config: DeepLConfig,
  options: TranslationOptions = {},
): Promise<TranslationResult> {
  const body = {
    text: [text],
    target_lang: targetLanguage,
  };

  // prettier-ignore
  const response = await (options.fetcher ?? fetchWithTimeout)(config.endpoint, {
    method: 'POST',
    headers: {
      Authorization: `DeepL-Auth-Key ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new DeepLRequestError(response.status);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new DeepLResponseError();
  }

  return parseTranslationResponse(payload);
}
