function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    sleep(timeoutMs).then((): never => {
      const err = new Error('Gemini request timed out');
      err.name = 'TimeoutError';
      throw err;
    }),
  ]);
}
