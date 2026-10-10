import { EmbedBuilder, chatInputApplicationCommandMention } from 'discord.js';
import { NEWS_SOURCES } from '../../hcmus-news/resources/links.ts';
import { HELP_PAGES } from './commands.ts';
import { HELP_DIRECTORY_ID } from './components.ts';

export function buildHelpEmbed(
  selectedId: string,
  botAvatarUrl: string,
  hcmusCommandId?: string,
): EmbedBuilder {
  if (selectedId === HELP_DIRECTORY_ID) {
    let categories = '';
    for (const page of HELP_PAGES) {
      if (categories) {
        categories += '\n\n';
      }
      categories += `${page.emoji} **${page.title}**\n${page.description}`;
    }

    // prettier-ignore
    return new EmbedBuilder()
      .setTitle('📚 [BOT] Vô Diện | Danh mục trợ giúp')
      .setDescription(`Chọn một danh mục từ menu bên dưới để xem các lệnh tương ứng.\n\n### Danh mục\n${categories}\n\nCần hỗ trợ thêm? Liên hệ <@853264116332101652>.`)
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

  const pageDescription =
    page.id === 'hcmus'
      ? '💁‍♂️ **Tính năng này là gì?**\n' +
        '• Bot gửi tin tức của HCMUS đến cho bạn thông qua channel bạn đã chọn dưới dạng notification. Giúp bạn không cần lên web tìm tin và không bỏ lỡ tin mới.\n\n' +
        '• Bot theo dõi các tin chung của HCMUS và khoa CNTT - FIT@HCMUS.\n\n' +
        '• Bot có sử dụng Gemini để tóm tắt ngắn tin tức để bạn nắm sơ nội dung trước khi mở link bài gốc.'
      : `${page.description}\n\n**${page.commands.length} lệnh** • \`<...>\` là bắt buộc, \`[...]\` là tùy chọn.`;

  // prettier-ignore
  const embed = new EmbedBuilder()
    .setTitle(`${page.emoji} [BOT] Vô Diện | ${page.title}`)
    .setDescription(pageDescription)
    .setThumbnail(botAvatarUrl)
    .setColor(page.color)
    .setFooter({
      text: 'Chọn danh mục khác hoặc quay lại tổng quan bằng menu bên dưới',
    });

  if (page.id === 'hcmus') {
    const setupCommandMention = hcmusCommandId
      ? chatInputApplicationCommandMention('hcmus-news', 'setup', hcmusCommandId)
      : '`/hcmus-news setup`';
    let commandList = '';
    for (const command of page.commands) {
      if (commandList) {
        commandList += '\n';
      }
      const commandLabel =
        hcmusCommandId && command.subcommand
          ? chatInputApplicationCommandMention('hcmus-news', command.subcommand, hcmusCommandId)
          : `**${command.name}**`;
      const usageHint = hcmusCommandId && command.usageHint ? ` \`${command.usageHint}\`` : '';
      commandList += `• ${commandLabel}${usageHint} — ${command.description}`;
    }

    // prettier-ignore
    embed.addFields({
      name: `💻 ${page.commands.length} lệnh • <...> bắt buộc, [...] tùy chọn`,
      value: commandList,
    });

    // prettier-ignore
    embed.addFields({
      name: '🔐 Điều kiện nhận tin tự động',
      value: '\n- **Bot:** được thêm vào server và có đủ quyền **View Channel**, **Send Messages**, **Embed Links** tại kênh nhận tin (Quyền này sẽ được yêu cầu lúc bạn thêm bot vào server).\n\n' +
        `- **Bạn:** cần có quyền **Manage Channels** hoặc **Administrator** để dùng ${setupCommandMention}. Mỗi server chỉ có thể chọn **1 kênh** nhận tin.\n\n` +
        '> Tips: Bạn nên tạo 1 server mới cho riêng bạn, lúc này bạn sẽ có đầy đủ các quyền, và nhớ set Notification trong Channels đó là All Messages để không miss tin tức.'
    });

    let sourceField =
      'Đây là các nguồn mà bot sẽ gửi tin đến cho bạn, bạn có thể check lại độ chính xác ở đây:';
    for (const source of NEWS_SOURCES) {
      sourceField += `\n• [${source.name}](${source.sourceLink})`;
    }

    // prettier-ignore
    embed.addFields({
      name: '🌐 Nguồn tin',
      value: sourceField,
    });

    return embed;
  }

  for (const command of page.commands) {
    // prettier-ignore
    embed.addFields({
      name: command.name,
      value: command.description,
      inline: false,
    });
  }

  return embed;
}
