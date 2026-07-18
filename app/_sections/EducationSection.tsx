import { getLocale, getTranslations } from "next-intl/server";

import EducationCard from "@/_components/EducationCard";
import SectionWatcher from "@/_components/SectionWatcher";
import SlideUpInView from "@/_components/SlideUpInView";
import prisma from "@/lib/prisma";
import { applyLocaleAll } from "@/utils/localize";

async function getEducations() {
  const response = await prisma.education.findMany({
    orderBy: { id: "asc" },
  });
  return response;
}

export default async function EducationSection() {
  const locale = await getLocale();
  const t = await getTranslations("Education");
  const data = applyLocaleAll(await getEducations(), locale);

  const educations = data.filter(d => d.category === "EDUCATION");
  const certifications = data.filter(d => d.category === "CERTIFICATION");

  return (
    <SectionWatcher id="education">
      <SlideUpInView>
        <h2 className="section-eyebrow mb-6 md:mb-8">{t("eyebrow")}</h2>

        <div className="flex flex-col gap-8 md:gap-10">
          {educations.map(data => (
            <EducationCard key={`edu-card-${data.id}`} {...data} />
          ))}
          <div className="w-full max-w-[600px] h-px mx-auto my-3 md:my-5 bg-linear-to-r from-foreground/0 via-foreground/15 to-foreground/0" />
          {certifications.map(data => (
            <EducationCard key={`edu-card-${data.id}`} {...data} />
          ))}
        </div>
      </SlideUpInView>
    </SectionWatcher>
  );
}
