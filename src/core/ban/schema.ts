import { Schema } from 'mongoose';
import { getVNTimeNow } from '../../utils/date.ts';
import type { IBanRecord } from './types.ts';

export const banRecordSchema = new Schema<IBanRecord>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    bannedBy: { type: String, required: true },
    reason: { type: String, default: '' },
    bannedAt: { type: Date, default: getVNTimeNow },
    expiresAt: { type: Date, default: null, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { collection: 'botBans' },
);
