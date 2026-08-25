import { GEMINI_COOLDOWN_MS } from './config.ts';

const userCooldowns = new Map<string, number>();

export function getCooldownRemainingMs(userId: string): number {
  const lastRequestAt = userCooldowns.get(userId);

  if (!lastRequestAt) {
    return 0;
  }

  const elapsed = Date.now() - lastRequestAt;
  return Math.max(0, GEMINI_COOLDOWN_MS - elapsed);
}

export function markCooldown(userId: string): void {
  userCooldowns.set(userId, Date.now());
}
