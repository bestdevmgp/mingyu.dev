import ProjectModal from "@/_components/project/ProjectModal";

import HomeButton from "./HomeButton";

export default function ProjectPage({ params: { id } }: { params: { id: string } }) {
  return (
    <div className="w-full md:w-[540px] mx-auto px-4 py-8 md:py-12">
      <ProjectModal id={Number(id)} />
      <HomeButton />
    </div>
  );
}
