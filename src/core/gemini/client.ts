import { GoogleGenAI } from '@google/genai';
import { GeminiApiKeyError, GeminiApiKeyForSummaryError } from './config.ts';

let sharedClient: GoogleGenAI;
let sharedSummaryClient: GoogleGenAI;

// use singleton pattern
export function getGeminiClient(): GoogleGenAI {
  if (!process.env.GEMINI_API_KEY) {
    throw new GeminiApiKeyError();
  }

  if (!sharedClient) {
    sharedClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  return sharedClient;
}

export function getGeminiSummaryClient(): GoogleGenAI {
  if (!process.env.GEMINI_API_KEY_FOR_SUMMARY) {
    throw new GeminiApiKeyForSummaryError();
  }

  if (!sharedSummaryClient) {
    sharedSummaryClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY_FOR_SUMMARY,
    });
  }

  return sharedSummaryClient;
}
