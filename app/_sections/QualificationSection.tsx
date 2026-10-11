import { getLocale, getTranslations } from "next-intl/server";

import QualificationCard from "@/_components/QualificationCard";
import SectionWatcher from "@/_components/SectionWatcher";
import SlideUpInView from "@/_components/SlideUpInView";
import content from "@/lib/content";
import { applyLocaleAll } from "@/utils/localize";

export default async function QualificationSection() {
  const locale = await getLocale();
  const t = await getTranslations("Qualification");
  const data = applyLocaleAll(content.education, locale);

  const schools = data.filter(d => d.category === "EDUCATION");
  const certifications = data.filter(d => d.category === "CERTIFICATION");

  return (
    <SectionWatcher id="qualifications">
      <SlideUpInView>
        <h2 className="section-eyebrow mb-6 md:mb-8">{t("eyebrow")}</h2>

        <div className="flex flex-col gap-8 md:gap-10">
          {schools.map(data => (
            <QualificationCard key={`qualification-card-${data.id}`} {...data} />
          ))}
          <div className="w-full max-w-[600px] h-px mx-auto my-3 md:my-5 bg-linear-to-r from-foreground/0 via-foreground/15 to-foreground/0" />
          {certifications.map(data => (
            <QualificationCard key={`qualification-card-${data.id}`} {...data} />
          ))}
        </div>
      </SlideUpInView>
    </SectionWatcher>
  );
}
