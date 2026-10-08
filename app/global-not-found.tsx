import { getLocale, getTranslations } from "next-intl/server";

import LazyNotFoundView from "@/_components/LazyNotFoundView";
import LocaleShell from "@/_components/LocaleShell";

import RootLayout from "./layout";

import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Meta");
  return { title: { absolute: `Page Not Found - ${t("title")}` } };
}

export default async function GlobalNotFound() {
  const locale = await getLocale();

  return (
    <RootLayout>
      <LocaleShell locale={locale}>
        <LazyNotFoundView />
      </LocaleShell>
    </RootLayout>
  );
}
