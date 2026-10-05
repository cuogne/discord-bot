import { randomInt } from 'node:crypto';
import {
  BAUCUA_CONFIG,
  BAUCUA_PAYOUT_MULTIPLIER,
  type BauCuaSymbolKey,
} from './config.ts';

type RandomInteger = (maxExclusive: number) => number;

export interface BauCuaResult {
  faces: BauCuaSymbolKey[];
  /** How many dice show the guessed symbol. */
  count: number;
  /** Profit multiplier for this count. */
  multiplier: number;
  won: boolean;
}

export function rollBauCua(guess: BauCuaSymbolKey, random: RandomInteger = randomInt): BauCuaResult {
  const faces: BauCuaSymbolKey[] = [];

  for (let i = 0; i < BAUCUA_CONFIG.diceCount; i += 1) {
    faces.push(BAUCUA_CONFIG.symbols[random(BAUCUA_CONFIG.symbols.length)]!.key);
  }

  const count = faces.filter((face) => face === guess).length;

  return {
    faces,
    count,
    multiplier: BAUCUA_PAYOUT_MULTIPLIER[count] ?? 0,
    won: count > 0,
  };
}
