import { formatInTimeZone } from 'date-fns-tz';
import { vi } from 'date-fns/locale/vi';
import { SolarDate } from '@nghiavuive/lunar_date_vi';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from '../../types/command.ts';
import { VIETNAM_TIMEZONE } from '../../utils/date.ts';
// check this lib calc lunar date: https://github.com/nacana22/lunar-date

const command: SlashCommand = {
  // prettier-ignore
  data: new SlashCommandBuilder()
    .setName('today')
    .setDescription('Hiển thị ngày giờ hiện tại (âm và dương lịch)'),

  async execute(interaction) {
    await interaction.deferReply();

    const nowDate = new Date();
    const timeNow = formatInTimeZone(nowDate, VIETNAM_TIMEZONE, 'HH:mm:ss');
    const solarDate = formatInTimeZone(nowDate, VIETNAM_TIMEZONE, 'dd/MM/yyyy');
    const weekday = formatInTimeZone(nowDate, VIETNAM_TIMEZONE, 'EEEE', { locale: vi }).replace(
      /^./,
      (character) => character.toUpperCase(),
    );

    const lunar = new SolarDate(nowDate).toLunarDate();
    const lunarData = lunar.get();
    const leapSuffix = lunarData.leap_month ? ' (nhuận)' : '';
    const lunarDate = `${lunarData.day}/${lunarData.month}/${lunarData.year}${leapSuffix}`;

    const luckyHours = lunar
      .getLuckyHours()
      .map(
        ({ name, time }) =>
          `· ${name} (${String(time[0]).padStart(2, '0')}:00 - ${String(time[1]).padStart(2, '0')}:00)`,
      )
      .join('\n');

    const embeds = new EmbedBuilder()
      .setColor(0x4285f4)
      .setTitle(`📅 ${weekday}, ${solarDate}`)
      .addFields(
        { name: '🌞 Dương lịch', value: `**${solarDate}**`, inline: true },
        { name: '🌙 Âm lịch', value: lunarDate, inline: true },
        { name: '🕰️ Thời gian', value: `**${timeNow}**`, inline: true },
        {
          name: '🐲 Can chi',
          value: `Tháng ${lunarData.month}${leapSuffix} năm **${lunar.getYearName()}**\nNgày **${lunar.getDayName()}** - Tháng **${lunar.getMonthName()}**`,
          inline: false,
        },
        { name: '🍃 Tiết khí', value: `**${lunar.getSolarTerm()}**`, inline: true },
      )
      .addFields({ name: '⏰ Giờ hoàng đạo', value: luckyHours, inline: false })
      .setFooter({ text: 'GMT+7 (Việt Nam)' })
      .setTimestamp(nowDate);

    await interaction.editReply({
      embeds: [embeds],
    });
  },
};

export default command;
