import { setRequestLocale } from "next-intl/server";

import ProjectModal from "@/_components/project/ProjectModal";
import { getProjectIds } from "@/utils/api";

import HomeButton from "./HomeButton";

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getProjectIds()).map(id => ({ id }));
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="w-full md:w-[540px] mx-auto px-4 py-8 md:py-12">
      <ProjectModal id={Number(id)} />
      <HomeButton />
    </div>
  );
}
