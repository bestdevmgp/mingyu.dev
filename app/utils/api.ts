import content from "@/lib/content";

import type { skill } from "@prisma/client";

const NAV_SECTIONS = ["competencies", "skills", "career", "projects", "blog", "education"] as const;

export type NavSection = (typeof NAV_SECTIONS)[number];

export function getNavSections(): NavSection[] {
  return NAV_SECTIONS.filter(id => id !== "blog" || content.blog.length > 0);
}

export type SkillIcon = Pick<skill, "id" | "category" | "blobUrl" | "item">;

const skillIcons = content.skill.map(({ id, category, blobUrl, item }): SkillIcon => ({ id, category, blobUrl, item }));
const hiddenSkillIds = new Set(content.skill.filter(skill => skill.hidden).map(skill => skill.id));

export function getShownSkills() {
  return skillIcons.filter(icon => !hiddenSkillIds.has(icon.id));
}

export function getSkills(ids: number[]) {
  const wanted = new Set(ids);
  return skillIcons.filter(icon => wanted.has(icon.id));
}

export function getImageSizes(urls: string[]) {
  return Object.fromEntries(
    urls.filter(url => Object.hasOwn(content.imageSizes, url)).map(url => [url, content.imageSizes[url]]),
  );
}

export function getProject(id: number) {
  return content.project.find(project => project.id === id) ?? null;
}

export function getProjectIds() {
  return content.project.map(project => String(project.id));
}

export function getProjectsInOrder() {
  return [...content.project].sort(
    (a, b) => (a.row_number ?? Number.POSITIVE_INFINITY) - (b.row_number ?? Number.POSITIVE_INFINITY),
  );
}
