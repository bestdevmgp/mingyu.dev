import { getLocale, getTranslations } from "next-intl/server";

import CardBatches from "@/_components/CardBatches";
import SlideUpInView from "@/_components/SlideUpInView";
import ProjectCard from "@/_components/project/ProjectCard";
import ProjectModalHost from "@/_components/project/ProjectModalHost";
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

        <CardBatches carryKey="projects.shown" showMoreAnalytics="projects_show_more">
          {projects.map(project => (
            <ProjectCard key={`project-card-${project.id}`} {...project} />
          ))}
        </CardBatches>
        <ProjectModalHost />
      </SlideUpInView>
    </section>
  );
}
