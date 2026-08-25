import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from '../../types/command.ts';
import { getTodayInVietnam } from '../../utils/date.ts';
import { buildCalendarGrid } from './utils/grid.ts';

const command: SlashCommand = {
  // prettier-ignore
  data: new SlashCommandBuilder()
    .setName('calendar')
    .setDescription('Hiển thị lịch của một tháng bất kỳ')
    .addIntegerOption((option) =>
      option
        .setName('month')
        .setDescription('Tháng')
        .addChoices(
          { name: 'Tháng 1', value: 1 },
          { name: 'Tháng 2', value: 2 },
          { name: 'Tháng 3', value: 3 },
          { name: 'Tháng 4', value: 4 },
          { name: 'Tháng 5', value: 5 },
          { name: 'Tháng 6', value: 6 },
          { name: 'Tháng 7', value: 7 },
          { name: 'Tháng 8', value: 8 },
          { name: 'Tháng 9', value: 9 },
          { name: 'Tháng 10', value: 10 },
          { name: 'Tháng 11', value: 11 },
          { name: 'Tháng 12', value: 12 },
        )
        .setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName('year')
        .setDescription('Năm (2000-2100)')
        .setMinValue(2000)
        .setMaxValue(2100)
        .setRequired(true),
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const month = interaction.options.getInteger('month', true);
    const year = interaction.options.getInteger('year', true);

    const today = getTodayInVietnam();
    const isCurrentMonth = today.year === year && today.month === month;
    const grid = buildCalendarGrid(month, year, isCurrentMonth ? today.day : 0);
    const footerDate = `${String(today.day).padStart(2, '0')}/${today.month}/${today.year}`;

    const embeds = new EmbedBuilder()
      .setColor(0x4285f4)
      .setTitle(`🗓️ Tháng ${month} năm ${year}`)
      .setDescription(`\`\`\`\n${grid}\n\`\`\``)
      .setFooter({
        text: `Hôm nay là ngày ${footerDate} · GMT+7 (Việt Nam)`,
      });

    await interaction.editReply({
      embeds: [embeds],
    });
  },
};

export default command;
