import prisma from "@/lib/prisma";

export async function getSkills(ids: number[]) {
  const response = await prisma.skill.findMany({
    where: { OR: ids.map(id => ({ id })) },
    orderBy: [
      { category: "asc" },
      { order: "asc" }
    ],
  });
  return response;
}
