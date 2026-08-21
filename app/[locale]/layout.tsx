import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";

import { locales } from "@i18n/config";

import LocaleDocumentSync from "@/_components/LocaleDocumentSync";

import type { Metadata } from "next";

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

const PRETENDARD_HREF = "/fonts/pretendard-core-v1.woff2";

const webFontHref: Record<string, string> = {
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

type LocaleParams = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
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
          url: "/opengraph-image.jpg",
          width: 2400,
          height: 1260,
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

export default async function LocaleLayout(
  props: { children: React.ReactNode; modal: React.ReactNode } & LocaleParams,
) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const messages = await getMessages({ locale });

  const fontHref = webFontHref[locale];
  const fontClass = locale === "en" ? inter.className : (cjkFontClass[locale] ?? "font-ko");

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(locale)}` }} />
      {locale === "ko" && (
        <link rel="preload" as="font" type="font/woff2" href={PRETENDARD_HREF} crossOrigin="anonymous" />
      )}
      {fontHref && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="preload" as="style" href={fontHref} id="webfont-css" />
          <script
            dangerouslySetInnerHTML={{
              __html:
                "(function(){var l=document.getElementById('webfont-css');if(!l)return;var d=0;function a(){if(d)return;d=1;l.rel='stylesheet'}l.addEventListener('load',a,{once:true});addEventListener('load',a,{once:true})})()",
            }}
          />
          <noscript>
            <link rel="stylesheet" href={fontHref} />
          </noscript>
        </>
      )}
      <div className={`contents ${fontClass}`} lang={locale}>
        <LocaleDocumentSync locale={locale} />
        <NextIntlClientProvider locale={locale} messages={messages}>
          {props.children}
          {props.modal}
        </NextIntlClientProvider>
      </div>
    </>
  );
}
