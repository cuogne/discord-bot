import { AttachmentBuilder, EmbedBuilder, escapeMarkdown } from 'discord.js';
import type { Guild } from 'discord.js';
import path from 'node:path';
import { logger } from '../logging/logger.ts';
import { getChatInputCommandId } from '../utils/command.ts';
import { findInviterId, findWelcomeChannel } from './utils/guildWelcome.ts';

const SUPPORT_USER_ID = '853264116332101652';
const GIF_NAME = 'vodien.gif';
const GIF_PATH = path.join(import.meta.dir, '../assets/vodien.gif');

export async function sendGuildWelcomeMessage(guild: Guild): Promise<void> {
  const botMember = guild.members.me ?? (await guild.members.fetchMe());
  const channel = findWelcomeChannel(guild, botMember);

  if (!channel) {
    // prettier-ignore
    logger.warn(
      {
        guildId: guild.id,
      },
      'No channel available for guild welcome message',
    );
    return;
  }

  const inviterId = await findInviterId(guild, botMember);
  const helpCommandId = await getChatInputCommandId(guild.client, 'help');
  const helpMention = helpCommandId ? `</help:${helpCommandId}>` : '/help';
  const greeting = inviterId ? `Hello <@${inviterId}> và toàn thể ae` : 'Hello toàn thể ae';
  const description =
    `${greeting} trong server **${escapeMarkdown(guild.name)}**! Cảm ơn vì đã sử dụng bot của mình 🎉.\n\n` +
    `**Để bắt đầu sử dụng:** \n${helpMention} để xem danh sách lệnh và hướng dẫn sử dụng bot.\n\n` +
    `**Cần hỗ trợ hoặc góp ý?**\n` +
    `> Liên hệ <@${SUPPORT_USER_ID}>. Mình sẽ cố gắng phản hồi sớm nhất!\n\n` +
    '*Chúc bạn một ngày vui vẻ!*';

  // prettier-ignore
  const embed = new EmbedBuilder()
    .setTitle('[BOT] Vô Diện xin chào!')
    .setThumbnail(guild.client.user.displayAvatarURL())
    .setDescription(description)
    .setImage(`attachment://${GIF_NAME}`)
    .setColor(0xcc8f98);

  const gif = new AttachmentBuilder(GIF_PATH, {
    name: GIF_NAME,
  });

  // prettier-ignore
  await channel.send({
    embeds: [embed],
    files: [gif],
    allowedMentions: {
      users: inviterId ? [inviterId] : [],
    },
  });
}
