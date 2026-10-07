import { HIT_KEY_BY_SYMBOL, JACKPOT_CONFIG, type JackpotConfig } from './config.ts';

// One roll unit is 0.1%; validate both tables once when this module loads.
function resolveChanceWeights(
  chances: ReadonlyArray<number>,
  rollRange: number,
  tableName: string,
): ReadonlyArray<number> {
  const weights = chances.map((chancePercent) => (chancePercent * rollRange) / 100);
  if (
    weights.some((weight) => !Number.isSafeInteger(weight) || weight < 0) ||
    weights.reduce((sum, weight) => sum + weight, 0) !== rollRange
  ) {
    throw new Error(`${tableName} chances must total 100% in whole roll units`);
  }

  return weights;
}

function resolvePrizeWeights(config: JackpotConfig): ReadonlyArray<number> {
  const weights = resolveChanceWeights(
    config.prizes.map((prize) => prize.chancePercent),
    config.rollRange,
    'Jackpot prize',
  );

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

function resolveMissPatternWeights(config: JackpotConfig): ReadonlyArray<number> {
  const patterns = config.missPatterns.map((entry) => entry.pattern);
  if (
    patterns.length !== 4 ||
    new Set(patterns).size !== 4 ||
    !(['ABA', 'ABC', 'AAB', 'ABB'] as const).every((pattern) => patterns.includes(pattern))
  ) {
    throw new Error('Jackpot miss patterns must contain ABA, ABC, AAB, and ABB once each');
  }

  return resolveChanceWeights(
    config.missPatterns.map((entry) => entry.chancePercent),
    config.rollRange,
    'Jackpot miss pattern',
  );
}

export const JACKPOT_PRIZE_WEIGHTS = resolvePrizeWeights(JACKPOT_CONFIG);
export const JACKPOT_MISS_PATTERN_WEIGHTS = resolveMissPatternWeights(JACKPOT_CONFIG);
