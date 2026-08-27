import { SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from '../../types/command.ts';
import { handleToday } from './main/today.ts';
import { handleUpcoming } from './main/upcoming.ts';
import { handleTodayMovieSelection } from './handlers/todaySelection.ts';
import { handleUpcomingMovieSelection } from './handlers/upcomingSelection.ts';

const command: SlashCommand = {
  // prettier-ignore
  data: new SlashCommandBuilder()
    .setName('cinestar')
    .setDescription('Xem lịch chiếu phim tại Cinestar')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('today')
        .setDescription('Xem lịch chiếu phim hôm nay')
        .addStringOption((option) =>
          option.setName('cinema')
            .setDescription('Chọn rạp Cinestar')
            .setRequired(true)
            .addChoices(
              { name: '🎬 Cinestar Hiệp Phú - TP.HCM', value: 'Cinestar Hiệp Phú - TP.HCM' },
              { name: '🎬 Cinestar Quốc Thanh - TP.HCM', value: 'Cinestar Quốc Thanh - TP.HCM' },
              { name: '🎬 Cinestar Sinh Viên - TP.HCM', value: 'Cinestar Sinh Viên - TP.HCM' },
              { name: '🎬 Cinestar Satra Quận 6 - TP.HCM', value: 'Cinestar Satra Quận 6 - TP.HCM' },
              { name: '🎬 Cinestar Mỹ Tho - Đồng Tháp', value: 'Cinestar Mỹ Tho - Đồng Tháp' },
              { name: '🎬 Cinestar Kiên Giang - An Giang', value: 'Cinestar Kiên Giang - An Giang' },
              { name: '🎬 Cinestar Đà Lạt - Lâm Đồng', value: 'Cinestar Đà Lạt - Lâm Đồng' },
              { name: '🎬 Cinestar Lâm Đồng - Đức Trọng', value: 'Cinestar Lâm Đồng - Đức Trọng' },
              { name: '🎬 Cinestar Huế - TP.Huế', value: 'Cinestar Huế - TP.Huế' },
              { name: '🎬 Cinestar Parkcity - Hà Nội', value: 'Cinestar Parkcity - Hà Nội' },
          ),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('upcoming')
        .setDescription('Xem danh sách phim sắp chiếu'),
    ),

  async execute(interaction) {
    switch (interaction.options.getSubcommand()) {
      case 'today':
        return handleToday(interaction);
      case 'upcoming':
        return handleUpcoming(interaction);
    }
  },

  selectHandlers: {
    cinestar_movie: handleTodayMovieSelection,
    cinestar_upcoming_movie: handleUpcomingMovieSelection,
  },
};

export default command;
