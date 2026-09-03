import type { ChatInputCommandInteraction } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { TOURNAMENTS } from '../data/tournaments.ts';
import { EspnApiError, espnFetch, getCompetitor } from '../utils/espn.ts';
import type { EspnScoreboard } from '../types/types.ts';
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
    const dates = `${toEspnDate(today)}-${toEspnDate(addDays(today, 13))}`; // 2 weeks

    const data = await espnFetch<EspnScoreboard>(
      `https://site.api.espn.com/apis/site/v2/sports/soccer/${tournamentId}/scoreboard?dates=${dates}`,
    );

    const matchesByDate = new Map<string, string[]>();
    for (const event of data.events ?? []) {
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
        status: err instanceof EspnApiError ? err.status : undefined,
      },
      'Lỗi khi lấy lịch thi đấu giải đấu',
    );

    await interaction.editReply('Có lỗi xảy ra khi lấy lịch đá banh.');
  }
}
