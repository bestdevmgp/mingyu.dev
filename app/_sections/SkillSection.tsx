import { getTranslations } from "next-intl/server";

import SectionWatcher from "@/_components/SectionWatcher";
import SlideUpInView from "@/_components/SlideUpInView";
import SkillItems from "@/_components/skill/SkillItems";
import { getSkillTable } from "@/utils/api";

export default async function SkillSection() {
  const allSkills = (await getSkillTable()).filter(skill => !skill.hidden);
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
