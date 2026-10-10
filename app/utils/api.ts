import { cache } from "react";

import prisma, { CACHE_STRATEGY } from "@/lib/prisma";

import type { Prisma } from "@prisma/client";

export const getSkillTable = cache(async () => {
  return await prisma.skill.findMany({ orderBy: { order: "asc" }, cacheStrategy: CACHE_STRATEGY });
});

export async function getSkills(ids: number[]) {
  if (!ids.length) return [];
  const wanted = new Set(ids);
  return (await getSkillTable()).filter(skill => wanted.has(skill.id));
}

const WITH_ITEMS = { ProjectItem: { orderBy: { row_number: "asc" } } } satisfies Prisma.projectInclude;

export const getProject = cache(async (id: number) => {
  const row = await prisma.project.findUnique({ where: { id }, include: WITH_ITEMS, cacheStrategy: CACHE_STRATEGY });
  return row as Prisma.projectGetPayload<{ include: typeof WITH_ITEMS }> | null;
});

export const getProjectIds = cache(async () => {
  const rows = await prisma.project.findMany({ select: { id: true }, cacheStrategy: CACHE_STRATEGY });
  return rows.map(row => String(row.id));
});
