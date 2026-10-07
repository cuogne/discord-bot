import type { JackpotHitKey } from '../../types.ts';

export type SlotSymbol = '💩' | '🍒' | '🍊' | '🍇' | '⭐' | '💎' | '7️⃣';
export type SlotSymbols = [SlotSymbol, SlotSymbol, SlotSymbol];

export type JackpotPrize =
  | { chancePercent: number; kind: 'miss'; multiplier: -1 }
  | { chancePercent: number; kind: 'match'; symbol: SlotSymbol; multiplier: number };

export type MissPattern = 'ABA' | 'ABC' | 'AAB' | 'ABB';

export interface MissPatternChance {
  chancePercent: number;
  pattern: MissPattern;
}

export interface JackpotConfig {
  /** Every symbol that can appear on a reel. */
  symbols: readonly SlotSymbol[];
  /** Number of roll units. One unit equals 100 / rollRange %. */
  rollRange: number;
  /** Prize table. chancePercent of all prizes must total 100. */
  prizes: ReadonlyArray<JackpotPrize>;
  /** Pattern odds after a normal miss. Order determines each pattern's roll interval. */
  missPatterns: ReadonlyArray<MissPatternChance>;
}

// Single source of truth for odds, symbols and rewards.
// key for tracking hits
export const JACKPOT_CONFIG: JackpotConfig = {
  symbols: ['💩', '🍒', '🍊', '🍇', '⭐', '💎', '7️⃣'],
  rollRange: 1_000, // to round percentages to integer units (0.8% -> 8 units)
  prizes: [
    { chancePercent: 0.8, kind: 'match', symbol: '💎', multiplier: 5 },
    { chancePercent: 23.2, kind: 'match', symbol: '🍒', multiplier: 1 },
    { chancePercent: 1.2, kind: 'match', symbol: '💩', multiplier: -2 },
    { chancePercent: 5.2, kind: 'match', symbol: '🍇', multiplier: 3 },
    { chancePercent: 58.8, kind: 'miss', multiplier: -1 },
    { chancePercent: 2.5, kind: 'match', symbol: '⭐', multiplier: 4 },
    { chancePercent: 8, kind: 'match', symbol: '🍊', multiplier: 2 },
    { chancePercent: 0.3, kind: 'match', symbol: '7️⃣', multiplier: 7 },
  ],
  missPatterns: [
    { chancePercent: 7, pattern: 'ABA' }, // [🍒, ⭐, 🍒]
    { chancePercent: 60, pattern: 'ABC' }, // [💎, 🍊, 💩]
    { chancePercent: 26, pattern: 'AAB' }, // [💎, 💎, 🍇]
    { chancePercent: 7, pattern: 'ABB' }, // [7️⃣, 🍇, 🍇]
  ],
};

export const HIT_KEY_BY_SYMBOL: Record<SlotSymbol, JackpotHitKey> = {
  '💩': 'poop',
  '🍒': 'cherry',
  '🍊': 'orange',
  '🍇': 'grape',
  '⭐': 'star',
  '💎': 'diamond',
  '7️⃣': 'seven',
};
