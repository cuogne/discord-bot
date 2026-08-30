import type { GoogleGenAI } from '@google/genai';
import { generateWithModelFallback } from '../../../core/gemini/fallback.ts';

export interface OmikujiGenerationResult {
  text: string;
  model: string;
  tokensInput: number;
  tokensOutput: number;
}

export async function generateOmikujiMessage(
  ai: GoogleGenAI,
  prompt: string,
): Promise<OmikujiGenerationResult> {
  const { result: response, model } = await generateWithModelFallback((modelId) =>
    ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    }),
  );

  return {
    text: response.text ?? '',
    model,
    tokensInput: response.usageMetadata?.promptTokenCount ?? 0,
    tokensOutput: response.usageMetadata?.candidatesTokenCount ?? 0,
  };
}
