import { getLocale, getTranslations } from "next-intl/server";

import SlideUpInView from "@/_components/SlideUpInView";
import ProjectCards from "@/_components/project/ProjectCards";
import { getProjectsInOrder, getSkills } from "@/utils/api";
import { applyLocaleAll } from "@/utils/localize";

function getProjects(locale: string) {
  const projects = applyLocaleAll(
    getProjectsInOrder().map(({ id, title, sub_title, skill_ids, i18n }) => ({
      id,
      title,
      sub_title,
      skill_ids,
      i18n,
    })),
    locale,
  );

  return projects.map(({ skill_ids, ...project }) => ({ ...project, skills: getSkills(skill_ids) }));
}

export default async function ProjectSection() {
  const t = await getTranslations("Project");
  const projects = getProjects(await getLocale());

  return (
    <section id="projects">
      <SlideUpInView>
        <h2 className="section-eyebrow">{t("eyebrow")}</h2>
        <p className="section-title">{t("title")}</p>

        <ProjectCards projects={projects} />
      </SlideUpInView>
    </section>
  );
}
