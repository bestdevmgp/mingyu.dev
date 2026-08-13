import { NextResponse, type NextRequest } from "next/server";

import { isSupportedLocale, LOCALE_COOKIE } from "@i18n/config";
import { negotiateLocale } from "@i18n/negotiateLocale";

export function proxy(request: NextRequest) {
  const diagnostic = request.nextUrl.searchParams.get("d");
  const existing = request.cookies.get(LOCALE_COOKIE)?.value;

  if (isSupportedLocale(existing)) {
    if (!diagnostic) return NextResponse.next();
    const headers = new Headers(request.headers);
    headers.set("x-diagnostic", diagnostic);
    return NextResponse.next({ request: { headers } });
  }

  const locale = negotiateLocale(request.headers.get("accept-language"));

  request.cookies.set(LOCALE_COOKIE, locale);
  const forwarded = new Headers(request.headers);
  if (diagnostic) forwarded.set("x-diagnostic", diagnostic);
  const response = NextResponse.next({ request: { headers: forwarded } });
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
