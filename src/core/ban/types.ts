export interface IBanRecord {
  userId: string;
  bannedBy: string;
  reason?: string;
  bannedAt: Date;
  expiresAt: Date | null;
  isActive: boolean;
}

export interface ParsedDuration {
  durationMs: number | null;
  expiresAt: Date | null;
  label: string;
}
