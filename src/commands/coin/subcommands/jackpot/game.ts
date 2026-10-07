import { randomInt } from 'node:crypto';
import type { JackpotHitKey } from '../../types.ts';
import {
  HIT_KEY_BY_SYMBOL,
  JACKPOT_CONFIG,
  type JackpotPrize,
  type MissPatternChance,
  type SlotSymbol,
  type SlotSymbols,
} from './config.ts';
import { JACKPOT_MISS_PATTERN_WEIGHTS, JACKPOT_PRIZE_WEIGHTS } from './weights.ts';

type RandomInteger = (maxExclusive: number) => number;

export interface JackpotResult {
  symbols: SlotSymbols;
  multiplier: number;
  won: boolean;
}

function rollWeightedOption<T>(
  random: RandomInteger,
  options: ReadonlyArray<T>,
  weights: ReadonlyArray<number>,
): T {
  // use cumulative subtraction.
  let remaining = random(JACKPOT_CONFIG.rollRange);
  for (const [index, option] of options.entries()) {
    const weight = weights[index]!;
    if (remaining < weight) {
      return option;
    }
    remaining -= weight;
  }

  // if we reach here, the weights are misconfigured and don't sum to JACKPOT_CONFIG.rollRange
  throw new Error('Jackpot roll did not match any configured option');
}

function rollPrize(random: RandomInteger): JackpotPrize {
  return rollWeightedOption(random, JACKPOT_CONFIG.prizes, JACKPOT_PRIZE_WEIGHTS);
}

function rollMissPattern(random: RandomInteger): MissPatternChance {
  return rollWeightedOption(random, JACKPOT_CONFIG.missPatterns, JACKPOT_MISS_PATTERN_WEIGHTS);
}

function rollThreeDifferentSymbols(random: RandomInteger): SlotSymbols {
  const pool = [...JACKPOT_CONFIG.symbols]; // ['💩', '🍒', '🍊', '🍇', '⭐', '💎', '7️⃣' ]
  const selected: SlotSymbol[] = [];

  for (let i = 0; i < 3; i += 1) {
    const index = random(pool.length);

    // get a random symbol and remove it from the pool to ensure uniqueness
    selected.push(pool.splice(index, 1)[0]!);
  }

  return selected as SlotSymbols;
}

function rollTwoMatchingSymbols(random: RandomInteger, differentIndex: 0 | 1 | 2): SlotSymbols {
  // On a miss, choose both symbols uniformly. Prize odds do not apply here.
  const repeated = JACKPOT_CONFIG.symbols[random(JACKPOT_CONFIG.symbols.length)]!;
  const others = JACKPOT_CONFIG.symbols.filter((symbol) => symbol !== repeated);
  const different = others[random(others.length)]!;
  const symbols: SlotSymbols = [repeated, repeated, repeated];
  symbols[differentIndex] = different;
  return symbols;
}

function rollMissSymbols(random: RandomInteger): SlotSymbols {
  const { pattern } = rollMissPattern(random);
  switch (pattern) {
    case 'ABA':
      return rollTwoMatchingSymbols(random, 1);
    case 'ABC':
      return rollThreeDifferentSymbols(random);
    case 'AAB':
      return rollTwoMatchingSymbols(random, 2);
    case 'ABB':
      return rollTwoMatchingSymbols(random, 0);
  }
}

export function rollJackpot(random: RandomInteger = randomInt): JackpotResult {
  const prize = rollPrize(random);

  // Misses never display three matching symbols.
  if (prize.kind === 'miss') {
    return {
      symbols: rollMissSymbols(random),
      multiplier: -1,
      won: false,
    };
  }

  // kind === 'match' means the player won, so we display three matching symbols.
  return {
    symbols: [prize.symbol, prize.symbol, prize.symbol],
    multiplier: prize.multiplier,
    won: prize.multiplier > 0,
  };
}

export function jackpotHitKey(result: JackpotResult): JackpotHitKey {
  const [first, second, third] = result.symbols;
  if (first === second && second === third) {
    return HIT_KEY_BY_SYMBOL[first];
  }
  return 'miss';
}

export function jackpotHitKeyForPrize(prize: JackpotPrize): JackpotHitKey {
  return prize.kind === 'miss' ? 'miss' : HIT_KEY_BY_SYMBOL[prize.symbol];
}
