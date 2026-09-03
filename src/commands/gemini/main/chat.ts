import { MessageFlags } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import { setCommandUsageError, setGeminiUsageLog } from '../../../logging/context.ts';
import { logger } from '../../../logging/logger.ts';
import { formatResponseTime } from '../../../utils/format.ts';
import { isGeminiConfigured } from '../../../core/gemini/config.ts';
import { getGeminiClient } from '../../../core/gemini/client.ts';
import { generateContentStreamWithFallback } from './client.ts';
import { handleCooldown, markCooldown } from '../utils/cooldown.ts';
import { downloadGeminiAttachment } from '../utils/attachment.ts';
import { buildAttachmentPreview } from '../utils/embed.ts';
import { StreamReplier } from '../utils/streamReply.ts';
import { getGeminiErrorMessage } from '../utils/error.ts';

export async function handleGemini(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!isGeminiConfigured()) {
    await interaction.reply({
      content: 'Chưa cấu hình Gemini API key, không thể sử dụng lệnh này',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  // cooldown 10s for each request
  if (await handleCooldown(interaction)) {
    return;
  }
  markCooldown(interaction.user.id);

  // handle Gemini prompt and attachment
  const prompt = interaction.options.getString('prompt', true);
  const selectedModel = interaction.options.getString('model') ?? undefined;
  const selectedAttachment = interaction.options.getAttachment('attachment');

  const ai = getGeminiClient();

  try {
    await interaction.deferReply();

    const startedAt = Date.now(); // start to measure response time
    const attachment = selectedAttachment
      ? await downloadGeminiAttachment(selectedAttachment)
      : undefined;

    if (attachment) {
      // send a preview of the attachment to the user
      await interaction.editReply({
        embeds: [buildAttachmentPreview(attachment)],
      });
    }

    // generate content stream with fallback model
    const { responseStream, model } = await generateContentStreamWithFallback(
      ai,
      prompt,
      attachment,
      selectedModel,
    );

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

    if (!replier.fullText.trim()) {
      await interaction.editReply({
        content: 'Không nhận được phản hồi từ Gemini. Vui lòng thử lại.',
      });
      return;
    }

    await replier.finish();

    // end to measure response time
    const responseTime = formatResponseTime(Date.now() - startedAt);
    setGeminiUsageLog(interaction, {
      responseTime,
      tokensInput,
      tokensOutput,
    });

    // log of gemini
    logger.info(
      {
        userId: interaction.user.id,
        user: interaction.user.username,
        guildId: interaction.guildId ?? 'DM',
        options: {
          prompt,
          attachment: attachment
            ? {
                kind: attachment.kind,
                name: attachment.name,
                size: attachment.size,
                contentType: attachment.mimeType,
              }
            : undefined,
        },
        model,
        responseTime,
        tokensInput,
        tokensOutput,
      },
      'gemini response',
    );
  } catch (error) {
    setCommandUsageError(interaction, error);
    logger.error(
      {
        err: error,
        command: interaction.commandName,
      },
      'Gemini command error',
    );

    const message = getGeminiErrorMessage(error);

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(message);
    } else {
      await interaction.reply({
        content: message,
        flags: MessageFlags.Ephemeral,
      });
    }
  }
}
