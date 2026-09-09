export const locales = ["ko", "en", "ja", "zh-Hans", "zh-Hant"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ko";

export const LOCALE_COOKIE = "NEXT_LOCALE";

export const isSupportedLocale = (value: string | null | undefined): value is Locale =>
  !!value && (locales as readonly string[]).includes(value);

const HREFLANG: Record<Locale, string> = {
  ko: "ko-KR",
  en: "en",
  ja: "ja-JP",
  "zh-Hans": "zh-Hans",
  "zh-Hant": "zh-Hant",
};

export const localePath = (locale: string, path = "") => (locale === defaultLocale ? path || "/" : `/${locale}${path}`);

export const languageAlternates = (path = "") =>
  Object.fromEntries([
    ...locales.map(code => [HREFLANG[code], localePath(code, path)]),
    ["x-default", localePath(defaultLocale, path)],
  ]);
