import { GoogleGenAI } from '@google/genai';
import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from '../../types/command.ts';
import { generateContentStreamWithFallback } from './utils/client.ts';
import { getCooldownRemainingMs, markCooldown } from './utils/cooldown.ts';
import { isTimeoutError } from './utils/errors.ts';
import { StreamReplier } from './utils/streamReply.ts';
import { formatResponseTime } from './utils/timeout.ts';
import { logger } from '../../logging/logger.ts';

const command: SlashCommand = {
  // prettier-ignore
  data: new SlashCommandBuilder()
    .setName('gemini')
    .setDescription('Chat với AI Gemini (Google)')
    .addStringOption((option) =>
      option
        .setName('prompt')
        .setDescription('Nhập câu hỏi hoặc yêu cầu của bạn')
        .setRequired(true),
    ),

  async execute(interaction) {
    if (!process.env.GEMINI_API_KEY) {
      await interaction.reply({
        content: 'Chưa cấu hình Gemini API key, không thể sử dụng lệnh này',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const cooldownRemainingMs = getCooldownRemainingMs(interaction.user.id);
    if (cooldownRemainingMs > 0) {
      const cooldownRemainingSeconds = Math.ceil(cooldownRemainingMs / 1000);
      await interaction.reply({
        content: `Bạn chờ ${cooldownRemainingSeconds}s rồi dùng /gemini tiếp nha.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    markCooldown(interaction.user.id);

    const prompt = interaction.options.getString('prompt', true);
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    try {
      await interaction.deferReply();

      const startedAt = Date.now();
      const { responseStream, model } = await generateContentStreamWithFallback(ai, prompt);

      const replier = new StreamReplier(interaction);
      let tokensInput = 0;
      let tokensOutput = 0;

      for await (const chunk of responseStream) {
        if (chunk.text) {
          await replier.append(chunk.text);
        }

        if (chunk.usageMetadata) {
          tokensInput = chunk.usageMetadata.promptTokenCount ?? tokensInput;
          tokensOutput = chunk.usageMetadata.candidatesTokenCount ?? tokensOutput;
        }
      }

      const safeText = replier.fullText.trim();
      if (!safeText) {
        await interaction.editReply({
          content: 'Không nhận được phản hồi từ Gemini. Vui lòng thử lại.',
        });
        return;
      }

      await replier.finish();

      logger.info(
        {
          userId: interaction.user.id,
          user: interaction.user.username,
          guildId: interaction.guildId ?? 'DM',
          options: { prompt },
          model,
          responseTime: formatResponseTime(Date.now() - startedAt),
          tokensInput,
          tokensOutput,
        },
        'gemini response',
      );
    } catch (err) {
      logger.error({ err }, 'Gemini command error');
      const message = isTimeoutError(err)
        ? 'AI dỏm nên phản hồi hơi lâu, hãy donate cho chủ bot để nâng cấp model.'
        : 'Đã xảy ra lỗi khi gọi Gemini. Vui lòng thử lại.';

      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(message);
      } else {
        await interaction.reply({
          content: message,
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
};

export default command;
