import SectionWatcher from "@/_components/SectionWatcher";
import SlideUpInView from "@/_components/SlideUpInView";
import ProjectCards from "@/_components/project/ProjectCards";
import prisma from "@/lib/prisma";
import { getSkills } from "@/utils/api";

async function getProjects() {
  const projects = await prisma.project.findMany({
    select: {
      id: true,
      title: true,
      sub_title: true,
      skill_ids: true,
    },
    orderBy: {
      row_number: "asc",
    },
  });

  const projectsWithSkills = await Promise.all(
    projects.map(async ({ skill_ids, ...project }) => {
      const skills = await getSkills(skill_ids);
      return { ...project, skills };
    }),
  );

  return projectsWithSkills;
}

export default async function ProjectSection() {
  const projects = await getProjects();

  return (
    <SectionWatcher id="project">
      <SlideUpInView>
        <h2 className="section-eyebrow">프로젝트</h2>
        <p className="section-title">주요 프로젝트의 세부 사항을 확인해보세요</p>

        <ProjectCards projects={projects} />
      </SlideUpInView>
    </SectionWatcher>
  );
}
