import { getLocale, getTranslations } from "next-intl/server";

import SectionWatcher from "@/_components/SectionWatcher";
import SlideUpInView from "@/_components/SlideUpInView";
import ProjectCards from "@/_components/project/ProjectCards";
import prisma from "@/lib/prisma";
import { getSkills } from "@/utils/api";
import { applyLocaleAll } from "@/utils/localize";

async function getProjects(locale: string) {
  const projects = applyLocaleAll(
    await prisma.project.findMany({
      select: {
        id: true,
        title: true,
        sub_title: true,
        skill_ids: true,
        i18n: true,
      },
      orderBy: {
        row_number: "asc",
      },
    }),
    locale,
  );

  const projectsWithSkills = await Promise.all(
    projects.map(async ({ skill_ids, ...project }) => {
      const skills = await getSkills(skill_ids);
      return { ...project, skills };
    }),
  );

  return projectsWithSkills;
}

export default async function ProjectSection() {
  const t = await getTranslations("Project");
  const projects = await getProjects(await getLocale());

  return (
    <SectionWatcher id="project">
      <SlideUpInView>
        <h2 className="section-eyebrow">{t("eyebrow")}</h2>
        <p className="section-title">{t("title")}</p>

        <ProjectCards projects={projects} />
      </SlideUpInView>
    </SectionWatcher>
  );
}
