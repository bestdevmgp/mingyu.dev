import { getProjectIds } from "@/utils/api";

import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const ids = await getProjectIds();
  return [
    { url: "https://mingyu.dev", changeFrequency: "monthly", priority: 1 },
    ...ids.map(id => ({
      url: `https://mingyu.dev/project/${id}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
