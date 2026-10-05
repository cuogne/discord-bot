export type BauCuaSymbolKey = 'bau' | 'cua' | 'tom' | 'ca' | 'ga' | 'nai';

export interface BauCuaSymbol {
  key: BauCuaSymbolKey;
  label: string;
  emoji: string;
}

export interface BauCuaConfig {
  /** Symbols that can appear on a die face. */
  symbols: ReadonlyArray<BauCuaSymbol>;
  /** Number of dice rolled each round. */
  diceCount: number;
}

// Single source of truth for faces and dice count.
// Payout: profit equals stake times the number of matching dice.
export const BAUCUA_CONFIG: BauCuaConfig = {
  diceCount: 3,
  symbols: [
    { key: 'bau', label: 'Bầu', emoji: '🍐' },
    { key: 'cua', label: 'Cua', emoji: '🦀' },
    { key: 'tom', label: 'Tôm', emoji: '🦐' },
    { key: 'ca', label: 'Cá', emoji: '🐟' },
    { key: 'ga', label: 'Gà', emoji: '🐔' },
    { key: 'nai', label: 'Nai', emoji: '🦌' },
  ],
};

export const BAUCUA_SYMBOL_BY_KEY: Record<BauCuaSymbolKey, BauCuaSymbol> = Object.fromEntries(
  BAUCUA_CONFIG.symbols.map((symbol) => [symbol.key, symbol]),
) as Record<BauCuaSymbolKey, BauCuaSymbol>;

/** Profit multiplier by number of matching dice. */
export const BAUCUA_PAYOUT_MULTIPLIER: Readonly<Record<number, number>> = {
  1: 1,
  2: 3,
  3: 5,
};
