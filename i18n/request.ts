import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import { isSupportedLocale, LOCALE_COOKIE, type Locale } from "./config";
import { negotiateLocale } from "./negotiateLocale";

const localeWithoutProxy = async (): Promise<Locale> => {
  const remembered = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isSupportedLocale(remembered)) return remembered;
  return negotiateLocale((await headers()).get("accept-language"));
};

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale: Locale = isSupportedLocale(requested) ? requested : await localeWithoutProxy();

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
