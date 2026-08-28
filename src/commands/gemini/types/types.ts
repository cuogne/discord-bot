export type GeminiAttachmentKind = 'image' | 'pdf';

export interface GeminiAttachment {
  kind: GeminiAttachmentKind;
  name: string;
  url: string;
  mimeType: string;
  data: string;
  size: number;
}
