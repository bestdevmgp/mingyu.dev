import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

import localeFontClass from "@/lib/localeFontClass";
import notoFontFaces from "@/lib/notoFontFaces";

import LocaleDocumentSync from "./LocaleDocumentSync";

const CLIENT_MESSAGES: Record<string, string[] | null> = {
  Header: null,
  Nav: null,
  Skill: ["backend", "devops", "frontend", "ai"],
  Experience: ["showDetails", "hideDetails"],
  Project: ["description", "skills", "member", "period", "links", "detail"],
  Blog: ["readMore"],
  ImageViewer: null,
  Common: null,
  NotFound: null,
};

interface LocaleShellProps {
  locale: string;
  structuredData?: React.ReactNode;
  children: React.ReactNode;
}

const LocaleShell = async ({ locale, structuredData, children }: LocaleShellProps) => {
  const messages = await getMessages({ locale });
  const clientMessages = Object.fromEntries(
    Object.entries(CLIENT_MESSAGES).map(([namespace, keys]) => {
      const all = messages[namespace] as Record<string, unknown>;
      return [namespace, keys ? Object.fromEntries(keys.map(key => [key, all[key]])) : all];
    }),
  );

  const fontFace = notoFontFaces[locale];

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(locale)}` }} />
      {structuredData}
      {fontFace && <style dangerouslySetInnerHTML={{ __html: fontFace }} />}
      <div className={`contents ${localeFontClass(locale)}`} lang={locale}>
        <LocaleDocumentSync locale={locale} />
        <NextIntlClientProvider locale={locale} messages={clientMessages}>
          {children}
        </NextIntlClientProvider>
      </div>
    </>
  );
};

export default LocaleShell;
