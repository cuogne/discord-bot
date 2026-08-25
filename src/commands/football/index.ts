import type { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from '../../types/command.ts';
import { handleFootballClub } from './subcommands/club.ts';
import { handleFootballScore } from './subcommands/score.ts';
import { handleFootballToday } from './subcommands/today.ts';
import { handleFootballTournament } from './subcommands/tournament.ts';

const command: SlashCommand = {
  // prettier-ignore
  data: new SlashCommandBuilder()
    .setName('football')
    .setDescription('Xem thông tin bóng đá (lịch thi đấu, tỉ số, ...)')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('tournament')
        .setDescription('Xem lịch thi đấu bóng đá Châu Âu hôm nay và các ngày lân cận')
        .addStringOption((option) =>
          option
            .setName('tournament')
            .setDescription('Chọn giải đấu bóng đá bạn muốn xem lịch thi đấu')
            .setRequired(true)
            .addChoices(
              { name: '🇬🇧 Premier League', value: 'eng.1' },
              { name: '🇪🇸 La Liga', value: 'esp.1' },
              { name: '🇩🇪 Bundesliga', value: 'ger.1' },
              { name: '🇮🇹 Serie A', value: 'ita.1' },
              { name: '🇫🇷 Ligue 1', value: 'fra.1' },
              { name: '🇪🇺 UEFA Champions League', value: 'uefa.champions' },
              { name: '🇪🇺 UEFA Europa League', value: 'uefa.europa' },
              { name: '🌎 FIFA World Cup 2026', value: 'fifa.world' },
            ),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('club')
        .setDescription('Xem lịch thi đấu bóng đá của 1 câu lạc bộ')
        .addStringOption((option) =>
          option
            .setName('club')
            .setDescription('Chọn câu lạc bộ')
            .setRequired(true)
            .addChoices(
              { name: 'Manchester United', value: '360' },
              { name: 'Manchester City', value: '382' },
              { name: 'Chelsea', value: '363' },
              { name: 'Liverpool', value: '364' },
              { name: 'Arsenal', value: '359' },
              { name: 'Tottenham Hotspur', value: '367' },
              { name: 'Real Madrid', value: '86' },
              { name: 'Barcelona', value: '83' },
              { name: 'Atletico Madrid', value: '1068' },
              { name: 'Bayern Munich', value: '132' },
              { name: 'Borussia Dortmund', value: '124' },
              { name: 'Bayer Leverkusen', value: '131' },
              { name: 'Paris Saint Germain (PSG)', value: '160' },
              { name: 'Inter Milan', value: '110' },
              { name: 'AC Milan', value: '103' },
              { name: 'AS Roma', value: '104' },
              { name: 'Napoli', value: '114' },
              { name: 'Juventus', value: '111' },
            ),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('score')
        .setDescription('Xem tỉ số của các trận đấu bóng đá đêm qua và rạng sáng nay'),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('today')
        .setDescription('Xem các trận đấu sẽ diễn ra vào tối nay và rạng sáng mai'),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'tournament':
        return handleFootballTournament(interaction);
      case 'club':
        return handleFootballClub(interaction);
      case 'score':
        return handleFootballScore(interaction);
      case 'today':
        return handleFootballToday(interaction);
    }
  },
};

export default command;
