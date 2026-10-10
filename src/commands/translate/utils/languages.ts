const LANGUAGE_LABELS: Record<string, string> = {
  VI: '🇻🇳 Tiếng Việt',
  EN: '🇺🇸 Tiếng Anh',
  'EN-US': '🇺🇸 Tiếng Anh (Mỹ)',
  'EN-GB': '🇬🇧 Tiếng Anh (Anh)',
  JA: '🇯🇵 Tiếng Nhật',
  KO: '🇰🇷 Tiếng Hàn',
  ZH: '🇨🇳 Tiếng Trung',
  FR: '🇫🇷 Tiếng Pháp',
  DE: '🇩🇪 Tiếng Đức',
  ES: '🇪🇸 Tiếng Tây Ban Nha',
  'PT-BR': '🇧🇷 Tiếng Brazil',
  PT: '🇵🇹 Tiếng Bồ Đào Nha',
  AR: '🇸🇦 Tiếng Ả Rập',
  BG: '🇧🇬 Tiếng Bulgaria',
  CS: '🇨🇿 Tiếng Séc',
  DA: '🇩🇰 Tiếng Đan Mạch',
  EL: '🇬🇷 Tiếng Hy Lạp',
  ET: '🇪🇪 Tiếng Estonia',
  FI: '🇫🇮 Tiếng Phần Lan',
  HU: '🇭🇺 Tiếng Hungary',
  ID: '🇮🇩 Tiếng Indonesia',
  IT: '🇮🇹 Tiếng Ý',
  LT: '🇱🇹 Tiếng Litva',
  LV: '🇱🇻 Tiếng Latvia',
  NB: '🇳🇴 Tiếng Na Uy',
  NL: '🇳🇱 Tiếng Hà Lan',
  PL: '🇵🇱 Tiếng Ba Lan',
  RO: '🇷🇴 Tiếng Romania',
  RU: '🇷🇺 Tiếng Nga',
  SK: '🇸🇰 Tiếng Slovakia',
  SL: '🇸🇮 Tiếng Slovenia',
  ST: '🇱🇸 Tiếng Nam Sotho',
  SV: '🇸🇪 Tiếng Thụy Điển',
  TH: '🇹🇭 Tiếng Thái',
  TR: '🇹🇷 Tiếng Thổ Nhĩ Kỳ',
  UK: '🇺🇦 Tiếng Ukraina',
};

const vietnameseLanguageNames = new Intl.DisplayNames(['vi'], { type: 'language' });

export function languageLabel(code: string): string {
  const normalizedCode = code.trim().toUpperCase();
  const knownLabel = LANGUAGE_LABELS[normalizedCode];
  if (knownLabel) {
    return knownLabel;
  }

  try {
    const localizedName = vietnameseLanguageNames.of(normalizedCode.toLowerCase());
    if (localizedName && localizedName.toLowerCase() !== normalizedCode.toLowerCase()) {
      return localizedName;
    }
  } catch {
    // Keep the API code visible if it is not a valid language identifier.
  }

  return `Ngôn ngữ (${normalizedCode})`;
}
