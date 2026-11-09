import { preload } from "react-dom";

import { headers } from "next/headers";
import { getLocale, getTranslations } from "next-intl/server";

import { LOCALE_HEADER } from "@i18n/config";
import { FONT_PRELOAD_PATH } from "@i18n/fontPreload";

import LazyNotFoundView from "@/_components/LazyNotFoundView";
import LocaleShell from "@/_components/LocaleShell";
import { getNavSections } from "@/utils/api";

import RootLayout from "./layout";

import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Meta");
  return { title: { absolute: `Page Not Found - ${t("title")}` } };
}

export default async function GlobalNotFound() {
  const locale = await getLocale();
  const font = FONT_PRELOAD_PATH[locale];
  const viaProxy = (await headers()).has(LOCALE_HEADER);
  if (font && !viaProxy) preload(font, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });

  return (
    <RootLayout>
      <LocaleShell locale={locale}>
        <LazyNotFoundView sections={getNavSections()} />
      </LocaleShell>
    </RootLayout>
  );
}
