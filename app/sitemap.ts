import { localePath, locales } from "@i18n/config";

import { SITE_URL } from "@/lib/site";
import { getProjectIds } from "@/utils/api";

import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const ids = getProjectIds();
  const paths = ["", ...ids.map(id => `/project/${id}`)];
  return locales.flatMap(locale =>
    paths.map(path => ({
      url: `${SITE_URL}${localePath(locale, path).replace(/\/$/, "")}`,
      changeFrequency: "monthly" as const,
      priority: path ? 0.8 : 1,
    })),
  );
}
