import { logger } from '../../../logging/logger.ts';
import type {
  EspnEvent,
  EspnCompetitor,
  EspnScoreboard,
  TournamentEventResult,
  ScoreboardResult,
} from '../types/types.ts';
import { toEspnDate } from './format.ts';
import { espnFetch } from './espn-client.ts';

const ESPN_SCOREBOARD_BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer';

function buildScoreboardUrl(tournamentId: string, dates: string): string {
  return `${ESPN_SCOREBOARD_BASE}/${tournamentId}/scoreboard?dates=${dates}`;
}

interface BoardFetchOutcome {
  result: ScoreboardResult | null;
  error?: unknown;
  tournamentId: string;
  dates: string;
}

// Keep individual failures so a partial batch can continue, while an entirely
// failed batch can report the underlying errors to the command logger.
async function fetchBoard(tournamentId: string, dates: string): Promise<BoardFetchOutcome> {
  try {
    const board = await espnFetch<EspnScoreboard>(buildScoreboardUrl(tournamentId, dates));
    return {
      result: { tournamentId, board },
      tournamentId,
      dates,
    };
  } catch (error) {
    return { result: null, error, tournamentId, dates };
  }
}

function getSuccessfulBoards(outcomes: BoardFetchOutcome[]): ScoreboardResult[] {
  const successes = outcomes.flatMap((outcome) => (outcome.result ? [outcome.result] : []));
  const failures = outcomes.filter((outcome) => outcome.result === null);

  if (successes.length === 0 && failures.length > 0) {
    throw new AggregateError(
      failures.map(
        (failure) =>
          new Error(`ESPN scoreboard ${failure.tournamentId} ${failure.dates} failed`, {
            cause: failure.error,
          }),
      ),
      'All ESPN scoreboard requests failed',
    );
  }

  for (const failure of failures) {
    logger.warn(
      {
        err: failure.error,
        tournamentId: failure.tournamentId,
        dates: failure.dates,
      },
      'Failed to fetch ESPN scoreboard',
    );
  }

  return successes;
}

// Flatten fetched boards into events, skipping failed boards and unwanted events.
function collectEvents(
  results: ScoreboardResult[],
  isWanted: (event: EspnEvent) => boolean = () => true,
): TournamentEventResult[] {
  const items: TournamentEventResult[] = [];
  for (const result of results) {
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

  return collectEvents(getSuccessfulBoards(await Promise.all(fetchPromises)));
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
  return getSuccessfulBoards(results).map((result) => result.board);
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
    boards.map((board) => ({
      tournamentId,
      board,
    })),
    (event) => wanted.has(toEspnDate(new Date(event.date))),
  );
}
