import ProjectSkeleton from "@/_components/project/ProjectSkeleton";

export default function ProjectPageLoading() {
  return (
    <div className="w-full md:w-[540px] mx-auto px-4 py-8 md:py-12">
      <ProjectSkeleton variant="page" />
    </div>
  );
}
