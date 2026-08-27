import type { GenerateContentResponse, GoogleGenAI } from '@google/genai';
import { generateWithModelFallback } from '../../../core/gemini/client.ts';
import { GEMINI_SYSTEM_PROMPT } from './config.ts';

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
  const text = buildContents(contents);
  const { result: responseStream, model } = await generateWithModelFallback((modelId) =>
    ai.models.generateContentStream({
      model: modelId,
      contents: text,
    }),
  );

  return { responseStream, model };
}
