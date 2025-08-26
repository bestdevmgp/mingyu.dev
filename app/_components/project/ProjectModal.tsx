import prisma from "@/lib/prisma";
import { getSkills } from "@/utils/api";
import { parsePrismaJSON } from "@/utils/parsePrisma";

import ProjectModalClient from "./ProjectModalClient";

interface ProjectModalProps {
  id: number;
}

async function getProjectById(id: number) {
  const responseProject = await prisma.project.findUniqueOrThrow({ where: { id } });
  const responseItems = await prisma.projectItem.findMany({ where: { projectId: id }, orderBy: { row_number: "asc" } });

  const { links, skill_ids, ...res } = responseProject;
  const responseSkills = await getSkills(skill_ids);

  return {
    ...res,
    links: links.map(link => parsePrismaJSON<{ href: string; label: string }>(link)),
    items: responseItems,
    skills: responseSkills,
  };
}

export default async function ProjectModal({ id }: ProjectModalProps) {
  const projectData = await getProjectById(id);

  return <ProjectModalClient id={id} projectData={projectData} />;
}
