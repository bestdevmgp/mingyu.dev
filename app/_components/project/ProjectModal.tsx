import { getLocale } from "next-intl/server";

import prisma from "@/lib/prisma";
import { getSkills } from "@/utils/api";
import { applyLocale, applyLocaleAll } from "@/utils/localize";
import { parsePrismaJSON } from "@/utils/parsePrisma";

import ProjectModalClient from "./ProjectModalClient";

interface ProjectModalProps {
  id: number;
}

async function getProjectById(id: number, locale: string) {
  const responseProject = applyLocale(await prisma.project.findUniqueOrThrow({ where: { id } }), locale);
  const responseItems = applyLocaleAll(
    await prisma.projectItem.findMany({ where: { projectId: id }, orderBy: { row_number: "asc" } }),
    locale,
  );

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
  const projectData = await getProjectById(id, await getLocale());

  return <ProjectModalClient id={id} projectData={projectData} />;
}
