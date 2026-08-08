import { GoogleGenAI } from '@google/genai';
import { getContentFromURL } from './getContent.js';
import 'dotenv/config';

const GEMINI_MODELS = [
  "gemini-3.5-flash-lite",
	"gemini-3.6-flash",
	"gemini-3.5-flash",
];
const GEMINI_TIMEOUT_MS = 30_000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(err) {
  const status = err?.status ?? err?.code ?? err?.statusCode;
  const message = (err?.message ?? '').toString().toLowerCase();

  return status === 429
    || status === 503
    || message.includes('429')
    || message.includes('503')
    || message.includes('quota')
    || message.includes('rate limit')
    || message.includes('resource exhausted')
    || message.includes('high demand')
    || message.includes('unavailable');
}

function isTimeoutError(err) {
  return err?.name === 'TimeoutError';
}

function withTimeout(promise) {
  return Promise.race([
    promise,
    sleep(GEMINI_TIMEOUT_MS).then(() => {
      const err = new Error('Gemini request timed out');
      err.name = 'TimeoutError';
      throw err;
    }),
  ]);
}

async function generateContentWithFallback(ai, contents) {
  let lastError;

  for (const model of GEMINI_MODELS) {
    try {
      const response = await withTimeout(ai.models.generateContent({
        model,
        contents,
      }));

      return response;
    } catch (err) {
      lastError = err;

      if (isRetryableError(err)) {
        console.warn(`Gemini API error for ${model}: ${err?.status ?? 'unknown'} - ${err?.message ?? err}. Trying next model...`);
        continue;
      }

      throw err;
    }
  }

  throw lastError;
}

export async function summarizeNewsWithGemini(content){
  if (!process.env.GEMINI_API_KEY) {
    console.log("ko co api key")
    return "";
  }

  if (!content || content.trim() === "") {
    return "";
  }

  const prompt = `
		Bạn là một biên tập viên tóm tắt tin tức chuyên nghiệp. Nhiệm vụ của bạn là:
		- Tóm tắt nội dung tin tức sau không vượt quá 3 dòng -> người dùng sẽ cảm thấy quá dài và không đọc (Bắt buộc - Key).
		- Văn phong tóm tắt phải tự nhiên, không quá máy móc, bám sát nội dung bài viết.
		- Phải đi qua đủ hết nội dung của trang web, tóm tắt lại đầy đủ -> người dùng chưa cần ấn vào link vẫn có thể nắm được sơ qua nội dung chính của bài viết.
		- Chọn những dòng quan trọng/hấp dẫn để tóm tắt -> người dùng hứng thú -> vào link đọc tiếp.
		- Không cần chào hỏi, vô thẳng nội dung chính, không cần nói thêm gì khác.
		- Nếu tóm tắt xong, nội dung có câu: Trang web này sử dụng cookie, thì không ghi đoạn này, nếu không đủ nội dung thì để rỗng.
		Nội dung bài viết như sau: ${content}`;

  const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY_FOR_SUMMARY
  });

  try {
    const response = await generateContentWithFallback(ai, prompt);

    const rawText = typeof response.text === 'function' ? await response.text() : response.text;
    const result = (rawText ?? '').toString();

    return result
  } catch (err) {
    console.error('Gemini command error:', err);
    if (isTimeoutError(err)) {
      return "";
    }

    return "";
  }
}