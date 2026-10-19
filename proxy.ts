import { NextResponse, type NextRequest } from "next/server";

import { defaultLocale, isSupportedLocale, locales, LOCALE_COOKIE } from "@i18n/config";
import { negotiateLocale } from "@i18n/negotiateLocale";

const COOKIE_OPTIONS = { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax", secure: true } as const;

const LOCALE_PATH = new RegExp(`^/(${locales.join("|")})(/.*)?$`);

const FIRST_SEGMENT = /^\/([^/]+)(\/.*)?$/;

const MAIL_PATH = "/me@mingyu.dev";

const fontPreload = (file: string) =>
  `</fonts/${file}>; rel=preload; as="font"; crossorigin="anonymous"; type="font/woff2"`;

const FONT_PRELOAD: Record<string, string> = {
  ko: fontPreload("pretendard-core-v6.woff2"),
  en: fontPreload("inter-v3.woff2"),
};

const CANONICAL_PREFIX = new Map<string, string>([
  ...locales.map((locale): [string, string] => [locale.toLowerCase(), locale]),
  ["zh", "zh-Hans"],
]);

const forwardLocale = (request: NextRequest, locale: string) => {
  const headers = new Headers(request.headers);
  headers.set("X-NEXT-INTL-LOCALE", locale);
  return { request: { headers } };
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const fetchDest = request.headers.get("sec-fetch-dest");
  const isBackgroundRequest = fetchDest !== null && fetchDest !== "document";

  if (pathname === MAIL_PATH) return NextResponse.next();

  const first = FIRST_SEGMENT.exec(pathname);
  if (first) {
    const [, segment, rest = ""] = first;
    const canonical = CANONICAL_PREFIX.get(segment.toLowerCase());
    if (canonical && canonical !== segment) {
      const url = request.nextUrl.clone();
      url.pathname = `/${canonical}${rest}`;
      return NextResponse.redirect(url, 308);
    }
  }

  const direct = LOCALE_PATH.exec(pathname);
  if (direct) {
    const [, prefix, rest] = direct;
    if (prefix === defaultLocale) {
      const url = request.nextUrl.clone();
      url.pathname = rest || "/";
      const response = NextResponse.redirect(url, 308);
      if (!isBackgroundRequest) response.cookies.set(LOCALE_COOKIE, prefix, COOKIE_OPTIONS);
      return response;
    }
    const response = NextResponse.next(forwardLocale(request, prefix));
    response.headers.set("Content-Language", prefix);
    if (FONT_PRELOAD[prefix] && !isBackgroundRequest) response.headers.set("Link", FONT_PRELOAD[prefix]);
    if (!isBackgroundRequest) response.cookies.set(LOCALE_COOKIE, prefix, COOKIE_OPTIONS);
    return response;
  }

  const existing = request.cookies.get(LOCALE_COOKIE)?.value;
  const remembered = isSupportedLocale(existing);
  const locale = remembered ? existing : negotiateLocale(request.headers.get("accept-language"));

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  const response = NextResponse.rewrite(url, forwardLocale(request, locale));
  response.headers.set("Content-Language", locale);
  if (FONT_PRELOAD[locale] && !isBackgroundRequest) response.headers.set("Link", FONT_PRELOAD[locale]);
  if (!remembered) response.cookies.set(LOCALE_COOKIE, locale, COOKIE_OPTIONS);
  return response;
}

export const config = {
  matcher: ["/((?!_next|fonts/|assets/|favicon|opengraph|[^/]+\\.(?:txt|xml)).*)"],
};
