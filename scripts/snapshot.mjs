import { mkdirSync, writeFileSync } from "node:fs";

import nextEnv from "@next/env";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import sharp from "sharp";

nextEnv.loadEnvConfig(process.cwd());

const url = process.env.PRISMA_DATABASE_URL ?? "";
const useAccelerate = url.startsWith("prisma://") || url.startsWith("prisma+postgres://");
const prisma = (
  useAccelerate
    ? new PrismaClient({ accelerateUrl: url })
    : new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) })
).$extends(withAccelerate());

const [intro, skill, experience, education, blog, project] = await Promise.all([
  prisma.intro.findMany({ orderBy: { id: "asc" } }),
  prisma.skill.findMany({ orderBy: { order: "asc" } }),
  prisma.experience.findMany({ orderBy: { index: "asc" } }),
  prisma.education.findMany({ orderBy: { id: "asc" } }),
  prisma.blog.findMany(),
  prisma.project.findMany({ include: { ProjectItem: { orderBy: { row_number: "asc" } } } }),
]);
await prisma.$disconnect();

const imageUrls = [
  ...new Set(
    project.flatMap(({ ProjectItem }) =>
      ProjectItem.flatMap(item =>
        [item, ...Object.values(item.i18n ?? {})].flatMap(version => version?.blobUrls ?? []),
      ),
    ),
  ),
];

const measureImage = async url => {
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const { autoOrient } = await sharp(Buffer.from(await response.arrayBuffer())).metadata();
  return [autoOrient.width, autoOrient.height];
};

const measured = [];
let cursor = 0;
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (cursor < imageUrls.length) {
      const index = cursor++;
      measured[index] = await measureImage(imageUrls[index]).catch(error => {
        console.warn(`image size skipped: ${imageUrls[index]} (${error.message})`);
        return null;
      });
    }
  }),
);
const imageSizes = Object.fromEntries(
  imageUrls.flatMap((url, index) => (measured[index] ? [[url, measured[index]]] : [])),
);

const dir = new URL("../app/_generated/", import.meta.url);
mkdirSync(dir, { recursive: true });
writeFileSync(
  new URL("content.json", dir),
  JSON.stringify({ intro, skill, experience, education, blog, project, imageSizes }),
);

console.log(
  `content snapshot: ${project.length} projects, ${project.reduce((n, p) => n + p.ProjectItem.length, 0)} items, ${skill.length} skills, ${experience.length} experiences, ${intro.length} intros, ${education.length} educations, ${blog.length} blogs, ${Object.keys(imageSizes).length}/${imageUrls.length} image sizes`,
);
