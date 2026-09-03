import type { Attachment } from 'discord.js';
import { fetchWithTimeout } from '../../../utils/http.ts';
import type { GeminiAttachment, GeminiAttachmentKind } from '../types/types.ts';

const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const SUPPORTED_TEXT_TYPES = new Set([
  'text/plain',
  'text/markdown',
  'text/html',
  'text/css',
  'text/csv',
  'text/xml',
  'application/json',
  'application/xml',
  'application/x-yaml',
  'application/yaml',
  'application/javascript',
  'application/typescript',
  'application/x-sh',
  'application/x-shellscript',
  'application/sql',
]);
const SUPPORTED_TEXT_EXTENSIONS = new Set([
  '.txt',
  '.md',
  '.markdown',
  '.csv',
  '.tsv',
  '.json',
  '.xml',
  '.yml',
  '.yaml',
  '.toml',
  '.ini',
  '.cfg',
  '.conf',
  '.env',
  '.html',
  '.htm',
  '.css',
  '.scss',
  '.sass',
  '.less',
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.mjs',
  '.cjs',
  '.c',
  '.h',
  '.cpp',
  '.cc',
  '.hpp',
  '.cs',
  '.java',
  '.kt',
  '.kts',
  '.py',
  '.rb',
  '.go',
  '.rs',
  '.php',
  '.swift',
  '.dart',
  '.lua',
  '.pl',
  '.pm',
  '.r',
  '.jl',
  '.scala',
  '.sh',
  '.bash',
  '.zsh',
  '.fish',
  '.ps1',
  '.psm1',
  '.bat',
  '.cmd',
  '.sql',
  '.graphql',
  '.gql',
  '.proto',
  '.dockerfile',
  '.gitignore',
  '.editorconfig',
  '.properties',
  '.log',
]);

export class GeminiAttachmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiAttachmentError';
  }
}

function getFileExtension(name: string | null): string {
  if (!name) {
    return '';
  }

  const dotIndex = name.lastIndexOf('.');
  if (dotIndex === -1) {
    return '';
  }

  return name.slice(dotIndex).toLowerCase();
}

function getAttachmentKind(mimeType: string, extension: string): GeminiAttachmentKind | null {
  if (SUPPORTED_IMAGE_TYPES.has(mimeType)) {
    return 'image';
  }

  if (mimeType === 'application/pdf') {
    return 'pdf';
  }

  if (SUPPORTED_TEXT_TYPES.has(mimeType) || SUPPORTED_TEXT_EXTENSIONS.has(extension)) {
    return 'text';
  }

  return null;
}

export async function downloadGeminiAttachment(attachment: Attachment): Promise<GeminiAttachment> {
  const mimeType = attachment.contentType?.split(';')[0]?.toLowerCase().trim() ?? '';
  const extension = getFileExtension(attachment.name);
  const kind = getAttachmentKind(mimeType, extension);

  if (!kind) {
    throw new GeminiAttachmentError(
      'Gemini chỉ hỗ trợ ảnh (JPG, PNG, WEBP, GIF), file PDF hoặc file text/code (.txt, .md, .json, .py, .js, ...).',
    );
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
