import { LOCALE_COOKIE, locales, type Locale } from "./config";
import { FONT_PRELOAD_LINK } from "./fontPreload";
import { BARE_LOCALES, TRADITIONAL_REGIONS, UNSUPPORTED_LOCALE } from "./negotiateLocale";

type Condition = { type: "header" | "cookie"; key: string; value?: string };
type Rule = { locale: Locale; has: Condition[]; missing?: Condition[] };

const ENTRY_PAGES = [
  { source: "/", rest: "" },
  { source: "/projects/:id(\\d+)", rest: "/projects/:id" },
];

const ACCEPT_LANGUAGE: Condition = { type: "header", key: "accept-language" };
const FETCH_DEST: Condition = { type: "header", key: "sec-fetch-dest" };
const DOCUMENT_REQUEST: Condition = { ...FETCH_DEST, value: "document" };
const BROWSER_REQUEST = [ACCEPT_LANGUAGE, FETCH_DEST];
const IMESSAGE_PREVIEW: Condition = { type: "header", key: "user-agent", value: ".*Facebot Twitterbot.*" };

const localeCookie = (value: string): Condition => ({ type: "cookie", key: LOCALE_COOKIE, value });

const anyCase = (tag: string) => tag.replace(/[a-z]/g, letter => `[${letter}${letter.toUpperCase()}]`);

const firstLanguage = (tag: string): Condition => ({ ...ACCEPT_LANGUAGE, value: `${anyCase(tag)}([-,;].*)?` });

const FIRST_LANGUAGES: { locale: Locale; language: Condition }[] = [
  ...BARE_LOCALES.filter(locale => locale !== UNSUPPORTED_LOCALE).map(locale => ({
    locale,
    language: firstLanguage(locale),
  })),
  { locale: "zh-Hant", language: firstLanguage(`zh-(${["hant", ...TRADITIONAL_REGIONS].join("|")})`) },
  { locale: "zh-Hans", language: firstLanguage("zh") },
];

const KNOWN_COOKIE = localeCookie(`(${locales.join("|")})`);
const LANGUAGES = FIRST_LANGUAGES.map(({ language }) => language);

const RULES: Rule[] = [
  ...locales.map(locale => ({ locale, has: [...BROWSER_REQUEST, localeCookie(locale)] })),
  ...FIRST_LANGUAGES.map(({ locale, language }, index) => ({
    locale,
    has: [...BROWSER_REQUEST, language],
    missing: [KNOWN_COOKIE, ...LANGUAGES.slice(0, index)],
  })),
  { locale: UNSUPPORTED_LOCALE, has: BROWSER_REQUEST, missing: [KNOWN_COOKIE, ...LANGUAGES] },
];

export const ENTRY_REWRITES = ENTRY_PAGES.flatMap(({ source, rest }) =>
  RULES.map(({ locale, has, missing }) => ({ source, destination: `/${locale}${rest}`, has, missing })),
);

export const ENTRY_HEADERS = ENTRY_PAGES.flatMap(({ source }) => [
  ...RULES.map(({ locale, has, missing }) => ({
    source,
    has,
    missing,
    headers: [{ key: "Content-Language", value: locale }],
  })),
  ...RULES.filter(({ locale }) => FONT_PRELOAD_LINK[locale]).map(({ locale, has, missing = [] }) => ({
    source,
    has: [...has, DOCUMENT_REQUEST],
    missing: [...missing, IMESSAGE_PREVIEW],
    headers: [{ key: "Link", value: FONT_PRELOAD_LINK[locale] }],
  })),
]);
