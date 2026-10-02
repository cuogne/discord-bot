import { logger } from '../../../logging/logger.ts';
import type {
  EspnEvent,
  EspnCompetitor,
  EspnScoreboard,
  TournamentEventResult,
} from '../types/types.ts';
import { toEspnDate } from './format.ts';
import { espnFetch } from './espn-client.ts';

const ESPN_SCOREBOARD_BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer';

interface ScoreboardResult {
  tournamentId: string;
  board: EspnScoreboard;
}

function buildScoreboardUrl(tournamentId: string, dates: string): string {
  return `${ESPN_SCOREBOARD_BASE}/${tournamentId}/scoreboard?dates=${dates}`;
}

// Fetch one scoreboard; return null (with a warn log) instead of throwing
// so one bad response never takes down the whole batch.
async function fetchBoard(tournamentId: string, dates: string): Promise<ScoreboardResult | null> {
  try {
    const board = await espnFetch<EspnScoreboard>(buildScoreboardUrl(tournamentId, dates));
    return { tournamentId, board };
  } catch (error) {
    logger.warn(
      {
        err: error,
        tournamentId,
        dates,
      },
      'Failed to fetch ESPN scoreboard',
    );
    return null;
  }
}

// Flatten fetched boards into events, skipping failed boards and unwanted events.
function collectEvents(
  results: (ScoreboardResult | null)[],
  isWanted: (event: EspnEvent) => boolean = () => true,
): TournamentEventResult[] {
  const items: TournamentEventResult[] = [];
  for (const result of results) {
    if (result === null) {
      continue;
    }
    for (const event of result.board.events ?? []) {
      if (!isWanted(event)) {
        continue;
      }
      items.push({
        tournamentId: result.tournamentId,
        event,
      });
    }
  }
  return items;
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
      fetchPromises.push(fetchBoard(tournamentId, date));
    }
  }

  return collectEvents(await Promise.all(fetchPromises));
}

/*
  Since 2026-09-15 ESPN returns HTTP 400 for every `dates` range (START-END),
  but the monthly form `dates=YYYYMM` still works and returns all events of the
  month.
  -> 14 days -> slice it -> collect unique months
  -> fetch whole months -> filter it on 14 days on the client
*/
export async function fetchScoreboardsForMonths(
  tournamentId: string,
  months: string[],
): Promise<EspnScoreboard[]> {
  // `months` must already be unique — built once from the caller.
  const results = await Promise.all(months.map((month) => fetchBoard(tournamentId, month)));
  const boards = results
    .filter((result): result is ScoreboardResult => result !== null)
    .map((result) => result.board);

  if (boards.length === 0) {
    throw new Error(
      `Không lấy được lịch thi đấu ${tournamentId} cho các tháng ${months.join(', ')}`,
    );
  }

  return boards;
}

/*
  Fetch one league over a multi-day window: group dates by month (yyyyMMdd -> YYYYMM),
  fetch whole months, then filter back to the window on the client. Throw when every
  month fails so the command reports an error instead of "no matches".
*/
export async function fetchUpcomingScoreboards(
  tournamentId: string,
  dates: string[],
): Promise<TournamentEventResult[]> {
  // receive 14 days from tournament.ts (format yyyyMMdd)
  const wanted = new Set(dates);

  // format (yyyyMMdd -> YYYYMM) and deduplicate
  // ex: ['20230915', '20230916', '20230917', '20231001'] -> ['202309', '202310']
  const months = [...new Set(dates.map((date) => date.slice(0, 6)))].sort();

  // fetch whole months, then filter back to the wanted dates on the client
  const boards = await fetchScoreboardsForMonths(tournamentId, months);

  return collectEvents(
    boards.map((board) => ({ tournamentId, board })),
    (event) => wanted.has(toEspnDate(new Date(event.date))),
  );
}
