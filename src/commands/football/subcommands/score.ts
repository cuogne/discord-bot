import type { ChatInputCommandInteraction } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { TOURNAMENTS } from '../data/tournaments.ts';
import { fetchScoreboardsForDates, getCompetitor } from '../utils/espn.ts';
import { FOOTBALL_EMBED_COLOR, addDays, formatMatchScore, toEspnDate } from '../utils/format.ts';
import { logger } from '../../../logging/logger.ts';

export async function handleFootballScore(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  try {
    const today = new Date();
    const dates = [
      toEspnDate(today),
      toEspnDate(addDays(today, -1)), // yesterday
      toEspnDate(addDays(today, -2)), // day before yesterday
    ];

    const items = await fetchScoreboardsForDates(Object.keys(TOURNAMENTS), dates);

    const matchesByTournament = new Map<string, string[]>();
    const seenMatches = new Set<string>();
    // const now = new Date();

    for (const { tournamentId, event } of items) {
      const home = getCompetitor(event, 'home');
      const away = getCompetitor(event, 'away');
      if (!home || !away) continue;

      // create a match key to avoid duplicates
      const matchKey = `${tournamentId}-${home.team.displayName}-${away.team.displayName}-${event.date}`;
      if (seenMatches.has(matchKey)) continue;

      // // time to determine if the match is completed
      // const endMatchDate = new Date(event.date);
      // endMatchDate.setHours(endMatchDate.getHours() + 2);

      // prettier-ignore
      const isCompleted =
        event.status?.type?.completed === true ||
        event.status?.type?.state === 'post';
      // now >= endMatchDate;

      if (!isCompleted) continue;

      const scoreHome = home.score ?? '0';
      const scoreAway = away.score ?? '0';

      seenMatches.add(matchKey);

      const matches = matchesByTournament.get(tournamentId) ?? [];
      matches.push(
        // prettier-ignore
        // format: "Home Team 2 - 1 Away Team"
        formatMatchScore(
          home.team.displayName,
          scoreHome,
          scoreAway,
          away.team.displayName,
        ),
      );
      matchesByTournament.set(tournamentId, matches);
    }

    if (matchesByTournament.size === 0) {
      await interaction.editReply('Không có trận đấu nào trong tối qua hoặc rạng sáng nay.');
      return;
    }

    const fields = [...matchesByTournament.entries()].map(([tournamentId, matches]) => {
      const tournament = TOURNAMENTS[tournamentId]!;
      return {
        name: `${tournament.flag} ${tournament.name}`,
        value: matches.join('\n'),
      };
    });

    const embeds = new EmbedBuilder()
      .setColor(FOOTBALL_EMBED_COLOR)
      .setTitle('⚽ Tỉ số các trận đấu đêm qua và rạng sáng nay ⚽')
      .addFields(fields)
      .setFooter({
        text: `Dữ liệu được cập nhật real-time.`,
      });

    await interaction.editReply({
      embeds: [embeds],
    });
  } catch (err) {
    logger.error({ err }, 'Lỗi khi lấy tỉ số bóng đá');
    await interaction.editReply('Có lỗi xảy ra khi lấy tỉ số bóng đá.');
  }
}
