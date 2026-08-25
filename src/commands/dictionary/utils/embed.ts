import { EmbedBuilder } from 'discord.js';
import type { ParsedWord } from '../types/types.ts';

const MAX_FIELD_VALUE = 1024;
const MAX_DEFINITIONS = 10;
const MAX_RELATED_WORDS = 20;

const POS_DISPLAY_NAMES: Record<string, string> = {
  noun: '**Noun (n.)**',
  verb: '**Verb (v.)**',
  adjective: '**Adjective (adj.)**',
  adverb: '**Adverb (adv.)**',
  pronoun: '**Pronoun (pron.)**',
  preposition: '**Preposition (prep.)**',
  conjunction: '**Conjunction (conj.)**',
  interjection: '**Interjection (interj.)**',
  other: '**Other**',
};

function getPosDisplayName(pos: string): string {
  return POS_DISPLAY_NAMES[pos] ?? `**${pos.charAt(0).toUpperCase() + pos.slice(1)}**`;
}

export function buildDictionaryEmbed(parsed: ParsedWord): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(`📚 ${parsed.word}`)
    .setDescription(parsed.phonetic ? `** 🎧 Phonetic:** ${parsed.phonetic}` : null)
    .setTimestamp();

  const entries = Array.from(parsed.partsOfSpeech.entries());

  for (let i = 0; i < entries.length; i++) {
    const [pos, info] = entries[i]!;
    const definitions = info.definitions.slice(0, MAX_DEFINITIONS);
    const synonyms = Array.from(info.synonyms).slice(0, MAX_RELATED_WORDS);
    const antonyms = Array.from(info.antonyms).slice(0, MAX_RELATED_WORDS);

    const chunks: string[] = [];

    if (definitions.length > 0) {
      const defsText = definitions.map((d, idx) => `${idx + 1}. ${d}`).join('\n');
      chunks.push(defsText);
    }

    const relatedWords: string[] = [];
    if (synonyms.length > 0) {
      relatedWords.push(`• **Synonyms:** ${synonyms.join(', ')}`);
    }
    if (antonyms.length > 0) {
      relatedWords.push(`• **Antonyms:** ${antonyms.join(', ')}`);
    }

    if (relatedWords.length > 0) {
      chunks.push(relatedWords.join('\n'));
    }

    if (chunks.length === 0) continue;

    let value = chunks.join('\n');

    if (i < entries.length - 1) {
      value += '\n\u200b'; // tạo khoảng cách
    }

    if (value.length > MAX_FIELD_VALUE) {
      value = value.slice(0, MAX_FIELD_VALUE - 3) + '...';
    }

    embed.addFields({
      name: getPosDisplayName(pos),
      value,
      inline: false,
    });
  }

  return embed;
}
