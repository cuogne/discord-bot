import { GEMINI_COOLDOWN_MS } from './config.js';

const userCooldowns = new Map();

export function getCooldownRemainingMs(userId) {
  const lastRequestAt = userCooldowns.get(userId);

  if (!lastRequestAt) {
    return 0;
  }

  const elapsed = Date.now() - lastRequestAt;
  return Math.max(0, GEMINI_COOLDOWN_MS - elapsed);
}

export function markCooldown(userId) {
  userCooldowns.set(userId, Date.now());
}