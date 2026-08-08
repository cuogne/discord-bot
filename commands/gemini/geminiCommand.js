import { GoogleGenAI } from '@google/genai';
import { getCooldownRemainingMs, markCooldown } from './utils/cooldown.js';
import { isTimeoutError } from './utils/errors.js';
import { formatResponseTime } from './utils/timeout.js';
import { generateContentStreamWithFallback } from './utils/geminiClient.js';
import { StreamReplier } from './utils/streamReply.js';

export async function geminiCommand(interaction) {
  if (!process.env.GEMINI_API_KEY) {
    await interaction.reply({
      content: 'Chưa cấu hình Gemini API key, không thể sử dụng lệnh này',
      ephemeral: true,
    });
    return;
  }

  const cooldownRemainingMs = getCooldownRemainingMs(interaction.user.id);
  if (cooldownRemainingMs > 0) {
    const cooldownRemainingSeconds = Math.ceil(cooldownRemainingMs / 1000);
    await interaction.reply({
      content: `Bạn chờ ${cooldownRemainingSeconds}s rồi dùng /gemini tiếp nha.`,
      ephemeral: true,
    });
    return;
  }

  markCooldown(interaction.user.id);

  const prompt = interaction.options.getString('prompt');
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  try {
    await interaction.deferReply();

    const { responseStream, model, startedAt } = await generateContentStreamWithFallback(ai, prompt);

    const replier = new StreamReplier(interaction);

    for await (const chunk of responseStream) {
      if (chunk.text) {
        await replier.append(chunk.text);
      }
    }

    const safeText = replier.fullText.trim();
    if (!safeText) {
      await interaction.editReply('Không nhận được phản hồi từ Gemini. Vui lòng thử lại.');
      return;
    }

    const responseTime = formatResponseTime(Date.now() - startedAt);
    replier.fullText += `\n\n-# ${model} • Time response: ${responseTime}`;

    await replier.finish();
  } catch (err) {
    console.error('Gemini command error:', err);
    const message = isTimeoutError(err)
      ? 'AI dỏm nên phản hồi hơi lâu, hãy donate cho chủ bot để nâng cấp model.'
      : 'Đã xảy ra lỗi khi gọi Gemini. Vui lòng thử lại.';

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(message);
    } else {
      await interaction.reply({ content: message, ephemeral: true });
    }
  }
}
