import { EmbedBuilder } from 'discord.js';
import { splitTextSmartly } from './splitSmart.js';

export function buildEmbedsFromText(text, { title, color, model, responseTime }) {
  const SAFE_DESC = 3800;
  const chunks = splitTextSmartly(text, SAFE_DESC);

  return chunks.map((chunk, idx) => {
    const embed = new EmbedBuilder()
      .setColor(color)
      .setDescription(chunk);

    if (idx === 0 && title) {
      embed.setTitle(title);
    }

    embed.setFooter({
      text: `${model} • Time Response: ${responseTime} • Trang ${idx + 1}/${chunks.length}`,
    });

    return embed;
  });
}
