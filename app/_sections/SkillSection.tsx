import SectionWatcher from "@/_components/SectionWatcher";
import SlideUpInView from "@/_components/SlideUpInView";
import SkillItems from "@/_components/skill/SkillItems";
import prisma from "@/lib/prisma";

async function getAllSkills() {
  return await prisma.skill.findMany({
    orderBy: [{ category: "asc" }, { order: "asc" }],
  });
}

export default async function SkillSection() {
  const allSkills = await getAllSkills();

  return (
    <SectionWatcher id="skill">
      <SlideUpInView>
        <h2 className="section-eyebrow">기술 스택</h2>
        <p className="section-title">아래의 기술들을 사용할 수 있습니다.</p>
        <SkillItems skills={allSkills} />
      </SlideUpInView>
    </SectionWatcher>
  );
}
