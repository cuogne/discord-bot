import { EmbedBuilder } from 'discord.js';
import { HELP_PAGES } from './commands.ts';
import { HELP_DIRECTORY_ID } from './components.ts';

export function buildHelpEmbed(selectedId: string, botAvatarUrl: string): EmbedBuilder {
  if (selectedId === HELP_DIRECTORY_ID) {
    const categories = HELP_PAGES.map(
      (page) => `${page.emoji} **${page.title}**\n${page.description}`,
    ).join('\n\n');

    // prettier-ignore
    return new EmbedBuilder()
      .setTitle('📚 [BOT] Vô Diện | Danh mục trợ giúp')
      .setDescription(`Chọn một danh mục từ menu bên dưới để xem các lệnh tương ứng.\n\n### Danh mục\n${categories}\n\nCần hỗ trợ thêm? Liên hệ <@1500046771919785994>.`)
      .setThumbnail(botAvatarUrl)
      .setColor(0x5865f2)
      .setFooter({
        text: `${HELP_PAGES.length} danh mục`,
      });
  }

  const page = HELP_PAGES.find((item) => item.id === selectedId);
  if (!page) {
    throw new Error(`Invalid help category: ${selectedId}`);
  }

  // prettier-ignore
  const embed = new EmbedBuilder()
    .setTitle(`${page.emoji} [BOT] Vô Diện | ${page.title}`)
    .setDescription(`${page.description}\n\n**${page.commands.length} lệnh** • \`<...>\` là bắt buộc, \`[...]\` là tùy chọn.`)
    .setThumbnail(botAvatarUrl)
    .setColor(page.color)
    .setFooter({
      text: 'Chọn danh mục khác hoặc quay lại tổng quan bằng menu bên dưới',
    });

  for (const command of page.commands) {
    embed.addFields({
      name: command.name,
      value: command.description,
      inline: false,
    });
  }

  return embed;
}
