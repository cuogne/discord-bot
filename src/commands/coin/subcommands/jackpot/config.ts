import type { JackpotHitKey } from '../../types.ts';

export type SlotSymbol = '💩' | '🍒' | '🍊' | '🍇' | '⭐' | '💎' | '7️⃣';
export type SlotSymbols = [SlotSymbol, SlotSymbol, SlotSymbol];

export type JackpotPrize =
  | { chancePercent: number; kind: 'miss'; multiplier: -1 }
  | { chancePercent: number; kind: 'match'; symbol: SlotSymbol; multiplier: number };

export interface JackpotConfig {
  /** Every symbol that can appear on a reel. */
  symbols: readonly SlotSymbol[];
  /** Number of roll units. One unit equals 100 / rollRange %. */
  rollRange: number;
  /** Prize table. chancePercent of all prizes must total 100. */
  prizes: ReadonlyArray<JackpotPrize>;
}

// Single source of truth for odds, symbols and rewards.
// key for tracking hits
export const JACKPOT_CONFIG: JackpotConfig = {
  symbols: ['💩', '🍒', '🍊', '🍇', '⭐', '💎', '7️⃣'],
  rollRange: 1_000,
  prizes: [
    { chancePercent: 1, kind: 'match', symbol: '💩', multiplier: -2 },
    { chancePercent: 68, kind: 'miss', multiplier: -1 },
    { chancePercent: 21, kind: 'match', symbol: '🍒', multiplier: 2 },
    { chancePercent: 5, kind: 'match', symbol: '🍊', multiplier: 3 },
    { chancePercent: 3, kind: 'match', symbol: '🍇', multiplier: 4 },
    { chancePercent: 1, kind: 'match', symbol: '⭐', multiplier: 5 },
    { chancePercent: 0.7, kind: 'match', symbol: '💎', multiplier: 6 },
    { chancePercent: 0.3, kind: 'match', symbol: '7️⃣', multiplier: 7 },
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
