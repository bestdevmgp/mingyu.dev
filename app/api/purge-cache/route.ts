import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

const TOKEN = "b7f3c1a9-purge-2026";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (token !== TOKEN) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const result = await prisma.$accelerate.invalidateAll();
  return NextResponse.json({ purged: true, result });
}
