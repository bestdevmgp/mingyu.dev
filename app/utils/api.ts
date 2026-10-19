import content from "@/lib/content";

const NAV_SECTIONS = ["competencies", "skills", "career", "projects", "blog", "education"] as const;

export type NavSection = (typeof NAV_SECTIONS)[number];

export function getNavSections(): NavSection[] {
  return NAV_SECTIONS.filter(id => id !== "blog" || content.blog.length > 0);
}

export function getSkillTable() {
  return content.skill;
}

export function getSkills(ids: number[]) {
  if (!ids.length) return [];
  const wanted = new Set(ids);
  return content.skill.filter(skill => wanted.has(skill.id));
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
