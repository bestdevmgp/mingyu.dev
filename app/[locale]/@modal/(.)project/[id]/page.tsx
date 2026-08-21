import { setRequestLocale } from "next-intl/server";

import ProjectModalComponent from "@/_components/project/ProjectModal";

export default async function ProjectModal({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params;
  setRequestLocale(locale);
  return <ProjectModalComponent id={Number(id)} />;
}
