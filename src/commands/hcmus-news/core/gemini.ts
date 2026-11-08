import { getGeminiSummaryClient } from '../../../core/gemini/client.ts';
import { isGeminiSummaryConfigured } from '../../../core/gemini/config.ts';
import { generateWithModelFallback } from '../../../core/gemini/fallback.ts';
import { logger } from '../../../logging/logger.ts';
import { buildSummarizeSystemInstruction } from '../utils/prompt.ts';

export interface SummarizeResult {
  summary: string;
  model?: string;
  prompt_token: number;
  completion_token: number;
}

export async function summarizeNewsWithGemini(
  content: string,
  title?: string,
): Promise<SummarizeResult> {
  if (!isGeminiSummaryConfigured()) {
    logger.warn('GEMINI_API_KEY_FOR_SUMMARY is not configured. Skipping news summarization.');
    return {
      summary: '',
      prompt_token: 0,
      completion_token: 0,
    };
  }

  // const trimmedContent = content.trim();
  // if (trimmedContent.length < 50) {
  //   return {
  //     summary: '',
  //   };
  // }

  let attemptedModel: string | undefined;

  try {
    const ai = getGeminiSummaryClient();

    const { result, model } = await generateWithModelFallback(async (modelId) => {
      attemptedModel = modelId;
      return ai.models.generateContent({
        model: modelId,
        contents: content.trim(),
        config: {
          systemInstruction: buildSummarizeSystemInstruction(),
          temperature: 0.5,
          responseMimeType: 'text/plain',
        },
      });
    });

    const summary = (result.text ?? '').toString().trim();

    const usage = result.usageMetadata;
    const prompt_token = usage?.promptTokenCount;
    const completion_token = usage?.candidatesTokenCount;

    return {
      summary,
      model,
      prompt_token: prompt_token ?? 0,
      completion_token: completion_token ?? 0,
    };
  } catch (err) {
    logger.error(
      {
        err,
        model: attemptedModel,
        ...(title ? { title } : {}),
      },
      'Failed to summarize news with Gemini',
    );
    return {
      summary: '',
      model: attemptedModel,
      prompt_token: 0,
      completion_token: 0,
    };
  }
}
