import { getImageSizes, getProject, getSkills } from "@/utils/api";
import { applyLocale, applyLocaleAll } from "@/utils/localize";

export function getProjectData(id: number, locale: string) {
  const project = getProject(id);
  if (!project) return null;

  const { title, sub_title, period, member, links, ProjectItem, skill_ids } = applyLocale(project, locale);
  const items = applyLocaleAll(ProjectItem, locale).map(({ title, content, image_ratio, blobUrls }) => ({
    title,
    content,
    image_ratio,
    blobUrls,
  }));

  return {
    title,
    sub_title,
    period,
    member,
    links,
    items,
    skills: getSkills(skill_ids).map(({ id, blobUrl, item }) => ({ id, blobUrl, item })),
    imageSizes: getImageSizes(items.flatMap(item => item.blobUrls)),
  };
}
