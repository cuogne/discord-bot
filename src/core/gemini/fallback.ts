import { logger } from '../../logging/logger.ts';
import { getGeminiModels } from './config.ts';
import { isRetryableError } from './errors.ts';
import { withTimeout } from './timeout.ts';

export function getPreferredModels(preferredModel?: string): string[] {
  const models = getGeminiModels();

  if (!preferredModel || !models.includes(preferredModel)) {
    return models;
  }

  return [preferredModel, ...models.filter((model) => model !== preferredModel)];
}

export async function generateWithModelFallback<T>(
  generate: (modelId: string) => Promise<T>,
  preferredModel?: string,
): Promise<{ result: T; model: string }> {
  let lastError: unknown;
  const models = getPreferredModels(preferredModel);

  for (const model of models) {
    try {
      const result = await withTimeout(generate(model));
      return { result, model };
    } catch (err) {
      lastError = err;

      if (isRetryableError(err)) {
        const e = err as { status?: number };
        logger.warn(
          { model, status: e?.status ?? 'unknown', err },
          'Gemini API error, trying next model...',
        );
        continue;
      }

      throw err;
    }
  }

  throw lastError;
}
