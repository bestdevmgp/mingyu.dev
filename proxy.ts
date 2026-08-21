import { NextResponse, type NextRequest } from "next/server";

import { isSupportedLocale, locales, LOCALE_COOKIE } from "@i18n/config";
import { negotiateLocale } from "@i18n/negotiateLocale";

const COOKIE_OPTIONS = { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" } as const;

const LOCALE_PATH = new RegExp(`^/(${locales.join("|")})(/.*)?$`);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 정적 자산은 그대로 통과시킨다
  if (pathname.startsWith("/_next") || pathname.includes(".")) return NextResponse.next();

  // 언어가 붙은 주소로 들어오면 주소를 정리하고 그 언어를 기억한다
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

  // 주소는 그대로 두고 언어별 경로로 내부 재작성해 캐시가 언어마다 나뉘게 한다
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  const response = NextResponse.rewrite(url);
  if (!remembered) response.cookies.set(LOCALE_COOKIE, locale, COOKIE_OPTIONS);
  return response;
}

export const config = {
  matcher: ["/:path*"],
};
