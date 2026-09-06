import { logger } from '../../logging/logger.ts';
import { getVNTimeNow } from '../../utils/date.ts';
import {
  deleteBanRecord,
  getActiveBanRecords,
  upsertBanRecord,
} from './database.ts';
import type { IBanRecord } from './types.ts';

const activeBans = new Map<string, IBanRecord>();

export function getAdminIds(): string[] {
  return (process.env.ADMIN_BOT_ID ?? '')
    .split(/[,;\s]+/)
    .map((id) => id.trim().replace(/^['"]+|['"]+$/g, ''))
    .filter(Boolean);
}

export function isBotAdmin(userId: string): boolean {
  const adminIds = getAdminIds();
  return adminIds.includes(userId);
}

export async function initBanManager(): Promise<void> {
  try {
    const bans = await getActiveBanRecords();
    activeBans.clear();

    for (const ban of bans) {
      activeBans.set(ban.userId, ban);
    }

    logger.info(
      {
        count: activeBans.size,
      },
      'Loaded active bot bans into memory',
    );
  } catch (error) {
    logger.error(
      {
        err: error,
      },
      'Failed to load active bot bans',
    );
  }
}

export function checkUserBanned(userId: string): IBanRecord | null {
  const record = activeBans.get(userId);
  if (!record) {
    return null;
  }

  if (
    record.expiresAt &&
    getVNTimeNow().getTime() >= new Date(record.expiresAt).getTime()
  ) {
    activeBans.delete(userId);
    deleteBanRecord(userId).catch((err) => {
      logger.error(
        {
          err,
          userId,
        },
        'Failed to delete expired bot ban record',
      );
    });
    return null;
  }

  return record;
}

export async function banUser(params: {
  userId: string;
  bannedBy: string;
  expiresAt: Date | null;
  reason?: string;
}): Promise<IBanRecord> {
  const record = await upsertBanRecord({
    userId: params.userId,
    bannedBy: params.bannedBy,
    expiresAt: params.expiresAt,
    reason: params.reason ?? '',
    isActive: true,
  });

  activeBans.set(params.userId, record);
  return record;
}

export async function unbanUser(userId: string): Promise<boolean> {
  activeBans.delete(userId);
  return deleteBanRecord(userId);
}
