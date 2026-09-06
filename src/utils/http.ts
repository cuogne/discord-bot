export const HTTP_TIMEOUT_MS = 15_000;
export const HTTP_MAX_RETRIES = 2;

export function isRetryableHttpStatus(status: number): boolean {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

export function getHttpRetryDelay(attempt: number, retryAfter?: string | null): number {
  const retryAfterSeconds = Number(retryAfter);
  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds >= 0) {
    return Math.min(retryAfterSeconds * 1_000, 5_000);
  }

  return Math.min(300 * 2 ** attempt, 2_000);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithTimeout(
  input: string | URL | Request,
  init: RequestInit = {},
): Promise<Response> {
  const method = (init.method ?? 'GET').toUpperCase();
  const canRetry = method === 'GET' || method === 'HEAD' || method === 'OPTIONS';

  for (let attempt = 0; ; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS);

    try {
      const response = await fetch(input, {
        ...init,
        signal: controller.signal,
      });

      if (!canRetry || !isRetryableHttpStatus(response.status) || attempt >= HTTP_MAX_RETRIES) {
        return response;
      }

      await response.body?.cancel();
      await sleep(getHttpRetryDelay(attempt, response.headers.get('retry-after')));
    } catch (error) {
      if (!canRetry || attempt >= HTTP_MAX_RETRIES) {
        throw error;
      }

      await sleep(getHttpRetryDelay(attempt));
    } finally {
      clearTimeout(timeout);
    }
  }
}
