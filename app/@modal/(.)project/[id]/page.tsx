import ProjectModalComponent from "@/_components/project/ProjectModal";

export default async function ProjectModal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await new Promise(resolve => setTimeout(resolve, 5000));
  return <ProjectModalComponent id={Number(id)} />;
}
