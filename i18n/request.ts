import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import { isSupportedLocale, LOCALE_COOKIE, type Locale } from "./config";
import { negotiateLocale } from "./negotiateLocale";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(LOCALE_COOKIE)?.value;

  let locale: Locale;
  if (isSupportedLocale(cookieValue)) {
    locale = cookieValue;
  } else {
    const headerStore = await headers();
    locale = negotiateLocale(headerStore.get("accept-language"));
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
