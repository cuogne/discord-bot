import { GEMINI_TIMEOUT_MS } from './config.ts';

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatResponseTime(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }

  return `${(ms / 1000).toFixed(2)}s`;
}

export function withTimeout<T>(promise: Promise<T>): Promise<T> {
  return Promise.race([
    promise,
    sleep(GEMINI_TIMEOUT_MS).then((): never => {
      const err = new Error('Gemini request timed out');
      err.name = 'TimeoutError';
      throw err;
    }),
  ]);
}
