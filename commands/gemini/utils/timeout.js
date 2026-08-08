import { GEMINI_TIMEOUT_MS } from './config.js';

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatResponseTime(ms) {
  if (ms < 1000) {
    return `${ms}ms`;
  }

  return `${(ms / 1000).toFixed(2)}s`;
}

export function withTimeout(promise) {
  return Promise.race([
    promise,
    sleep(GEMINI_TIMEOUT_MS).then(() => {
      const err = new Error('Gemini request timed out');
      err.name = 'TimeoutError';
      throw err;
    }),
  ]);
}