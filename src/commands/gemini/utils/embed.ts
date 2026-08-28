import { EmbedBuilder } from 'discord.js';
import type { GeminiAttachment } from '../types/types.ts';

export function buildAttachmentPreview(attachment: GeminiAttachment): EmbedBuilder {
  const embed = new EmbedBuilder().setColor(0x5865f2);

  if (attachment.kind === 'image') {
    embed.setImage(attachment.url);
  } else {
    embed.setDescription(`📄 [${attachment.name}](${attachment.url})`);
  }

  return embed;
}
