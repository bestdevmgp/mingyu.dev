const FONT_CLASS: Record<string, string> = {
  en: "font-en",
  ja: "font-ja",
  "zh-Hans": "font-zh-hans",
  "zh-Hant": "font-zh-hant",
};

const localeFontClass = (locale: string) => FONT_CLASS[locale] ?? "font-ko";

export default localeFontClass;
