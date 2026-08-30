import type { GoogleGenAI, Part } from '@google/genai';
import { generateWithModelFallback } from '../../../core/gemini/fallback.ts';
import { GEMINI_SYSTEM_PROMPT } from '../utils/config.ts';
import type { GeminiAttachment } from '../types/types.ts';
import type { StreamResult } from '../types/types.ts';

export async function generateContentStreamWithFallback(
  ai: GoogleGenAI,
  contents: string,
  attachment?: GeminiAttachment,
  selectedModel?: string,
): Promise<StreamResult> {
  const text = `${GEMINI_SYSTEM_PROMPT}\n\n${contents}`;

  // If there's an attachment, we need to send it as inline data along with the text.
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

  const { result: responseStream, model } = await generateWithModelFallback(
    (modelId) =>
      ai.models.generateContentStream({
        model: modelId,
        contents: requestContents,
      }),
    selectedModel,
  );

  return { responseStream, model };
}
