import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

import LocaleDocumentSync from "@/_components/LocaleDocumentSync";
import notoFontFaces from "@/lib/notoFontFaces";

const localeFontClass: Record<string, string> = {
  en: "font-en",
  ja: "font-ja",
  "zh-Hans": "font-zh-hans",
  "zh-Hant": "font-zh-hant",
};

interface LocaleShellProps {
  locale: string;
  structuredData?: React.ReactNode;
  children: React.ReactNode;
}

const LocaleShell = async ({ locale, structuredData, children }: LocaleShellProps) => {
  const messages = await getMessages({ locale });

  const fontFace = notoFontFaces[locale];
  const fontClass = localeFontClass[locale] ?? "font-ko";

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(locale)}` }} />
      {structuredData}
      {fontFace && <style dangerouslySetInnerHTML={{ __html: fontFace }} />}
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
