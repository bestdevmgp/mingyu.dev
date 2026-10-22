import { preload } from "react-dom";

import { getLocale, getTranslations } from "next-intl/server";

import LazyNotFoundView from "@/_components/LazyNotFoundView";
import LocaleShell from "@/_components/LocaleShell";
import { getNavSections } from "@/utils/api";

import RootLayout from "./layout";

import type { Metadata } from "next";

const FONT_PRELOAD: Record<string, string> = {
  ko: "/fonts/pretendard-core-v7.woff2",
  en: "/fonts/inter-v3.woff2",
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Meta");
  return { title: { absolute: `Page Not Found - ${t("title")}` } };
}

export default async function GlobalNotFound() {
  const locale = await getLocale();
  const font = FONT_PRELOAD[locale];
  if (font) preload(font, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });

  return (
    <RootLayout>
      <LocaleShell locale={locale}>
        <LazyNotFoundView sections={getNavSections()} />
      </LocaleShell>
    </RootLayout>
  );
}
