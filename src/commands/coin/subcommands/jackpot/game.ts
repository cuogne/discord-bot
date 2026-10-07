import { randomInt } from 'node:crypto';
import type { JackpotHitKey } from '../../types.ts';
import {
  HIT_KEY_BY_SYMBOL,
  JACKPOT_CONFIG,
  type JackpotConfig,
  type JackpotPrize,
  type SlotSymbol,
  type SlotSymbols,
} from './config.ts';

type RandomInteger = (maxExclusive: number) => number;

export interface JackpotResult {
  symbols: SlotSymbols;
  multiplier: number;
  won: boolean;
}

// Fail fast on misconfiguration instead of silently paying wrong odds.
function resolvePrizeWeights(config: JackpotConfig): ReadonlyArray<number> {
  const weights = config.prizes.map((prize) => prize.chancePercent * 10);
  if (
    weights.some((weight) => !Number.isSafeInteger(weight) || weight < 0) ||
    weights.reduce((sum, weight) => sum + weight, 0) !== config.rollRange
  ) {
    throw new Error('Jackpot chances must be non-negative multiples of 0.1% totaling 100%');
  }

  for (const prize of config.prizes) {
    if (prize.kind === 'match' && !config.symbols.includes(prize.symbol)) {
      throw new Error(`Jackpot prize symbol ${prize.symbol} is missing from config symbols`);
    }
  }

  for (const symbol of config.symbols) {
    if (!(symbol in HIT_KEY_BY_SYMBOL)) {
      throw new Error(`Jackpot symbol ${symbol} is missing a hit-tracking key`);
    }
  }

  return weights;
}

const JACKPOT_PRIZE_WEIGHTS: ReadonlyArray<number> = resolvePrizeWeights(JACKPOT_CONFIG);

function prizeForRoll(roll: number): JackpotPrize {
  let upperBound = 0;

  for (let index = 0; index < JACKPOT_CONFIG.prizes.length; index += 1) {
    upperBound += JACKPOT_PRIZE_WEIGHTS[index]!;
    if (roll < upperBound) {
      return JACKPOT_CONFIG.prizes[index]!;
    }
  }

  throw new Error(`Invalid jackpot roll: ${roll}`);
}

function rollMissSymbols(random: RandomInteger): SlotSymbols {
  // Conditional on a miss: 23% AAB, 6% ABA, 6% BAA, 65% all distinct.
  const patternRoll = random(100);
  if (patternRoll < 35) {
    const repeated = JACKPOT_CONFIG.symbols[random(JACKPOT_CONFIG.symbols.length)]!;
    const differentSymbols = JACKPOT_CONFIG.symbols.filter((symbol) => symbol !== repeated);
    const different = differentSymbols[random(differentSymbols.length)]!;

    if (patternRoll < 23) {
      return [repeated, repeated, different];
    }
    if (patternRoll < 29) {
      return [repeated, different, repeated];
    }
    return [different, repeated, repeated];
  }

  const pool = [...JACKPOT_CONFIG.symbols];
  const selected: SlotSymbol[] = [];

  for (let i = 0; i < 3; i += 1) {
    const index = random(pool.length);
    selected.push(pool.splice(index, 1)[0]!);
  }

  return selected as SlotSymbols;
}

export function rollJackpot(random: RandomInteger = randomInt): JackpotResult {
  const roll = random(JACKPOT_CONFIG.rollRange);
  const prize = prizeForRoll(roll);

  // Misses never display three matching symbols.
  if (prize.kind === 'miss') {
    return {
      symbols: rollMissSymbols(random),
      multiplier: -1,
      won: false,
    };
  }

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
