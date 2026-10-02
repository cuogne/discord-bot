export interface Tournament {
  id: string;
  name: string;
  flag: string;
  logo: string;
}

export const TOURNAMENTS: Record<string, Tournament> = {
  'eng.1': {
    id: 'eng.1',
    name: 'Premier League',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/23.png',
  },
  'esp.1': {
    id: 'esp.1',
    name: 'La Liga',
    flag: '🇪🇸',
    logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/15.png',
  },
  'ger.1': {
    id: 'ger.1',
    name: 'Bundesliga',
    flag: '🇩🇪',
    logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/10.png',
  },
  'ita.1': {
    id: 'ita.1',
    name: 'Serie A',
    flag: '🇮🇹',
    logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/12.png',
  },
  'fra.1': {
    id: 'fra.1',
    name: 'Ligue 1',
    flag: '🇫🇷',
    logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/9.png',
  },
  'uefa.champions': {
    id: 'uefa.champions',
    name: 'UEFA Champions League',
    flag: '🇪🇺',
    logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2.png',
  },
  'uefa.europa': {
    id: 'uefa.europa',
    name: 'UEFA Europa League',
    flag: '🇪🇺',
    logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2310.png',
  },
  'uefa.nations': {
    id: 'uefa.nations',
    name: 'UEFA Nations League',
    flag: '🇪🇺',
    logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2395.png',
  },
  'fifa.world': {
    id: 'fifa.world',
    name: 'FIFA World Cup 2026',
    flag: '🌎',
    logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/4.png',
  },
};
