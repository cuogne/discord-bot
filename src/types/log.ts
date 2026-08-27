export interface CommandUsageLog {
  userId: string;
  user: string;
  command: string;
  options: Record<string, unknown>;
  guildId: string;
  guild: string;
  channelId: string;
  channel: string;
}
