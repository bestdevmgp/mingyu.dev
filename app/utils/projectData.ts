import { getImageSizes, getProject, getSkills } from "@/utils/api";
import { applyLocale, applyLocaleAll } from "@/utils/localize";

export function getProjectData(id: number, locale: string) {
  const project = getProject(id);
  if (!project) return null;

  const { ProjectItem: items, links, skill_ids, ...res } = applyLocale(project, locale);
  const responseItems = applyLocaleAll(items, locale);
  const responseSkills = getSkills(skill_ids);

  return {
    ...res,
    links: links as unknown as { href: string; label: string }[],
    items: responseItems,
    skills: responseSkills,
    imageSizes: getImageSizes(responseItems.flatMap(item => item.blobUrls)),
  };
}
