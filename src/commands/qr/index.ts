import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from '../../types/command.ts';

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
          { name: 'Eximbank', value: 'EIB' },
          { name: 'MSB', value: 'MSB' },
          { name: 'OCB', value: 'OCB' },
          { name: 'PVcomBank', value: 'PVCB' },
          { name: 'SeABank', value: 'SEAB' },
          { name: 'LPBank', value: 'LPB' },
          { name: 'NCB', value: 'NCB' },
          { name: 'Timo', value: 'TIMO' }
        ),
    )
    .addStringOption((option) =>
      option
        .setName('account')
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
        .setName('accountname')
        .setDescription('Tên chủ tài khoản hiển thị trên ảnh QR'),
    ),

  async execute(interaction) {
    const bank = interaction.options.getString('bank', true);
    const account = interaction.options.getString('account', true).trim();
    const amount = interaction.options.getInteger('amount');
    const description = interaction.options.getString('description')?.trim();
    const accountName = interaction.options.getString('accountname')?.trim();

    const user = interaction.user;

    const qrUrl = new URL(
      `https://img.vietqr.io/image/${encodeURIComponent(bank)}-${encodeURIComponent(account)}-print.jpg`,
    );
    if (amount !== null) {
      qrUrl.searchParams.set('amount', String(amount));
    }
    if (description) {
      qrUrl.searchParams.set('addInfo', description);
    }
    if (accountName) {
      qrUrl.searchParams.set('accountName', accountName);
    }

    await interaction.reply({
      embeds: [
        // prettier-ignore
        new EmbedBuilder()
          .setDescription(`### Mã QR chuyển khoản của ${user}`)
          .setImage(qrUrl.toString()),
      ],
    });
  },
};

export default command;
