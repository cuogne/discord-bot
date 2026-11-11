import { AttachmentBuilder, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { setCommandUsageError } from '../../logging/context.ts';
import type { SlashCommand } from '../../types/command.ts';
import { fetchWithTimeout } from '../../utils/http.ts';

const command: SlashCommand = {
  // prettier-ignore
  data: new SlashCommandBuilder()
    .setName('qr')
    .setDescription('Tạo mã QR từ tên ngân hàng và số tài khoản của bạn')
    .addStringOption((option) =>
      option
        .setName('bank')
        .setDescription('Chọn ngân hàng')
        .setRequired(true)
        .addChoices(
          // check this: https://www.vietqr.io/danh-sach-api/api-danh-sach-ma-ngan-hang
          // bash: curl https://api.vietqr.io/v2/banks
          { name: 'Vietcombank', value: 'VCB' },
          { name: 'VietinBank', value: 'ICB' },
          { name: 'BIDV', value: 'BIDV' },
          { name: 'Agribank', value: 'VBA' },
          { name: 'MBBank', value: 'MB' },
          { name: 'Techcombank', value: 'TCB' },
          { name: 'ACB', value: 'ACB' },
          { name: 'VPBank', value: 'VPB' },
          { name: 'TPBank', value: 'TPB' },
          { name: 'Sacombank', value: 'STB' },
          { name: 'HDBank', value: 'HDB' },
          { name: 'VIB', value: 'VIB' },
          { name: 'SHB', value: 'SHB' },
          { name: 'OCB', value: 'OCB' },
          { name: 'LPBank', value: 'LPB' },
          { name: 'Timo', value: 'TIMO' },
          { name: 'Shinhan Bank', value: 'SHBVN' },
        ),
    )
    .addStringOption((option) =>
      option
        .setName('account_no')
        .setDescription('Số tài khoản ngân hàng')
        .setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName('amount')
        .setDescription('Số tiền chuyển khoản (VND)')
        .setMinValue(1000)
        .setMaxValue(9999999999999),
    )
    .addStringOption((option) =>
      option
        .setName('description')
        .setDescription('Nội dung chuyển khoản')
        .setMaxLength(50),
    )
    .addStringOption((option) =>
      option
        .setName('account_name')
        .setDescription('Tên chủ tài khoản hiển thị trên ảnh QR'),
    ),

  async execute(interaction) {
    const bank = interaction.options.getString('bank', true);
    const account = interaction.options.getString('account_no', true).trim();
    const amount = interaction.options.getInteger('amount');
    const description = interaction.options.getString('description')?.trim();
    const accountName = interaction.options.getString('account_name')?.trim();

    const user = interaction.user;

    // vietqr.app renders a ready-to-send PNG card (QR + info).
    const amountParam = amount !== null ? `&amount=${amount}` : '';
    const desParam = description ? `&des=${encodeURIComponent(description)}` : '';
    const holderParam = accountName ? `&holder=${encodeURIComponent(accountName)}` : '';
    const qrAppUrl = new URL(
      `https://vietqr.app/img?acc=${encodeURIComponent(account)}&bank=${encodeURIComponent(bank)}${amountParam}${desParam}${holderParam}&template=compact&showinfo=true&fullacc=true`,
    );

    await interaction.deferReply();

    try {
      const response = await fetchWithTimeout(qrAppUrl);
      const contentType = response.headers.get('content-type') ?? '';
      if (!response.ok || !contentType.startsWith('image/') || contentType.includes('svg')) {
        throw new Error(`vietqr.app returned HTTP ${response.status} (${contentType})`);
      }
      const image = Buffer.from(await response.arrayBuffer());
      const isPng =
        image.length > 2048 &&
        image[0] === 0x89 &&
        image[1] === 0x50 &&
        image[2] === 0x4e &&
        image[3] === 0x47;
      if (!isPng) {
        throw new Error('vietqr.app did not return a valid PNG');
      }
      const attachment = new AttachmentBuilder(image, {
        name: 'vietqr.png',
      });

      const embed = new EmbedBuilder()
        .setDescription(`### Mã QR chuyển khoản của ${user}`)
        .addFields(
          { name: 'Ngân hàng', value: bank, inline: true },
          { name: 'Số tài khoản', value: account, inline: true },
        )
        .setImage('attachment://vietqr.png');

      if (amount !== null) {
        embed.addFields({
          name: 'Số tiền',
          value: `${amount.toLocaleString('vi-VN')} VND`,
          inline: true,
        });
      }
      if (description) {
        embed.addFields({
          name: 'Nội dung',
          value: description,
        });
      }
      if (accountName) {
        embed.addFields({
          name: 'Chủ tài khoản',
          value: accountName,
        });
      }

      await interaction.editReply({
        files: [attachment],
        embeds: [embed],
      });
    } catch (error) {
      setCommandUsageError(interaction, error);
      await interaction.editReply('Không tải được ảnh QR từ VietQR. Vui lòng thử lại sau.');
    }
  },
};

export default command;
