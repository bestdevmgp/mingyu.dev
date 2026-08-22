import { notFound } from "next/navigation";

import { getProjectIds } from "@/utils/api";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!(await getProjectIds()).includes(id)) notFound();

  return children;
}
