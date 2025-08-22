import prisma from "./lib/prisma";

import type { MetadataRoute } from "next";

async function getProjectIds() {
  return prisma.project.findMany({ select: { id: true } }).then(res => res.map(({ id }) => id));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projectIds = await getProjectIds();
  const projectSites: MetadataRoute.Sitemap = projectIds.map(id => ({
    url: `https://www.meganmagic.com/project/${id}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    {
      url: "https://www.meganmagic.com",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...projectSites,
  ];
}
