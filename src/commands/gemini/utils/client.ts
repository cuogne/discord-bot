import type { GenerateContentResponse, GoogleGenAI } from '@google/genai';
import { logger } from '../../../logging/logger.ts';
import { GEMINI_MODELS, GEMINI_SYSTEM_PROMPT } from './config.ts';
import { isRetryableError } from './errors.ts';
import { withTimeout } from './timeout.ts';

export interface StreamResult {
  responseStream: AsyncGenerator<GenerateContentResponse>;
  model: string;
}

function buildContents(contents: string): string {
  return GEMINI_SYSTEM_PROMPT + contents;
}

export async function generateContentStreamWithFallback(
  ai: GoogleGenAI,
  contents: string,
): Promise<StreamResult> {
  let lastError: unknown;
  const text = buildContents(contents);

  for (const model of GEMINI_MODELS) {
    try {
      const responseStream = await withTimeout(
        ai.models.generateContentStream({
          model: model.id,
          contents: text,
        }),
      );

      return {
        responseStream,
        model: model.id,
      };
    } catch (err) {
      lastError = err;

      if (isRetryableError(err)) {
        const e = err as { status?: number; message?: string };
        logger.warn(
          { model: model.id, status: e?.status ?? 'unknown', err },
          'Gemini API error, trying next model...',
        );
        continue;
      }

      throw err;
    }
  }

  throw lastError;
}
