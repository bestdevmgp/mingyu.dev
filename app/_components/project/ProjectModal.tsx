import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";

import { getProject, getSkills, getSkillTable } from "@/utils/api";
import { applyLocale, applyLocaleAll } from "@/utils/localize";
import { parsePrismaJSON } from "@/utils/parsePrisma";

import ProjectModalClient from "./ProjectModalClient";

interface ProjectModalProps {
  id: number;
}

async function getProjectById(id: number, locale: string) {
  const [project] = await Promise.all([getProject(id), getSkillTable()]);
  if (!project) notFound();

  const { ProjectItem: items, links, skill_ids, ...res } = applyLocale(project, locale);
  const responseItems = applyLocaleAll(items, locale);
  const responseSkills = await getSkills(skill_ids);

  return {
    ...res,
    links: links.map(link => parsePrismaJSON<{ href: string; label: string }>(link)),
    items: responseItems,
    skills: responseSkills,
  };
}

export default async function ProjectModal({ id }: ProjectModalProps) {
  if (!Number.isSafeInteger(id) || id <= 0) notFound();

  const projectData = await getProjectById(id, await getLocale());

  return <ProjectModalClient id={id} projectData={projectData} />;
}
