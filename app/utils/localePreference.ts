import { isSupportedLocale, LOCALE_COOKIE, locales, type Locale } from "@i18n/config";

const LOCALE_PREFIX = new RegExp(`^/(?:${locales.join("|")})(?=/|$)`);

export const hasLocalePrefix = (pathname: string) => LOCALE_PREFIX.test(pathname);

export const unprefixedPath = (pathname: string) => pathname.replace(LOCALE_PREFIX, "").replace(/^\/$/, "");

export const readLocaleCookie = (): Locale | null => {
  const value = document.cookie
    .split("; ")
    .find(entry => entry.startsWith(`${LOCALE_COOKIE}=`))
    ?.slice(LOCALE_COOKIE.length + 1);
  return isSupportedLocale(value) ? value : null;
};

export const writeLocaleCookie = (locale: Locale) => {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax; secure`;
  return readLocaleCookie() === locale;
};
