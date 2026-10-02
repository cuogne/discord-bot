import type { ChatInputCommandInteraction } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { TOURNAMENTS } from '../data/tournaments.ts';
import { fetchUpcomingScoreboards, getCompetitor } from '../utils/espn.ts';
import {
  FOOTBALL_EMBED_COLOR,
  addDays,
  formatKickoff,
  joinWithLimit,
  toEspnDate,
} from '../utils/format.ts';
import { logger } from '../../../logging/logger.ts';

export async function handleFootballTournament(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const tournamentId = interaction.options.getString('tournament', true);
  const tournament = TOURNAMENTS[tournamentId]!;

  try {
    const today = new Date();
    /*
      espn api with date range param does not work, check issue: https://github.com/pseudo-r/Public-ESPN-API/issues/23
    */
    // const dates = `${toEspnDate(today)}-${toEspnDate(addDays(today, 13))}`; // 2 weeks

    // const data = await espnFetch<EspnScoreboard>(
    //   `https://site.api.espn.com/apis/site/v2/sports/soccer/${tournamentId}/scoreboard?dates=${dates}`,
    // );

    const dates = Array.from({ length: 14 }, (_, index) => toEspnDate(addDays(today, index)));
    const results = await fetchUpcomingScoreboards(tournamentId, dates);

    const matchesByDate = new Map<string, string[]>();
    for (const { event } of results) {
      const home = getCompetitor(event, 'home')?.team.displayName;
      const away = getCompetitor(event, 'away')?.team.displayName;
      if (!home || !away) continue;

      const { date, time } = formatKickoff(event.date);
      const matches = matchesByDate.get(date) ?? [];
      matches.push(`**${time}** | ${home} vs ${away}`);
      matchesByDate.set(date, matches);
    }

    const fields =
      matchesByDate.size === 0
        ? [
            {
              name: '📅 Lịch thi đấu',
              value: 'Không có trận đấu nào trong vòng 2 tuần tới.',
            },
          ]
        : [...matchesByDate.entries()].map(([date, matches]) => ({
            name: `📅 Ngày: ${date}`,
            value: joinWithLimit(matches),
          }));

    const embeds = new EmbedBuilder()
      .setColor(FOOTBALL_EMBED_COLOR)
      .setTitle(`⚽ Lịch thi đấu ${tournament.name} ⚽`)
      .addFields(fields)
      .setThumbnail(tournament.logo)
      .setFooter({
        text: 'Giờ hiển thị theo giờ Việt Nam',
      });

    await interaction.editReply({
      embeds: [embeds],
    });
  } catch (err) {
    logger.error(
      {
        err,
        tournamentId,
      },
      'Lỗi khi lấy lịch thi đấu giải đấu',
    );

    await interaction.editReply('Có lỗi xảy ra khi lấy lịch đá banh.');
  }
}
