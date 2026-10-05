export type CoinGame = 'flip' | 'dice' | 'jackpot' | 'baucua';

export interface CoinGameStats {
  wins: number;
  losses: number;
  totalWagered: number;
  netCoins: number;
}

export interface CoinUser {
  userId: string;
  balance: number;
  totalEarned: number;
  dailyStreak: number;
  lastDailyDate: string | null;
  flip: CoinGameStats;
  dice: CoinGameStats;
  jackpot: CoinGameStats;
  jackpotHits: JackpotHits;
  baucua: CoinGameStats;
  createdAt: Date;
  updatedAt: Date;
}

export type JackpotHitKey =
  | 'miss'
  | 'poop'
  | 'cherry'
  | 'orange'
  | 'grape'
  | 'star'
  | 'diamond'
  | 'seven';

export type JackpotHits = Record<JackpotHitKey, number>;

export interface DailyClaimResult {
  claimed: boolean;
  user: CoinUser;
  /** Actual coins granted by this claim (0 when already claimed). */
  reward: number;
}
