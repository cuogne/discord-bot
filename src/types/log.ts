export interface GeminiUsageLog {
  responseTime: string;
  tokensInput: number;
  tokensOutput: number;
}

export interface StudocuTimingLog {
  connectionMs: number;
  navigationMs: number;
  scanMs: number;
  pdfMs: number;
  deliveryMs: number;
  pageCount: number;
  pdfBytes: number;
}

export interface CommandUsageLog {
  userId: string;
  user: string;
  command: string;
  options: Record<string, unknown>;
  guildId: string;
  guild: string;
  channelId: string;
  channel: string;
  durationMs?: number;
  gemini?: GeminiUsageLog;
  studocu?: StudocuTimingLog;
  error?: string;
}
