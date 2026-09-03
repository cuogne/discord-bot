import { ChannelType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from '../../types/command.ts';
import { handleLatestSubcommand } from './subcommands/latest.ts';
import { handleRemoveSubcommand } from './subcommands/remove.ts';
import { handleSetupSubcommand } from './subcommands/setup.ts';
import { handleStatusSubcommand } from './subcommands/status.ts';

const command: SlashCommand = {
  // prettier-ignore
  data: new SlashCommandBuilder()
    .setName('hcmus-news')
    .setDescription('Xem tin tức từ HCMUS')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('latest')
        .setDescription('Xem tin tức mới nhất')
        .addStringOption((option) =>
          option
            .setName('category')
            .setDescription('Chọn danh mục tin tức')
            .setRequired(true)
            .addChoices(
              { name: 'Khoa Công nghệ Thông tin - FIT@HCMUS', value: 'fithcmus' },
              { name: 'Lịch thi HCMUS - PKTĐBCL', value: 'lichthi' },
              { name: 'Thông báo Phòng khảo thí - PKTĐBCL', value: 'thongbao' },
              { name: 'Thông tin dành cho sinh viên - HCMUS', value: 'hcmus' },
              { name: 'Chương trình đề án CNTT - CLC/APCS', value: 'ctda' },
              { name: 'Tin tức chung - HCMUS', value: 'tintuc' },
            ),
        )
        .addIntegerOption((option) =>
          option
            .setName('number')
            .setDescription('Chọn số lượng tin gần nhất (Mặc định: 1 tin, tối đa: 5 tin)')
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(5),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('setup')
        .setDescription('Chọn channel để nhận thông báo từ HCMUS')
        .addChannelOption((option) =>
          option
            .setName('channel')
            .setDescription('Chọn channel để nhận thông báo (Bot phải có quyền gửi tin nhắn vào channel này)')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('status')
        .setDescription('Hiển thị trạng thái đã cấu hình nhận thông báo'),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('remove')
        .setDescription('Xóa channel đã cấu hình (Không nhận thông báo nữa)'),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'latest':
        return handleLatestSubcommand(interaction);
      case 'setup':
        return handleSetupSubcommand(interaction);
      case 'status':
        return handleStatusSubcommand(interaction);
      case 'remove':
        return handleRemoveSubcommand(interaction);
    }
  },
};

export default command;
