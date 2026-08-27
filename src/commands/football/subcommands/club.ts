import { isAfter, parseISO } from 'date-fns';
import type { ChatInputCommandInteraction } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { CLUBS } from '../data/clubs.ts';
import { EspnApiError, espnFetch, getCompetitor } from '../utils/espn.ts';
import type { EspnSchedule } from '../types/types.ts';
import { FOOTBALL_EMBED_COLOR, formatKickoff } from '../utils/format.ts';
import { logger } from '../../../logging/logger.ts';

const MAX_UPCOMING_MATCHES = 5;

export async function handleFootballClub(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const clubId = interaction.options.getString('club', true);
  const club = CLUBS[clubId]!; // not undefined because of the choices in the command definition

  try {
    const data = await espnFetch<EspnSchedule>(
      `https://site.web.api.espn.com/apis/site/v2/sports/soccer/all/teams/${clubId}/schedule?fixture=true`,
    );

    const upcoming = (data.events ?? [])
      .filter((event) => isAfter(parseISO(event.date), new Date()))
      .slice(0, MAX_UPCOMING_MATCHES);

    if (upcoming.length === 0) {
      await interaction.editReply('Không có trận đấu nào sắp tới của đội này.');
      return;
    }

    const fields = upcoming.map((event) => {
      const home = getCompetitor(event, 'home')?.team.displayName ?? 'No Home';
      const away = getCompetitor(event, 'away')?.team.displayName ?? 'No Away';
      const { date, time } = formatKickoff(event.date);

      return {
        name: `📆 ${date} • ${time}`,
        value: `⚽ **${home} vs ${away}**\n🏆 ${event.seasonType?.name ?? 'Không rõ giải đấu'}`,
      };
    });

    const embeds = new EmbedBuilder()
      .setColor(FOOTBALL_EMBED_COLOR)
      .setTitle(`⚽ Lịch thi đấu sắp tới của ${club.name}`)
      .addFields(fields)
      .setThumbnail(club.logo)
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
        clubId,
        status: err instanceof EspnApiError ? err.status : undefined,
      },
      'Lỗi khi lấy lịch thi đấu câu lạc bộ',
    );
    await interaction.editReply('Có lỗi xảy ra khi lấy lịch đá banh.');
  }
}
