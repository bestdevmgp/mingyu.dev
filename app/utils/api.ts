import prisma, { CACHE_STRATEGY } from "@/lib/prisma";

export async function getSkills(ids: number[]) {
  const response = await prisma.skill.findMany({
    where: { OR: ids.map(id => ({ id })) },
    orderBy: { order: "asc" },
    cacheStrategy: CACHE_STRATEGY,
  });
  return response;
}
