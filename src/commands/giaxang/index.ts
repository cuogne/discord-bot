import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from '../../types/command.ts';
import { logger } from '../../logging/logger.ts';
import { fetchWithTimeout } from '../../utils/http.ts';
import type { GasPriceRow } from './types/types.ts';
import { getToday } from './utils/date.ts';

const command: SlashCommand = {
  // prettier-ignore
  data: new SlashCommandBuilder()
    .setName('giaxang')
    .setDescription('Hiển thị giá xăng dầu hôm nay'),

  async execute(interaction) {
    await interaction.deferReply();

    const today = getToday();

    let rows: GasPriceRow[];
    try {
      const response = await fetchWithTimeout(`https://giaxanghomnay.com/api/pvdate/${today}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const dataRaw: unknown = await response.json();
      if (!Array.isArray(dataRaw)) {
        throw new Error('Unexpected API response format');
      }

      rows = Array.isArray(dataRaw[0]) ? dataRaw[0] : dataRaw;
    } catch (error) {
      logger.error({ err: error, date: today }, 'Lỗi khi lấy giá xăng');
      await interaction.editReply('Không có dữ liệu giá xăng cho ngày hôm nay.');
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`Giá xăng dầu ngày ${today.split('-').reverse().join('/')}`)
      .setColor(0x0099ff);

    for (const { title, zone1_price } of rows) {
      const formattedPrice = new Intl.NumberFormat('vi-VN').format(zone1_price);

      embed.addFields({
        name: `**⛽️ ${title}**`,
        value: `${formattedPrice} VND/lít`,
        inline: false,
      });
    }

    await interaction.editReply({
      embeds: [embed],
    });
  },
};

export default command;
