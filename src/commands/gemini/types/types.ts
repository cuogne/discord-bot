import type { GenerateContentResponse } from '@google/genai';

export type GeminiAttachmentKind = 'image' | 'pdf' | 'text';

export interface GeminiAttachment {
  kind: GeminiAttachmentKind;
  name: string;
  url: string;
  mimeType: string;
  data: string;
  size: number;
}

export interface StreamResult {
  responseStream: AsyncGenerator<GenerateContentResponse>;
  model: string;
}

export interface TavilySource {
  title: string;
  url: string;
}

export interface TavilyWebContext {
  /** Preformatted context block to inject into the Gemini prompt. */
  contextBlock: string;
  sources: TavilySource[];
  resultCount: number;
  searchTimeSeconds?: number;
}

export interface TavilySearchResult {
  title?: string;
  url?: string;
  content?: string;
  score?: number;
}

export interface TavilySearchResponse {
  results?: TavilySearchResult[];
  response_time?: number;
}
