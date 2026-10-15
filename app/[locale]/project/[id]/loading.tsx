import ProjectSkeleton from "@/_components/project/ProjectSkeleton";

export default function ProjectPageLoading() {
  return (
    <div className="w-full md:w-[calc(100vw-4rem)] md:max-w-4xl mx-auto px-4 md:px-[33px] py-8 md:py-12">
      <ProjectSkeleton variant="page" />
    </div>
  );
}
