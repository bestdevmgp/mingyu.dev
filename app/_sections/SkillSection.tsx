import { getTranslations } from "next-intl/server";

import SlideUpInView from "@/_components/SlideUpInView";
import SkillItems from "@/_components/skill/SkillItems";
import { getShownSkills } from "@/utils/api";

export default async function SkillSection() {
  const allSkills = getShownSkills();
  const t = await getTranslations("Skill");

  return (
    <section id="skills">
      <SlideUpInView>
        <h2 className="section-eyebrow">{t("eyebrow")}</h2>
        <p className="section-title">{t("title")}</p>
        <SkillItems skills={allSkills} />
      </SlideUpInView>
    </section>
  );
}
