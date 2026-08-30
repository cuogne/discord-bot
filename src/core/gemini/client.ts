import { GoogleGenAI } from '@google/genai';
import { GeminiApiKeyError } from './config.ts';

let sharedClient: GoogleGenAI;

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
