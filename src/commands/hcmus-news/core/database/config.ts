import type { Model } from 'mongoose';
import { useMongoDatabase } from '../../../../core/database/mongodb/index.ts';
import { getVNTimeNow } from '../../../../utils/date.ts';
import type { IUserConfig } from '../../types/types.ts';
import { userConfigSchema } from './schema.ts';

function getUserConfigModel(): Model<IUserConfig> {
  const connection = useMongoDatabase().getConnection();
  return (
    (connection.models.UserConfig as Model<IUserConfig>) ||
    connection.model<IUserConfig>('UserConfig', userConfigSchema)
  );
}

export async function getUserConfig(guildId: string): Promise<IUserConfig | null> {
  const model = getUserConfigModel();
  return model.findOne({ guildId }).lean<IUserConfig | null>();
}

export async function saveUserConfig(
  data: Omit<IUserConfig, 'setupAt'> & { setupAt?: Date },
): Promise<IUserConfig> {
  const model = getUserConfigModel();
  const doc = await model.findOneAndUpdate(
    { guildId: data.guildId },
    {
      $set: {
        channelId: data.channelId,
        channelName: data.channelName,
        guildName: data.guildName,
        userSetup: data.userSetup,
        userId: data.userId,
        setupAt: data.setupAt ?? getVNTimeNow(),
        isActive: data.isActive,
      },
    },
    { upsert: true, returnDocument: 'after' },
  );

  return doc.toObject();
}

export async function deleteUserConfig(guildId: string): Promise<boolean> {
  const model = getUserConfigModel();
  const res = await model.deleteOne({ guildId });
  return res.deletedCount > 0;
}

export async function getActiveUserConfigs(): Promise<IUserConfig[]> {
  const model = getUserConfigModel();
  return model.find({ isActive: true }).lean<IUserConfig[]>();
}
