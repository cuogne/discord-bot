// Barrel keeping the previous import path working.
// HTTP client lives in ./espn-client.ts, scoreboard logic in ./espn-scoreboard.ts.
export { EspnApiError, espnFetch } from './espn-client.ts';
export {
  getCompetitor,
  fetchScoreboardsForDates,
  fetchScoreboardsForMonths,
  fetchUpcomingScoreboards,
} from './espn-scoreboard.ts';
