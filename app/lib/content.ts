import snapshot from "@/_generated/content.json";

import type { blog, education, experience, intro, project, ProjectItem, skill } from "@prisma/client";

type Content = {
  intro: intro[];
  skill: skill[];
  experience: experience[];
  education: education[];
  blog: blog[];
  project: (project & { ProjectItem: ProjectItem[] })[];
  imageSizes: Record<string, [number, number]>;
};

const content = snapshot as unknown as Content;

export default content;
