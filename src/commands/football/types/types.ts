export interface EspnCompetitor {
  homeAway: 'home' | 'away';
  score?: string;
  team: {
    displayName: string;
  };
}

export interface EspnEvent {
  date: string;
  competitions?: {
    competitors: EspnCompetitor[];
  }[];
  status?: {
    type?: {
      state?: string;
      completed?: boolean;
    };
  };
  seasonType?: {
    name?: string;
  };
}

export interface EspnScoreboard {
  events?: EspnEvent[];
}

export interface EspnSchedule {
  events?: EspnEvent[];
}

export interface TournamentEventResult {
  tournamentId: string;
  event: EspnEvent;
}
