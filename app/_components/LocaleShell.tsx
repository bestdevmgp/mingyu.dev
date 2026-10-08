import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

import LocaleDocumentSync from "@/_components/LocaleDocumentSync";

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

const PRETENDARD_HREF = "/fonts/pretendard-core-v2.woff2";

const webFontHref: Record<string, string> = {
  ja: "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700;800&display=swap",
  "zh-Hans": "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700;800&display=swap",
  "zh-Hant": "https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;600;700;800&display=swap",
};

interface LocaleShellProps {
  locale: string;
  structuredData?: React.ReactNode;
  children: React.ReactNode;
}

const LocaleShell = async ({ locale, structuredData, children }: LocaleShellProps) => {
  const messages = await getMessages({ locale });

  const fontHref = webFontHref[locale];
  const fontClass = locale === "en" ? inter.className : (cjkFontClass[locale] ?? "font-ko");

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(locale)}` }} />
      {structuredData}
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
          {children}
        </NextIntlClientProvider>
      </div>
    </>
  );
};

export default LocaleShell;
