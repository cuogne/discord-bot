import { AttachmentBuilder, EmbedBuilder, MessageFlags, SlashCommandBuilder } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';
import { getGeminiClient } from '../../core/gemini/client.ts';
import { GeminiConfigError, isGeminiConfigured } from '../../core/gemini/config.ts';
import type { SlashCommand } from '../../types/command.ts';
import { formatResponseTime } from '../../utils/format.ts';
import { logger } from '../../logging/logger.ts';
import { setGeminiUsageLog } from '../../logging/context.ts';
import type { OmikujiGenerationResult } from './utils/client.ts';
import { generateOmikujiMessage } from './utils/client.ts';
import {
  buildOmikujiPrompt,
  OMIKUJI_EMBED_COLOR,
  OMIKUJI_RESULTS,
  TOPICS,
} from './utils/config.ts';

const command: SlashCommand = {
  // prettier-ignore
  data: new SlashCommandBuilder()
    .setName('omikuji')
    .setDescription('Xem quẻ bói omikuji Nhật Bản'),

  async execute(interaction) {
    if (!isGeminiConfigured()) {
      await interaction.reply({
        content: 'Chưa cấu hình Gemini API key, không thể sử dụng lệnh này',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply();

    const resultIdx = Math.floor(Math.random() * OMIKUJI_RESULTS.length);
    const topicIdx = Math.floor(Math.random() * TOPICS.length);
    const omikujiName = OMIKUJI_RESULTS[resultIdx]!;
    const topic = TOPICS[topicIdx]!;

    const assetsDir = path.join(import.meta.dir, 'assets');
    const imageName = fs
      .readdirSync(assetsDir)
      .filter((file) => file.endsWith('.png'))
      .sort()[resultIdx]!;
    const attachment = new AttachmentBuilder(path.join(assetsDir, imageName), {
      name: imageName,
    });

    const ai = getGeminiClient();

    const startedAt = Date.now();
    let result: OmikujiGenerationResult;
    try {
      result = await generateOmikujiMessage(ai, buildOmikujiPrompt(omikujiName, topic));
    } catch (err) {
      logger.error(
        {
          err,
          omikuji: omikujiName,
          topic,
        },
        'Omikuji command error',
      );
      const message =
        err instanceof GeminiConfigError
          ? 'Chưa cấu hình GEMINI_MODELS, không thể sử dụng lệnh này.'
          : 'Đã xảy ra lỗi khi xin quẻ. Vui lòng thử lại.';
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(message);
      } else {
        await interaction.reply({
          content: message,
          flags: MessageFlags.Ephemeral,
        });
      }
      return;
    }

    if (!result.text.trim()) {
      await interaction.editReply('Không nhận được lời quẻ. Vui lòng thử lại.');
      return;
    }

    const responseTime = formatResponseTime(Date.now() - startedAt);
    setGeminiUsageLog(interaction, {
      responseTime,
      tokensInput: result.tokensInput,
      tokensOutput: result.tokensOutput,
    });

    logger.info(
      {
        userId: interaction.user.id,
        user: interaction.user.username,
        guildId: interaction.guildId ?? 'DM',
        omikuji: omikujiName,
        topic,
        model: result.model,
        responseTime,
        tokensInput: result.tokensInput,
        tokensOutput: result.tokensOutput,
      },
      'omikuji response',
    );

    const embed = new EmbedBuilder()
      .setColor(OMIKUJI_EMBED_COLOR)
      .setTitle(`🃏 Quẻ ${omikujiName}`)
      .setAuthor({
        name: `${interaction.user.username} ơi, quẻ Omikuji của bạn hôm nay là:`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setDescription(`**Lời nhắn nhủ:**\n${result.text}`)
      .setImage(`attachment://${imageName}`)
      .setFooter({ text: 'おみくじ • Omikuji' });

    await interaction.editReply({
      files: [attachment],
      embeds: [embed],
    });
  },
};

export default command;
