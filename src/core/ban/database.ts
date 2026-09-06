import type { Model } from 'mongoose';
import { useMongoDatabase } from '../database/mongodb/index.ts';
import { getVNTimeNow } from '../../utils/date.ts';
import type { IBanRecord } from './types.ts';
import { banRecordSchema } from './schema.ts';

function getBanRecordModel(): Model<IBanRecord> {
  const connection = useMongoDatabase().getConnection();
  return (
    (connection.models.BotBan as Model<IBanRecord>) ||
    connection.model<IBanRecord>('BotBan', banRecordSchema)
  );
}

export async function upsertBanRecord(
  data: Omit<IBanRecord, 'bannedAt'> & { bannedAt?: Date },
): Promise<IBanRecord> {
  const model = getBanRecordModel();
  const doc = await model.findOneAndUpdate(
    { userId: data.userId },
    {
      $set: {
        bannedBy: data.bannedBy,
        reason: data.reason ?? '',
        bannedAt: data.bannedAt ?? getVNTimeNow(),
        expiresAt: data.expiresAt,
        isActive: true,
      },
    },
    { upsert: true, returnDocument: 'after' },
  );

  return doc.toObject();
}

export async function deleteBanRecord(userId: string): Promise<boolean> {
  const model = getBanRecordModel();
  const res = await model.deleteOne({ userId });
  return res.deletedCount > 0;
}

export async function getActiveBanRecords(): Promise<IBanRecord[]> {
  const model = getBanRecordModel();
  const now = getVNTimeNow();
  return model
    .find({
      isActive: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    })
    .lean<IBanRecord[]>();
}
