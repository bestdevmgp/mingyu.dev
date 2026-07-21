import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Gothic_A1, Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";

import SmoothScroll from "@/_components/SmoothScroll";
import ThemeScript from "@/_components/ThemeScript";

import type { Metadata } from "next";

import "lenis/dist/lenis.css";
import "./globals.css";

const gothicA1 = Gothic_A1({
  weight: ["400", "600", "700", "800"],
  subsets: ["latin"],
});

const inter = Inter({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

const cjkFontClass: Record<string, string> = {
  ja: "font-ja",
  "zh-Hans": "font-zh-hans",
  "zh-Hant": "font-zh-hant",
};

const OG_LOCALE: Record<string, string> = {
  ko: "ko_KR",
  en: "en_US",
  ja: "ja_JP",
  "zh-Hans": "zh_CN",
  "zh-Hant": "zh_TW",
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations("Meta");
  const title = t("title");
  const description = t("description");

  return {
    metadataBase: new URL("https://mingyu.dev"),
    title,
    description,
    keywords: ["백엔드", "백엔드 개발자", "백엔드 개발자 포트폴리오", "backend developer", "portfolio"],
    openGraph: {
      title,
      description,
      url: "https://mingyu.dev",
      siteName: title,
      images: [
        {
          url: "/opengraph-image.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: OG_LOCALE[locale] ?? "ko_KR",
      type: "website",
    },
    alternates: {
      canonical: "/",
    },
  };
}

export default async function RootLayout(props: { children: React.ReactNode; modal: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={locale === "en" ? inter.className : (cjkFontClass[locale] ?? gothicA1.className)}>
        <ThemeScript />
        <SmoothScroll />
        <NextIntlClientProvider locale={locale} messages={messages}>
          {props.children}
          {props.modal}
          <div id="modal-root" />
          <Analytics />
          <SpeedInsights />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
