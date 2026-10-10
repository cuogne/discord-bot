import { AttachmentBuilder, EmbedBuilder } from 'discord.js';
import type { TranslationResult } from '../api/client.ts';
import { languageLabel } from './languages.ts';

const MAX_FIELD_LENGTH = 1024;

export interface TranslationPresentation {
  embed: EmbedBuilder;
  files: AttachmentBuilder[];
}

export function buildTranslationPresentation(
  original: string,
  targetLanguage: string,
  result: TranslationResult,
): TranslationPresentation {
  const files: AttachmentBuilder[] = [];
  let translatedText = result.text;

  if (translatedText.length > MAX_FIELD_LENGTH) {
    const name = 'ban-dich.txt';
    files.push(new AttachmentBuilder(Buffer.from(translatedText, 'utf8'), { name }));
    translatedText = `${translatedText.slice(0, 900)}…\nXem bản đầy đủ trong tệp đính kèm.`;
  }

  // prettier-ignore
  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('🌐 Vô Diện Translator')
    .setDescription(`Dịch sang ${languageLabel(targetLanguage)}`)
    .addFields(
      {
        name: 'Bản gốc',
        value: original,
      },
      {
        name: 'Bản dịch',
        value: translatedText,
      },
    );

  return { embed, files };
}
