import { EmbedBuilder } from 'discord.js';

export function buildImageEmbed(username: string, animal: string, imageUrl: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(`${username} muốn xem ảnh ${animal}`)
    .setImage(imageUrl);
}
