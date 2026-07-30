import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";

import DeferredAnalytics from "@/_components/DeferredAnalytics";
import SmoothScroll from "@/_components/SmoothScroll";
import ThemeScript from "@/_components/ThemeScript";

import type { Metadata } from "next";

import "lenis/dist/lenis.css";
import "./globals.css";

// preload: false so Inter is fetched only where it's actually applied (the en
// body className). With a single shared layout (cookie-based i18n) next/font would
// otherwise force-preload it on every locale, including ko/ja/zh where it's unused.
const inter = Inter({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  preload: false,
});

const cjkFontClass: Record<string, string> = {
  ja: "font-ja",
  "zh-Hans": "font-zh-hans",
  "zh-Hant": "font-zh-hant",
};

const webFontHref: Record<string, string> = {
  ko: "/fonts/pretendard.css",
  ja: "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700;800&display=swap",
  "zh-Hans": "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700;800&display=swap",
  "zh-Hant": "https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;600;700;800&display=swap",
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

  const fontHref = webFontHref[locale];

  return (
    <html lang={locale} suppressHydrationWarning>
      {fontHref && (
        <head>
          {locale === "ko" ? (
            <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
          ) : (
            <>
              <link rel="preconnect" href="https://fonts.googleapis.com" />
              <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            </>
          )}
          <link rel="stylesheet" href={fontHref} />
        </head>
      )}
      <body className={locale === "en" ? inter.className : (cjkFontClass[locale] ?? "font-ko")}>
        <ThemeScript />
        <SmoothScroll />
        <NextIntlClientProvider locale={locale} messages={messages}>
          {props.children}
          {props.modal}
          <div id="modal-root" />
          <DeferredAnalytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
