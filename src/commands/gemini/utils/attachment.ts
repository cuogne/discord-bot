import type { Attachment } from 'discord.js';
import { fetchWithTimeout } from '../../../utils/http.ts';
import type { GeminiAttachment, GeminiAttachmentKind } from '../types/types.ts';

const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export class GeminiAttachmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiAttachmentError';
  }
}

export async function downloadGeminiAttachment(attachment: Attachment): Promise<GeminiAttachment> {
  const mimeType = attachment.contentType?.split(';')[0]?.toLowerCase();
  const kind: GeminiAttachmentKind = mimeType === 'application/pdf' ? 'pdf' : 'image';
  const isSupported = kind === 'pdf' || Boolean(mimeType && SUPPORTED_IMAGE_TYPES.has(mimeType));

  if (!mimeType || !isSupported) {
    throw new GeminiAttachmentError('Gemini chỉ hỗ trợ ảnh JPG, PNG, WEBP hoặc file PDF.');
  }

  if (attachment.size > MAX_ATTACHMENT_SIZE_BYTES) {
    throw new GeminiAttachmentError('Ảnh hoặc file quá lớn. Vui lòng gửi file nhỏ hơn 10MB.');
  }

  const response = await fetchWithTimeout(attachment.url);
  if (!response.ok) {
    throw new Error(`Discord attachment responded with ${response.status}`);
  }

  const data = await response.arrayBuffer();
  if (data.byteLength > MAX_ATTACHMENT_SIZE_BYTES) {
    throw new GeminiAttachmentError('Ảnh hoặc file quá lớn. Vui lòng gửi file nhỏ hơn 10MB.');
  }

  return {
    kind,
    name: attachment.name,
    url: attachment.url,
    mimeType,
    data: Buffer.from(data).toString('base64'),
    size: data.byteLength,
  };
}
