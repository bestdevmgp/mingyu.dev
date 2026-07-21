export const locales = ["ko", "en", "ja", "zh-Hans", "zh-Hant"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ko";

export const LOCALE_COOKIE = "NEXT_LOCALE";

export const isSupportedLocale = (value: string | null | undefined): value is Locale =>
  !!value && (locales as readonly string[]).includes(value);
