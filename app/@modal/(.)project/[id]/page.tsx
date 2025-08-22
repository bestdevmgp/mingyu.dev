import ProjectModalComponent from "@/_components/project/ProjectModal";

export default function ProjectModal({ params: { id } }: { params: { id: string } }) {
  return <ProjectModalComponent id={Number(id)} />;
}
