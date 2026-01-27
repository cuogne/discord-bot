import { GoogleGenAI } from '@google/genai';
import { buildEmbedsFromText } from './utils/buildEmbedsFromText.js';
import { batchEmbedsSafely } from './utils/batchEmbed.js';

export async function geminiCommand(interaction) {
  if (!process.env.GEMINI_API_KEY) {
    await interaction.reply({ 
      content: 'Chưa cấu hình Gemini API key, không thể sử dụng lệnh này', 
      ephemeral: true 
    });
    return;
  }

  const prompt = interaction.options.getString('prompt');
  const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY 
  });

  try {
    await interaction.deferReply();

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = typeof result.text === 'function' ? await result.text() : result.text;
    const safeText = (text ?? '').toString();

    if (!safeText.trim()) {
      await interaction.editReply('Không nhận được phản hồi từ Gemini.');
      return;
    }

    const embeds = buildEmbedsFromText(safeText, {
      title: 'Kết quả từ Gemini',
      color: 0x1a73e8,
    });

    const batches = batchEmbedsSafely(embeds);

    for (let i = 0; i < batches.length; i++) {
      if (i === 0) {
        await interaction.editReply({ embeds: batches[i] });
      } else {
        await interaction.followUp({ embeds: batches[i] });
      }
    }
  } catch (err) {
    console.error('Gemini command error:', err);
    const message = 'Đã xảy ra lỗi khi gọi Gemini. Vui lòng thử lại.';
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(message);
    } else {
      await interaction.reply({ content: message, ephemeral: true });
    }
  }
}