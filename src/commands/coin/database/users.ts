import type { Model } from 'mongoose';
import { useMongoDatabase } from '../../../core/database/mongodb/index.ts';
import { getVietnamDateParts } from '../../../utils/date.ts';
import { affordableBalanceChange } from '../accounting.ts';
import type { CoinGame, CoinUser, DailyClaimResult, JackpotHitKey, JackpotHits } from '../types.ts';
import { coinUserSchema } from './schema.ts';

export const DAILY_REWARD = 10_000;
export const DAILY_STREAK_BONUS = 1_000;

const EMPTY_STATS = {
  wins: 0,
  losses: 0,
  totalWagered: 0,
  netCoins: 0,
};

const EMPTY_JACKPOT_HITS: JackpotHits = {
  miss: 0,
  poop: 0,
  cherry: 0,
  orange: 0,
  grape: 0,
  star: 0,
  diamond: 0,
  seven: 0,
};

export interface AppliedGameResult {
  user: CoinUser;
  balanceChange: number;
}

function getCoinUserModel(): Model<CoinUser> {
  const connection = useMongoDatabase().getConnection();
  return (
    (connection.models.CoinUser as Model<CoinUser>) ||
    connection.model<CoinUser>('CoinUser', coinUserSchema)
  );
}

async function ensureCoinUser(userId: string): Promise<void> {
  const model = getCoinUserModel();
  await model.updateOne(
    { userId },
    {
      $setOnInsert: {
        userId,
        balance: 0,
        totalEarned: 0,
        dailyStreak: 0,
        lastDailyDate: null,
        flip: { ...EMPTY_STATS },
        dice: { ...EMPTY_STATS },
        jackpot: { ...EMPTY_STATS },
        jackpotHits: { ...EMPTY_JACKPOT_HITS },
      },
    },
    { upsert: true, setDefaultsOnInsert: true },
  );

  // Repair balances left below zero by the old -x2 jackpot calculation.
  await model.updateOne({ userId, balance: { $lt: 0 } }, { $set: { balance: 0 } });

  // Backfill jackpotHits for users created before per-symbol tracking.
  await model.updateOne(
    { userId, jackpotHits: { $exists: false } },
    { $set: { jackpotHits: { ...EMPTY_JACKPOT_HITS } } },
  );
}

export async function getCoinUser(userId: string): Promise<CoinUser> {
  await ensureCoinUser(userId);

  const user = await getCoinUserModel().findOne({ userId }).lean<CoinUser>();
  if (!user) {
    throw new Error(`Coin user ${userId} could not be created`);
  }

  return {
    ...user,
    jackpotHits: { ...EMPTY_JACKPOT_HITS, ...(user.jackpotHits ?? {}) },
  };
}

export async function claimDaily(
  userId: string,
  now: Date = new Date(),
): Promise<DailyClaimResult> {
  await ensureCoinUser(userId);

  const model = getCoinUserModel();
  const today = getVietnamDateParts(now).dateStr;
  const yesterday = getVietnamDateParts(new Date(now.getTime() - 86_400_000)).dateStr;

  // The condition and update run atomically, so concurrent daily commands can
  // never award the same user more than once per Vietnam calendar day.
  // The streak bonus uses the pre-update streak: e.g. streak 3 claims
  // DAILY_REWARD + 3 * DAILY_STREAK_BONUS, then the streak becomes 4.
  const isContinuingStreak = { $eq: ['$lastDailyDate', yesterday] };
  const dailyReward = {
    $add: [
      DAILY_REWARD,
      { $multiply: [{ $cond: [isContinuingStreak, '$dailyStreak', 0] }, DAILY_STREAK_BONUS] },
    ],
  };

  const claimedUser = await model
    .findOneAndUpdate(
      { userId, lastDailyDate: { $ne: today } },
      [
        {
          $set: {
            balance: { $add: ['$balance', dailyReward] },
            totalEarned: { $add: ['$totalEarned', dailyReward] },
            dailyStreak: {
              $cond: [isContinuingStreak, { $add: ['$dailyStreak', 1] }, 1],
            },
            lastDailyDate: today,
            updatedAt: now,
          },
        },
      ],
      { returnDocument: 'after', updatePipeline: true },
    )
    .lean<CoinUser | null>();

  if (claimedUser) {
    return {
      claimed: true,
      user: claimedUser,
      reward: DAILY_REWARD + (claimedUser.dailyStreak - 1) * DAILY_STREAK_BONUS,
    };
  }

  return {
    claimed: false,
    user: await getCoinUser(userId),
    reward: 0,
  };
}

export async function applyGameResult(params: {
  userId: string;
  game: CoinGame;
  coin: number;
  balanceChange: number;
  won: boolean;
  jackpotHit?: JackpotHitKey;
}): Promise<AppliedGameResult | null> {
  await ensureCoinUser(params.userId);

  const model = getCoinUserModel();
  const winPath = `${params.game}.wins`;
  const lossPath = `${params.game}.losses`;
  const coinPath = `${params.game}.totalWagered`;
  const netPath = `${params.game}.netCoins`;

  const updateFor = (actualBalanceChange: number) => ({
    $inc: {
      balance: actualBalanceChange,
      totalEarned: Math.max(0, actualBalanceChange),
      [winPath]: params.won ? 1 : 0,
      [lossPath]: params.won ? 0 : 1,
      [coinPath]: params.coin,
      [netPath]: actualBalanceChange,
      ...(params.jackpotHit ? { [`jackpotHits.${params.jackpotHit}`]: 1 } : {}),
    },
  });

  // Checking the balance in the update filter makes simultaneous bets safe:
  // only a bet that can afford its stake is committed.
  if (params.balanceChange >= -params.coin) {
    const user = await model
      .findOneAndUpdate(
        { userId: params.userId, balance: { $gte: params.coin } },
        updateFor(params.balanceChange),
        { returnDocument: 'after' },
      )
      .lean<CoinUser | null>();

    return user
      ? {
          user: {
            ...user,
            jackpotHits: { ...EMPTY_JACKPOT_HITS, ...(user.jackpotHits ?? {}) },
          },
          balanceChange: params.balanceChange,
        }
      : null;
  }

  // -x2 can exceed the current balance. Compare the balance we read in the
  // filter, then retry if another command changed it before our update.
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const current = await model
      .findOne({ userId: params.userId }, { balance: 1 })
      .lean<Pick<CoinUser, 'balance'> | null>();

    if (!current) {
      return null;
    }

    const actualBalanceChange = affordableBalanceChange(
      current.balance,
      params.coin,
      params.balanceChange,
    );

    if (actualBalanceChange === null) {
      return null;
    }

    const user = await model
      .findOneAndUpdate(
        {
          userId: params.userId,
          balance: current.balance,
        },
        updateFor(actualBalanceChange),
        { returnDocument: 'after' },
      )
      .lean<CoinUser | null>();

    if (user) {
      return {
        user: {
          ...user,
          jackpotHits: { ...EMPTY_JACKPOT_HITS, ...(user.jackpotHits ?? {}) },
        },
        balanceChange: actualBalanceChange,
      };
    }
  }

  throw new Error(`Could not settle ${params.game} after concurrent balance updates`);
}
