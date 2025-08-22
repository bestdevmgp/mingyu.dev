import Header from "@/_components/Header";
import BlogSection from "@/_sections/BlogSection";
import EducationSection from "@/_sections/EducationSection";
import ExperienceSection from "@/_sections/ExperienceSection";
import IntroSection from "@/_sections/IntroSection";
import MainSection from "@/_sections/MainSection";
import OutroSection from "@/_sections/OutroSection";
import ProjectSection from "@/_sections/ProjectSection";
import SkillSection from "@/_sections/SkillSection";

import { SectionWatchProvider } from "./_components/SectionWatcher";

export default function Home() {
  return (
    <SectionWatchProvider>
      <main
        className="
        w-full min-w-96 max-w-screen-lg min-h-screen mx-auto
        px-5 md:px-8 lg:px-10
        flex flex-col items-center relative
      "
      >
        <MainSection />
        <Header className="mb-10" />
        <IntroSection />
        <SkillSection />
        <ExperienceSection />
        <ProjectSection />
        <BlogSection />
        <EducationSection />
        <OutroSection />
      </main>
    </SectionWatchProvider>
  );
}
