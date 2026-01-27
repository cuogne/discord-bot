import { EmbedBuilder } from 'discord.js';
import { splitTextSmartly } from './splitSmart.js';

export function buildEmbedsFromText(text, { title, color }) {
  const SAFE_DESC = 3800;
  const chunks = splitTextSmartly(text, SAFE_DESC);

  return chunks.map((chunk, idx) => {
    const embed = new EmbedBuilder()
      .setColor(color)
      .setDescription(chunk);

    if (idx === 0 && title) {
      embed.setTitle(title);
    }

    if (chunks.length > 1) {
      embed.setFooter({
        text: `Gemini 2.5 Flash • Trang ${idx + 1}/${chunks.length}`,
      });
    }

    return embed;
  });
}