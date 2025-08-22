import { Prisma } from "@prisma/client";

export function parsePrismaJSON<Expect>(json: Prisma.JsonValue) {
  return JSON.parse(JSON.stringify(json)) as Expect;
}
