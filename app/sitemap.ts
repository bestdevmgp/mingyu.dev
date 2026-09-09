import { defaultLocale, locales } from "@i18n/config";

import { getProjectIds } from "@/utils/api";

import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const ids = await getProjectIds();
  const paths = ["", ...ids.map(id => `/project/${id}`)];
  return locales.flatMap(locale =>
    paths.map(path => ({
      url: `https://mingyu.dev${locale === defaultLocale ? "" : `/${locale}`}${path}`,
      changeFrequency: "monthly" as const,
      priority: path ? 0.8 : 1,
    })),
  );
}
