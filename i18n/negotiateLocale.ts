import { defaultLocale, locales, type Locale } from "./config";

export const UNSUPPORTED_LOCALE: Locale = "en";

export const BARE_LOCALES = locales.filter(locale => !locale.includes("-"));

export const TRADITIONAL_REGIONS = ["tw", "hk", "mo"];
const SIMPLIFIED_REGIONS = ["cn", "sg", "my"];

const parseAcceptLanguage = (header: string): string[] =>
  header
    .split(",")
    .map(part => {
      const [rawTag, ...params] = part.trim().split(";");
      let q = 1;
      for (const param of params) {
        const [key, value] = param.trim().split("=");
        if (key === "q" && value?.trim()) {
          const parsed = Number(value);
          if (!Number.isNaN(parsed)) q = parsed;
        }
      }
      return { tag: rawTag.trim().toLowerCase(), q };
    })
    .filter(entry => entry.tag && entry.q > 0)
    .sort((a, b) => b.q - a.q)
    .map(entry => entry.tag);

const matchChinese = (subtags: string[]): Locale => {
  if (subtags.includes("hant")) return "zh-Hant";
  if (subtags.includes("hans")) return "zh-Hans";
  for (const subtag of subtags) {
    if (TRADITIONAL_REGIONS.includes(subtag)) return "zh-Hant";
    if (SIMPLIFIED_REGIONS.includes(subtag)) return "zh-Hans";
  }
  return "zh-Hans";
};

const matchTag = (tag: string): Locale | null => {
  const [primary, ...subtags] = tag.split("-");
  if (primary === "zh") return matchChinese(subtags);
  return BARE_LOCALES.find(locale => locale === primary) ?? null;
};

export const negotiateLocale = (acceptLanguage: string | null | undefined): Locale => {
  if (!acceptLanguage) return defaultLocale;
  for (const tag of parseAcceptLanguage(acceptLanguage)) {
    if (tag === "*") return defaultLocale;
    const matched = matchTag(tag);
    if (matched) return matched;
  }
  return UNSUPPORTED_LOCALE;
};
