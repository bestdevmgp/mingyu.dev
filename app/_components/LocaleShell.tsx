import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

import LocaleDocumentSync from "@/_components/LocaleDocumentSync";
import localeFontClass from "@/lib/localeFontClass";
import notoFontFaces from "@/lib/notoFontFaces";

interface LocaleShellProps {
  locale: string;
  structuredData?: React.ReactNode;
  children: React.ReactNode;
}

const LocaleShell = async ({ locale, structuredData, children }: LocaleShellProps) => {
  const messages = await getMessages({ locale });

  const fontFace = notoFontFaces[locale];

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(locale)}` }} />
      {structuredData}
      {fontFace && <style dangerouslySetInnerHTML={{ __html: fontFace }} />}
      <div className={`contents ${localeFontClass(locale)}`} lang={locale}>
        <LocaleDocumentSync locale={locale} />
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </div>
    </>
  );
};

export default LocaleShell;
