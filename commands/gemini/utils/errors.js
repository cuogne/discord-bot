export function isRetryableError(err) {
  const status = err?.status ?? err?.code ?? err?.statusCode;
  const message = (err?.message ?? '').toString().toLowerCase();

  return status === 429
    || status === 503
    || message.includes('429')
    || message.includes('503')
    || message.includes('quota')
    || message.includes('rate limit')
    || message.includes('resource exhausted')
    || message.includes('high demand')
    || message.includes('unavailable');
}

export function isTimeoutError(err) {
  return err?.name === 'TimeoutError';
}