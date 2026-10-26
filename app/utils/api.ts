import content from "@/lib/content";
import { NAV_SECTIONS, type NavSection } from "@/utils/sectionLanding";

import type { skill } from "@prisma/client";

export function getNavSections(): NavSection[] {
  return NAV_SECTIONS.filter(id => id !== "blog" || content.blog.length > 0);
}

export type SkillIcon = Pick<skill, "id" | "category" | "iconUrl" | "item">;

const skillIcons = content.skill.map(({ id, category, iconUrl, item }): SkillIcon => ({ id, category, iconUrl, item }));
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
