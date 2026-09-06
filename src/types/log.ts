export interface GeminiUsageLog {
  responseTime: string;
  tokensInput: number;
  tokensOutput: number;
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
  error?: string;
}
