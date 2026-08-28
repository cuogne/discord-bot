import type { GenerateContentResponse, GoogleGenAI, Part } from '@google/genai';
import { generateWithModelFallback } from '../../../core/gemini/client.ts';
import { GEMINI_SYSTEM_PROMPT } from './config.ts';
import type { GeminiAttachment } from '../types/types.ts';

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
  attachment?: GeminiAttachment,
): Promise<StreamResult> {
  const text = buildContents(contents);
  const requestContents: string | Part[] = attachment
    ? [
        { text },
        {
          inlineData: {
            mimeType: attachment.mimeType,
            data: attachment.data,
          },
        },
      ]
    : text;
  const { result: responseStream, model } = await generateWithModelFallback((modelId) =>
    ai.models.generateContentStream({
      model: modelId,
      contents: requestContents,
    }),
  );

  return { responseStream, model };
}
