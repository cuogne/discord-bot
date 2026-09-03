export interface DictionaryDefinition {
  definition: string;
  synonyms?: string[];
  antonyms?: string[];
  example?: string;
}

export interface DictionaryMeaning {
  partOfSpeech: string;
  definitions: DictionaryDefinition[];
  synonyms?: string[];
  antonyms?: string[];
}

export interface DictionaryPhonetic {
  text?: string;
  audio?: string;
}

export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  phonetics?: DictionaryPhonetic[];
  meanings?: DictionaryMeaning[];
}

export interface PartOfSpeechInfo {
  definitions: string[];
  synonyms: Set<string>;
  antonyms: Set<string>;
}

export interface ParsedWord {
  word: string;
  phonetic: string;
  partsOfSpeech: Map<string, PartOfSpeechInfo>;
}
