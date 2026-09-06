import axios from 'axios';
import { logger } from '../../../logging/logger.ts';
import {
  getHttpRetryDelay,
  HTTP_MAX_RETRIES,
  HTTP_TIMEOUT_MS,
  isRetryableHttpStatus,
} from '../../../utils/http.ts';
import type {
  EspnEvent,
  EspnCompetitor,
  EspnScoreboard,
  TournamentEventResult,
} from '../types/types.ts';

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
      const res = await axios.get<T>(url, { timeout: HTTP_TIMEOUT_MS });
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
        logger.error({ url, status, body: body.slice(0, 2000) }, 'ESPN API error');
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

export function getCompetitor(event: EspnEvent, side: 'home' | 'away'): EspnCompetitor | undefined {
  return event.competitions?.[0]?.competitors.find((competitor) => competitor.homeAway === side);
}

export async function fetchScoreboardsForDates(
  tournamentIds: string[],
  dates: string[],
): Promise<TournamentEventResult[]> {
  const fetchPromises = [];
  for (const tournamentId of tournamentIds) {
    for (const date of dates) {
      fetchPromises.push(
        espnFetch<EspnScoreboard>(
          `https://site.api.espn.com/apis/site/v2/sports/soccer/${tournamentId}/scoreboard?dates=${date}`,
        )
          .then((data) => ({
            tournamentId,
            data,
          }))
          .catch((error) => {
            logger.warn(
              {
                err: error,
                tournamentId,
                date,
              },
              'Failed to fetch ESPN scoreboard',
            );
            return null;
          }),
      );
    }
  }

  const results = await Promise.all(fetchPromises);
  const items: TournamentEventResult[] = [];

  for (const result of results) {
    const events = result?.data?.events;
    if (!events || !result) continue;
    for (const event of events) {
      items.push({ tournamentId: result.tournamentId, event });
    }
  }

  return items;
}
