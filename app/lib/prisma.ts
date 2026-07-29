import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const url = process.env.PRISMA_DATABASE_URL ?? "";
const useAccelerate = url.startsWith("prisma://") || url.startsWith("prisma+postgres://");

const createPrismaClient = () => {
  const base = useAccelerate
    ? new PrismaClient({ accelerateUrl: url })
    : new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
  return base.$extends(withAccelerate());
};

const globalForPrisma = globalThis as unknown as { prisma?: ReturnType<typeof createPrismaClient> };

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;

export const CACHE_STRATEGY = { ttl: 60, swr: 300 };
