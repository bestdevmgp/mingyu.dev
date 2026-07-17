import ProjectModalComponent from "@/_components/project/ProjectModal";

export default async function ProjectModal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProjectModalComponent id={Number(id)} />;
}
