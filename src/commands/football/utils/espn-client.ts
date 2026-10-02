import axios from 'axios';
import { logger } from '../../../logging/logger.ts';
import {
  getHttpRetryDelay,
  HTTP_MAX_RETRIES,
  HTTP_TIMEOUT_MS,
  isRetryableHttpStatus,
} from '../../../utils/http.ts';

export class EspnApiError extends Error {
  constructor(
    message: string,
    readonly url: string,
    readonly status: number,
    readonly body: string,
  ) {
    super(message);
    this.name = 'EspnApiError';
  }
}

export async function espnFetch<T>(url: string): Promise<T> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      const res = await axios.get<T>(url, {
        timeout: HTTP_TIMEOUT_MS,
      });
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        if (isRetryableHttpStatus(status) && attempt < HTTP_MAX_RETRIES) {
          await new Promise((resolve) =>
            setTimeout(resolve, getHttpRetryDelay(attempt, error.response?.headers['retry-after'])),
          );
          continue;
        }

        const body =
          typeof error.response.data === 'string'
            ? error.response.data
            : JSON.stringify(error.response.data);

        logger.error(
          {
            url,
            status,
            body: body.slice(0, 2000),
          },
          'ESPN API error',
        );
        throw new EspnApiError(`ESPN API lỗi với status ${status}`, url, status, body);
      }

      if (axios.isAxiosError(error) && attempt < HTTP_MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, getHttpRetryDelay(attempt)));
        continue;
      }

      throw error;
    }
  }
}
