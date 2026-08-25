import type { ChatInputCommandInteraction } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { TOURNAMENTS } from '../data/tournaments.ts';
import { fetchScoreboardsForDates, getCompetitor } from '../utils/espn.ts';
import {
  FOOTBALL_EMBED_COLOR,
  addDays,
  formatKickoff,
  getVietnamDateParts,
  joinWithLimit,
  toEspnDate,
} from '../utils/format.ts';
import { logger } from '../../../logging/logger.ts';

export async function handleFootballToday(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  try {
    const now = new Date();

    // prettier-ignore
    const {
      dateStr: vnTodayStr,
      day: d1,
      month: m1,
    } = getVietnamDateParts(now);

    const vnToday = new Date(`${vnTodayStr}T00:00:00+07:00`);
    const vnTomorrow = addDays(new Date(`${vnTodayStr}T00:00:00+07:00`), 1);

    // prettier-ignore
    const {
      dateStr: vnTomorrowStr,
      day: d2,
      month: m2
    } = getVietnamDateParts(vnTomorrow);

    const vnEndTomorrow = new Date(`${vnTomorrowStr}T23:59:59+07:00`);

    // prettier-ignore
    const dates = [
      toEspnDate(addDays(now, -1)),
      toEspnDate(now),
      toEspnDate(vnTomorrow)
    ];
    const items = await fetchScoreboardsForDates(Object.keys(TOURNAMENTS), dates);

    const matchesByTournament = new Map<string, { kickoffTime: number; text: string }[]>();
    const seenMatches = new Set<string>();

    for (const { tournamentId, event } of items) {
      const home = getCompetitor(event, 'home');
      const away = getCompetitor(event, 'away');
      if (!home || !away) continue;

      const matchDate = new Date(event.date);
      const matchTimeMs = matchDate.getTime();

      if (matchTimeMs < vnToday.getTime() || matchTimeMs > vnEndTomorrow.getTime()) {
        continue;
      }

      const matchKey = `${tournamentId}-${home.team.displayName}-${away.team.displayName}-${event.date}`;
      if (seenMatches.has(matchKey)) continue;
      seenMatches.add(matchKey);

      const { date, time } = formatKickoff(event.date);
      const list = matchesByTournament.get(tournamentId) ?? [];
      list.push({
        kickoffTime: matchTimeMs,
        text: `**${date} | ${time} |** ${home.team.displayName} vs ${away.team.displayName}`,
      });
      matchesByTournament.set(tournamentId, list);
    }

    if (matchesByTournament.size === 0) {
      await interaction.editReply('Không có trận đấu nào diễn ra trong hôm nay và ngày mai.');
      return;
    }

    const fields = Object.keys(TOURNAMENTS)
      .filter((id) => matchesByTournament.has(id))
      .map((id) => {
        const matches = matchesByTournament.get(id)!;
        matches.sort((a, b) => a.kickoffTime - b.kickoffTime);
        const tournament = TOURNAMENTS[id]!;
        return {
          name: `${tournament.flag} ${tournament.name}`,
          value: joinWithLimit(matches.map((m) => m.text)),
        };
      });

    const embeds = new EmbedBuilder()
      .setColor(FOOTBALL_EMBED_COLOR)
      .setTitle(`⚽ Lịch thi đấu ${d1}/${m1} & ${d2}/${m2} ⚽`)
      .addFields(fields)
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
      },
      'Lỗi khi lấy lịch thi đấu hôm nay',
    );
    await interaction.editReply('Có lỗi xảy ra khi lấy lịch thi đấu hôm nay.');
  }
}
