import { GoogleGenAI } from '@google/genai';
import { GEMINI_MODELS, GEMINI_SYSTEM_PROMPT } from './config.js';
import { isRetryableError } from './errors.js';
import { withTimeout } from './timeout.js';

function buildContents(contents) {
  return GEMINI_SYSTEM_PROMPT + contents;
}

export async function generateContentStreamWithFallback(ai, contents) {
  let lastError;
  const startedAt = Date.now();
  const text = buildContents(contents);

  for (const model of GEMINI_MODELS) {
    try {
      const responseStream = await withTimeout(ai.models.generateContentStream({
        model: model.id,
        contents: text,
      }));

      return {
        responseStream,
        model: model.label,
        startedAt,
      };
    } catch (err) {
      lastError = err;

      if (isRetryableError(err)) {
        console.warn(`Gemini API error for ${model.id}: ${err?.status ?? 'unknown'} - ${err?.message ?? err}. Trying next model...`);
        continue;
      }

      throw err;
    }
  }

  throw lastError;
}