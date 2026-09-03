import { EmbedBuilder } from 'discord.js';
import { COMMAND_LIST } from './commands.ts';

export function buildHelpEmbed(): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle('📖 DANH SÁCH LỆNH (HELP COMMANDS)')
    .setDescription('Dưới đây là danh sách toàn bộ các câu lệnh hiện có của bot:')
    .setColor(0x00a2ff);

  embed.addFields(
    Object.entries(COMMAND_LIST).map(([name, value]) => ({
      name,
      value,
      inline: false,
    })),
  );

  return embed;
}
