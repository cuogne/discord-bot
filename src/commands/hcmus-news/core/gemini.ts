import { getGeminiSummaryClient } from '../../../core/gemini/client.ts';
import { isGeminiSummaryConfigured } from '../../../core/gemini/config.ts';
import { generateWithModelFallback } from '../../../core/gemini/fallback.ts';
import { logger } from '../../../logging/logger.ts';
import { buildSummarizePrompt } from '../utils/prompt.ts';

export interface SummarizeResult {
  summary: string;
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

  const prompt = buildSummarizePrompt(content.trim());

  try {
    const ai = getGeminiSummaryClient();

    const { result } = await generateWithModelFallback(async (modelId) => {
      return ai.models.generateContent({
        model: modelId,
        contents: prompt,
      });
    });

    const summary = (result.text ?? '').toString().trim();

    const usage = result.usageMetadata;
    const prompt_token = usage?.promptTokenCount;
    const completion_token = usage?.candidatesTokenCount;

    return {
      summary,
      prompt_token: prompt_token ?? 0,
      completion_token: completion_token ?? 0,
    };
  } catch (err) {
    logger.error(
      {
        err,
        ...(title ? { title } : {}),
      },
      'Failed to summarize news with Gemini',
    );
    return {
      summary: '',
      prompt_token: 0,
      completion_token: 0,
    };
  }
}
