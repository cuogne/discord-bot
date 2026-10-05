export const COIN_COOLDOWN_MS = 10_000;

const nextAllowedAtByUser = new Map<string, number>();

/**
 * Starts a user cooldown when possible. Returns 0 when the command may run,
 * otherwise returns the number of milliseconds left on the active cooldown.
 */
export function tryStartCoinCooldown(userId: string, now = Date.now()): number {
  const nextAllowedAt = nextAllowedAtByUser.get(userId) ?? 0;
  const remainingMs = nextAllowedAt - now;

  if (remainingMs > 0) {
    return remainingMs;
  }

  nextAllowedAtByUser.set(userId, now + COIN_COOLDOWN_MS);
  return 0;
}
