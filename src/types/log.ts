export interface GeminiUsageLog {
  model: string;
  responseTimeMs: number;
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
  outcome: 'completed' | 'failed' | 'rejected';
  userId: string;
  interactionId: string;
  user: string;
  command: string;
  subcommand?: string;
  options: Record<string, unknown>;
  guildId: string;
  guild: string;
  channelId: string;
  channel: string;
  durationMs?: number;
  gemini?: GeminiUsageLog;
  studocu?: StudocuTimingLog;
  details?: Record<string, unknown>;
  err?: unknown;
  replyErr?: unknown;
  reason?: string;
}
