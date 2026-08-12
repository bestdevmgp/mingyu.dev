import { cache } from "react";

import prisma, { CACHE_STRATEGY } from "@/lib/prisma";

export const getSkillTable = cache(async () => {
  return await prisma.skill.findMany({ orderBy: { order: "asc" }, cacheStrategy: CACHE_STRATEGY });
});

export async function getSkills(ids: number[]) {
  if (!ids.length) return [];
  const wanted = new Set(ids);
  return (await getSkillTable()).filter(skill => wanted.has(skill.id));
}
