import { GEMINI_TIMEOUT_MS } from './config.ts';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
