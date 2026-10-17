import { escapeMarkdown } from 'discord.js';

function formatTitle(title: string): string {
  return escapeMarkdown(title.replace(/\s+/g, ' ').trim().slice(0, 140));
}

export function formatStudocuStatus(title: string, stage: string): string {
  return `📄 Tên tài liệu: **${formatTitle(title)}**\n${stage}`;
}

export function formatStudocuSuccess(title: string, pageCount: number, pdfBytes: number): string {
  const sizeMb = new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(pdfBytes / 1_000_000);

  return `✅ Tải thành công, đây là tài liệu **${formatTitle(title)}** của bạn:\nSố trang: ${pageCount}\nĐịnh dạng file: PDF\nDung lượng: ${sizeMb} MB`;
}

export function formatStudocuFileName(title: string, documentId: string): string {
  const suffix = ` - Studocu - ${documentId}.pdf`;
  const safeTitle = title
    .replace(/\s+/g, ' ')
    .replace(/[<>:"/\\|?*\p{Cc}]/gu, ' ')
    .trim()
    .replace(/[. ]+$/g, '');
  const maxTitleBytes = 240 - Buffer.byteLength(suffix);
  let fileTitle = '';

  for (const character of safeTitle || 'Tài liệu') {
    if (Buffer.byteLength(fileTitle + character) > maxTitleBytes) {
      break;
    }
    fileTitle += character;
  }

  return `${fileTitle.trimEnd()}${suffix}`;
}
