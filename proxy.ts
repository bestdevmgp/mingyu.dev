import { NextResponse, type NextRequest } from "next/server";

import { isSupportedLocale, locales, LOCALE_COOKIE } from "@i18n/config";
import { negotiateLocale } from "@i18n/negotiateLocale";

const COOKIE_OPTIONS = { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" } as const;

const LOCALE_PATH = new RegExp(`^/(${locales.join("|")})(/.*)?$`);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const direct = LOCALE_PATH.exec(pathname);
  if (direct) {
    const url = request.nextUrl.clone();
    url.pathname = direct[2] || "/";
    const response = NextResponse.redirect(url, 308);
    response.cookies.set(LOCALE_COOKIE, direct[1], COOKIE_OPTIONS);
    return response;
  }

  const existing = request.cookies.get(LOCALE_COOKIE)?.value;
  const remembered = isSupportedLocale(existing);
  const locale = remembered ? existing : negotiateLocale(request.headers.get("accept-language"));

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  const response = NextResponse.rewrite(url);
  response.headers.set("Content-Language", locale);
  if (!remembered) response.cookies.set(LOCALE_COOKIE, locale, COOKIE_OPTIONS);
  return response;
}

export const config = {
  matcher: ["/((?!_next|fonts/|assets/|favicon|opengraph|robots.txt|sitemap.xml).*)"],
};
