import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { logger } from '../../logging/logger.ts';
import type { SlashCommand } from '../../types/command.ts';
import { formatCurrencyDisplay, getExchangeRate } from './utils.ts';

const command: SlashCommand = {
  // prettier-ignore
  data: new SlashCommandBuilder()
    .setName('currency')
    .setDescription('Xem tỷ giá tham khảo gần nhất giữa hai loại tiền')
    .addStringOption((option) =>
      option
        .setName('from')
        .setDescription('Loại tiền gốc')
        .setRequired(true)
        .addChoices(
          { name: '🇻🇳 Việt Nam Đồng (VND)', value: 'VND' },
          { name: '🇺🇸 Đô la Mỹ (USD)', value: 'USD' },
          { name: '🇪🇺 Euro (EUR)', value: 'EUR' },
          { name: '🇬🇧 Bảng Anh (GBP)', value: 'GBP' },
          { name: '🇯🇵 Yên Nhật (JPY)', value: 'JPY' },
          { name: '🇰🇷 Won Hàn Quốc (KRW)', value: 'KRW' },
          { name: '🇨🇳 Nhân dân tệ (CNY)', value: 'CNY' },
          { name: '🇸🇬 Đô la Singapore (SGD)', value: 'SGD' },
          { name: '🇨🇦 Đô la Canada (CAD)', value: 'CAD' },
          { name: '🇦🇺 Đô la Úc (AUD)', value: 'AUD' },
          { name: '🇨🇭 Franc Thụy Sĩ (CHF)', value: 'CHF' },
          { name: '🇹🇭 Baht Thái (THB)', value: 'THB' },
          { name: '🇲🇾 Ringgit Malaysia (MYR)', value: 'MYR' },
          { name: '🇮🇳 Rupee Ấn Độ (INR)', value: 'INR' },
        ),
    )
    .addStringOption((option) =>
      option
        .setName('to')
        .setDescription('Loại tiền muốn đổi sang')
        .setRequired(true)
        .addChoices(
          { name: '🇻🇳 Việt Nam Đồng (VND)', value: 'VND' },
          { name: '🇺🇸 Đô la Mỹ (USD)', value: 'USD' },
          { name: '🇪🇺 Euro (EUR)', value: 'EUR' },
          { name: '🇬🇧 Bảng Anh (GBP)', value: 'GBP' },
          { name: '🇯🇵 Yên Nhật (JPY)', value: 'JPY' },
          { name: '🇰🇷 Won Hàn Quốc (KRW)', value: 'KRW' },
          { name: '🇨🇳 Nhân dân tệ (CNY)', value: 'CNY' },
          { name: '🇸🇬 Đô la Singapore (SGD)', value: 'SGD' },
          { name: '🇨🇦 Đô la Canada (CAD)', value: 'CAD' },
          { name: '🇦🇺 Đô la Úc (AUD)', value: 'AUD' },
          { name: '🇨🇭 Franc Thụy Sĩ (CHF)', value: 'CHF' },
          { name: '🇹🇭 Baht Thái (THB)', value: 'THB' },
          { name: '🇲🇾 Ringgit Malaysia (MYR)', value: 'MYR' },
          { name: '🇮🇳 Rupee Ấn Độ (INR)', value: 'INR' },
        ),
    )
    .addNumberOption((option) =>
      option
        .setName('amount')
        .setDescription('Số tiền cần quy đổi')
        .setRequired(true)
        .setMinValue(0.01)
        .setMaxValue(1_000_000_000),
    ),

  async execute(interaction) {
    const from = interaction.options.getString('from', true);
    const to = interaction.options.getString('to', true);
    const amount = interaction.options.getNumber('amount', true);

    if (
      !/^[A-Z]{3}$/.test(from) ||
      !/^[A-Z]{3}$/.test(to) ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      amount > 1_000_000_000
    ) {
      // prettier-ignore
      await interaction.reply({
        content: 'Số tiền hoặc loại tiền không hợp lệ.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply();

    try {
      const exchangeRate = await getExchangeRate(from, to);
      const display = formatCurrencyDisplay(amount, from, to, exchangeRate);
      // prettier-ignore
      const embed = new EmbedBuilder()
        .setTitle(display.title)
        .setFooter({
          text: display.footer,
        });
      // prettier-ignore
      await interaction.editReply({
        embeds: [embed],
      });
    } catch (error) {
      // prettier-ignore
      logger.error(
        {
          err: error,
          userId: interaction.user.id,
          command: 'currency',
          from,
          to,
        },
        'Currency conversion failed',
      );

      // prettier-ignore
      await interaction.editReply({
        content: 'Không lấy được tỷ giá lúc này. Vui lòng thử lại sau.',
      });
    }
  },
};

export default command;
