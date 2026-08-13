import { NextResponse, type NextRequest } from "next/server";

import { isSupportedLocale, LOCALE_COOKIE } from "@i18n/config";
import { negotiateLocale } from "@i18n/negotiateLocale";

export function proxy(request: NextRequest) {
  const existing = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isSupportedLocale(existing)) return NextResponse.next();

  const locale = negotiateLocale(request.headers.get("accept-language"));

  request.cookies.set(LOCALE_COOKIE, locale);
  const response = NextResponse.next({ request: { headers: request.headers } });
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: ["/((?!_next|api|.*\\.).*)"],
};
