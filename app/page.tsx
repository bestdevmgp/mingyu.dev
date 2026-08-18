import RestoreProjectScroll from "@/_components/RestoreProjectScroll";
import ScrollCue from "@/_components/ScrollCue";
import SectionNav from "@/_components/SectionNav";
import SiteHeader from "@/_components/SiteHeader";
import BlogSection from "@/_sections/BlogSection";
import EducationSection from "@/_sections/EducationSection";
import ExperienceSection from "@/_sections/ExperienceSection";
import IntroSection from "@/_sections/IntroSection";
import MainSection from "@/_sections/MainSection";
import OutroSection from "@/_sections/OutroSection";
import ProjectSection from "@/_sections/ProjectSection";
import SkillSection from "@/_sections/SkillSection";

export default function Home() {
  return (
    <>
      <RestoreProjectScroll />
      <SiteHeader />
      <SectionNav />
      <main
        className="
        w-full max-w-(--breakpoint-lg) mx-auto
        px-5 md:px-8 lg:px-10
        flex flex-col items-center relative
      "
      >
        <MainSection />
        <ScrollCue />
        <IntroSection />
        <SkillSection />
        <ExperienceSection />
        <ProjectSection />
        <BlogSection />
        <EducationSection />
        <OutroSection />
      </main>
    </>
  );
}
