import { getLocale, getTranslations } from "next-intl/server";

import EducationCard from "@/_components/EducationCard";
import SlideUpInView from "@/_components/SlideUpInView";
import content from "@/lib/content";
import { applyLocaleAll } from "@/utils/localize";

export default async function EducationSection() {
  const locale = await getLocale();
  const t = await getTranslations("Education");
  const educations = applyLocaleAll(content.education, locale);

  const schools = educations.filter(education => education.category === "EDUCATION");
  const certifications = educations.filter(education => education.category === "CERTIFICATION");

  return (
    <section id="education">
      <SlideUpInView>
        <h2 className="section-eyebrow mb-6 md:mb-8">{t("eyebrow")}</h2>

        <div className="flex flex-col gap-8 md:gap-10">
          {schools.map(school => (
            <EducationCard key={`education-card-${school.id}`} {...school} />
          ))}
          <div className="w-full max-w-[600px] h-px mx-auto my-3 md:my-5 bg-linear-to-r from-foreground/0 via-foreground/15 to-foreground/0" />
          {certifications.map(certification => (
            <EducationCard key={`education-card-${certification.id}`} {...certification} />
          ))}
        </div>
      </SlideUpInView>
    </section>
  );
}
