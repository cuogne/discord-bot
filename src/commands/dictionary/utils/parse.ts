import type { DictionaryEntry, ParsedWord, PartOfSpeechInfo } from '../types/types.ts';

function getFirstPhonetic(data: DictionaryEntry[]): string {
  const direct = data.find((e) => typeof e.phonetic === 'string' && e.phonetic.trim());
  if (direct?.phonetic) return direct.phonetic;

  const fromList = data
    .find((e) => Array.isArray(e.phonetics) && e.phonetics.some((p) => p.text))
    ?.phonetics?.find((p) => p.text);
  return fromList?.text ?? '';
}

export function parseDictionary(data: DictionaryEntry[], fallbackWord: string): ParsedWord {
  const word = data[0]?.word || fallbackWord;
  const phonetic = getFirstPhonetic(data);
  const partsOfSpeech = new Map<string, PartOfSpeechInfo>();

  for (const entry of data) {
    const meanings = Array.isArray(entry.meanings) ? entry.meanings : [];

    for (const meaning of meanings) {
      const pos = meaning.partOfSpeech || 'other';
      const info: PartOfSpeechInfo = partsOfSpeech.get(pos) ?? {
        definitions: [],
        synonyms: new Set(),
        antonyms: new Set(),
      };

      const defs = Array.isArray(meaning.definitions) ? meaning.definitions : [];

      for (const def of defs) {
        if (def && typeof def.definition === 'string' && def.definition.trim()) {
          info.definitions.push(def.definition.trim());
        }
        if (Array.isArray(def.synonyms)) {
          def.synonyms.forEach((s) => s && info.synonyms.add(s));
        }
        if (Array.isArray(def.antonyms)) {
          def.antonyms.forEach((a) => a && info.antonyms.add(a));
        }
      }

      if (Array.isArray(meaning.synonyms)) {
        meaning.synonyms.forEach((s) => s && info.synonyms.add(s));
      }
      if (Array.isArray(meaning.antonyms)) {
        meaning.antonyms.forEach((a) => a && info.antonyms.add(a));
      }

      partsOfSpeech.set(pos, info);
    }
  }

  return { word, phonetic, partsOfSpeech };
}
