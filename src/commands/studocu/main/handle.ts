import { AttachmentBuilder, MessageFlags, type ChatInputCommandInteraction } from 'discord.js';
import { setCommandUsageError, setStudocuTimingLog } from '../../../logging/context.ts';
import { logger } from '../../../logging/logger.ts';
import { sanitizeBrowserlessError } from '../api/browserless.ts';
import { downloadStudocu } from './download.ts';
import { StudocuDownloadError } from '../types/types.ts';
import {
  formatStudocuFileName,
  formatStudocuStatus,
  formatStudocuSuccess,
} from '../utils/message.ts';
import { createStudocuProgressReporter } from '../utils/progress.ts';
import { getStudocuDocumentId, parseStudocuDocumentUrl } from '../utils/url.ts';

export async function handleStudocu(interaction: ChatInputCommandInteraction): Promise<void> {
  const commandStartedAt = Date.now();
  const url = parseStudocuDocumentUrl(interaction.options.getString('link', true));
  if (!url) {
    setCommandUsageError(interaction, 'invalid-url');
    // prettier-ignore
    await interaction.reply({
      content: 'Link không hợp lệ. Hãy dán link trang tài liệu Studocu.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.deferReply();
  const progress = createStudocuProgressReporter(interaction);
  const slug =
    url.pathname.split('/').filter(Boolean).at(-2)?.replaceAll('-', ' ') ?? 'Tài liệu Studocu';
  let title = slug;

  const showProgress = (stage: string): void => {
    progress.report(formatStudocuStatus(title, stage));
  };

  try {
    const { pdf, pageCount, timings } = await downloadStudocu(url, (event) => {
      switch (event.phase) {
        case 'connecting':
          showProgress('⏳ Đang kết nối đến server...');
          break;
        case 'navigating':
          showProgress('🌐 Đang kết nối đến Studocu...');
          break;
        case 'navigated':
          title = event.title.replace(/\s+- Studocu$/i, '') || slug;
          showProgress('🔎 Đang chuẩn bị quét tài liệu...');
          break;
        case 'scanning':
          showProgress(`🔎 Đã quét ${event.collected}/${event.expected || '?'} trang`);
          break;
        case 'rendering':
          showProgress(`📄 Đã quét ${event.pageCount}/${event.pageCount} trang, đang tạo PDF...`);
          break;
      }
    });
    const downloadFinishedAt = Date.now();
    await progress.finish();
    if (pdf.length > interaction.attachmentSizeLimit) {
      setCommandUsageError(interaction, 'attachment-too-large');
      // prettier-ignore
      await interaction.editReply({
        content: formatStudocuStatus(title, '⚠️ Tài liệu quá lớn để gửi qua Discord ở kênh này.'),
        allowedMentions: { parse: [] },
      });
      return;
    }

    const documentId = getStudocuDocumentId(url) ?? 'document';
    const attachment = new AttachmentBuilder(pdf, {
      name: formatStudocuFileName(title, documentId),
    });
    // prettier-ignore
    await interaction.editReply({
      content: formatStudocuSuccess(title, pageCount, pdf.length),
      files: [attachment],
      allowedMentions: { parse: [] },
    });

    const timingLog = {
      connectionMs: timings.connectionMs,
      navigationMs: timings.navigationMs,
      scanMs: timings.scanMs,
      pdfMs: timings.pdfMs,
      deliveryMs: timings.closeMs + Date.now() - downloadFinishedAt,
      pageCount,
      pdfBytes: pdf.length,
    };
    setStudocuTimingLog(interaction, timingLog);
    // prettier-ignore
    logger.info(
      {
        command: 'studocu',
        documentId,
        userId: interaction.user.id,
        ...timingLog,
        totalMs: Date.now() - commandStartedAt,
      },
      'Studocu download completed',
    );
  } catch (error) {
    await progress.finish();
    setCommandUsageError(
      interaction,
      error instanceof StudocuDownloadError ? error.reason : 'download-failed',
    );
    // prettier-ignore
    logger.error(
      {
        err: sanitizeBrowserlessError(error),
        command: interaction.commandName,
        userId: interaction.user.id,
        documentId: getStudocuDocumentId(url),
      },
      'Studocu download failed',
    );

    const message =
      error instanceof StudocuDownloadError && error.reason === 'unavailable'
        ? 'Tài liệu không còn khả dụng trên Studocu (404/410). Hãy kiểm tra lại link.'
        : error instanceof StudocuDownloadError && error.reason === 'blocked'
          ? 'Studocu chưa hiển thị trang tài liệu sau 2 lần thử. Có thể phiên truy cập đang bị chặn; vui lòng thử lại sau.'
          : error instanceof StudocuDownloadError && error.reason === 'incomplete'
            ? 'Không quét đủ trang tài liệu trong thời gian cho phép. Vui lòng thử lại sau.'
            : error instanceof StudocuDownloadError && error.reason === 'connection'
              ? 'Kết nối tới Studocu bị đóng. Bot đã thử lại nhưng vẫn không mở được tài liệu.'
              : 'Không thể tải tài liệu lúc này. Vui lòng thử lại sau hoặc liên hệ admin bot.';

    // prettier-ignore
    await interaction.editReply({
      content: formatStudocuStatus(title, `${message}`),
      allowedMentions: { parse: [] },
    });
  }
}
