interface ErrorLike {
  status?: number;
  code?: number;
  statusCode?: number;
  message?: string;
  name?: string;
}

export function isRetryableError(err: unknown): boolean {
  const e = err as ErrorLike | undefined;
  const status = e?.status ?? e?.code ?? e?.statusCode;
  const message = (e?.message ?? '').toString().toLowerCase();

  return (
    status === 429 ||
    status === 503 ||
    e?.name === 'TimeoutError' ||
    message.includes('timeout') ||
    message.includes('timed out') ||
    message.includes('429') ||
    message.includes('503') ||
    message.includes('quota') ||
    message.includes('rate limit') ||
    message.includes('resource exhausted') ||
    message.includes('high demand') ||
    message.includes('unavailable')
  );
}

export function isTimeoutError(err: unknown): boolean {
  return (err as ErrorLike | undefined)?.name === 'TimeoutError';
}
