import { getTranslations, setRequestLocale } from "next-intl/server";

import { languageAlternates, locales, localePath } from "@i18n/config";

import LocaleShell from "@/_components/LocaleShell";

import type { Metadata } from "next";

const SITE_URL = "https://mingyu.dev";

const PROFILES = ["https://github.com/bestdevmgp", "https://linkedin.com/in/min-gyu"];

const NAME_VARIANTS = ["박민규", "Mingyu Park", "パク・ミンギュ", "朴珉圭"];

const siteSchema = (name: string) =>
  JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url: SITE_URL,
  }).replace(/</g, "\\u003c");

const personSchema = (name: string, jobTitle: string | string[], description: string) =>
  JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    alternateName: NAME_VARIANTS.filter(variant => variant !== name),
    jobTitle,
    description,
    url: SITE_URL,
    image: `${SITE_URL}/opengraph-image.jpg`,
    email: "mailto:me@mingyu.dev",
    sameAs: PROFILES,
  }).replace(/</g, "\\u003c");

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
  const name = t("name");
  const description = t("description");

  return {
    metadataBase: new URL("https://mingyu.dev"),
    title: { default: title, template: `%s - ${title}` },
    description,
    keywords: ["백엔드", "백엔드 개발자", "백엔드 개발자 포트폴리오", "backend developer", "portfolio"],
    openGraph: {
      title,
      description,
      url: "https://mingyu.dev",
      siteName: name,
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
      canonical: localePath(locale),
      languages: languageAlternates(),
    },
    verification: {
      other: { "naver-site-verification": "e715244d4f7e93562c29744794fe9b90bdb443fa" },
    },
  };
}

export default async function LocaleLayout(
  props: { children: React.ReactNode; modal: React.ReactNode } & LocaleParams,
) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Meta" });

  return (
    <LocaleShell
      locale={locale}
      structuredData={
        <>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: siteSchema(t("name")) }} />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: personSchema(t("name"), t.raw("jobTitle"), t("description")) }}
          />
        </>
      }
    >
      {props.children}
      {props.modal}
    </LocaleShell>
  );
}
