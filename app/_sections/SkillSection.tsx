import { getTranslations } from "next-intl/server";

import SectionWatcher from "@/_components/SectionWatcher";
import SlideUpInView from "@/_components/SlideUpInView";
import SkillItems from "@/_components/skill/SkillItems";
import prisma, { CACHE_STRATEGY } from "@/lib/prisma";

async function getAllSkills() {
  return await prisma.skill.findMany({
    orderBy: [{ category: "asc" }, { order: "asc" }],
    cacheStrategy: CACHE_STRATEGY,
  });
}

export default async function SkillSection() {
  const allSkills = await getAllSkills();
  const t = await getTranslations("Skill");

  return (
    <SectionWatcher id="skills">
      <SlideUpInView>
        <h2 className="section-eyebrow">{t("eyebrow")}</h2>
        <p className="section-title">{t("title")}</p>
        <SkillItems skills={allSkills} />
      </SlideUpInView>
    </SectionWatcher>
  );
}
