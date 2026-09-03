import { Schema } from 'mongoose';
import { getVNTimeNow } from '../../../../utils/date.ts';
import type { INewsConfig, IUserConfig } from '../../types/types.ts';

export const userConfigSchema = new Schema<IUserConfig>(
  {
    guildId: { type: String, required: true, unique: true },
    guildName: { type: String },
    channelId: { type: String, required: true },
    channelName: { type: String },
    userSetup: { type: String },
    userId: { type: String },
    setupAt: { type: Date, default: getVNTimeNow },
    isActive: { type: Boolean, default: true },
  },
  { collection: 'userConfigs' },
);

export const newsConfigSchema = new Schema<INewsConfig>(
  {
    category: { type: String, required: true, index: true },
    url: { type: String, required: true, unique: true },
    title: { type: String, default: '' },
    summary: { type: String, default: '' },
    sentAt: { type: Date, default: getVNTimeNow, index: true },
    prompt_token: { type: Number, default: 0 },
    completion_token: { type: Number, default: 0 },
  },
  { collection: 'newsConfigs' },
);

newsConfigSchema.index({ category: 1, sentAt: -1 });
