import snapshot from "@/_generated/content.json";

import type { blog, education, experience, intro, project, ProjectItem, skill } from "@prisma/client";

export type Link = { href: string; label: string };

type Content = {
  intro: intro[];
  skill: skill[];
  experience: (Omit<experience, "links"> & { links: Link[] })[];
  education: education[];
  blog: blog[];
  project: (Omit<project, "links"> & { links: Link[]; ProjectItem: ProjectItem[] })[];
  imageSizes: Record<string, [number, number]>;
};

const content = snapshot as unknown as Content;

export default content;
