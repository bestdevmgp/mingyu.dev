import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";

import { getProjectData } from "@/utils/projectData";

import ProjectModalClient from "./ProjectModalClient";

interface ProjectModalProps {
  id: number;
}

export default async function ProjectModal({ id }: ProjectModalProps) {
  if (!Number.isSafeInteger(id) || id <= 0) notFound();

  const projectData = getProjectData(id, await getLocale());
  if (!projectData) notFound();

  return <ProjectModalClient id={id} projectData={projectData} />;
}
