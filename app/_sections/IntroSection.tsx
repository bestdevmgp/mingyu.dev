import { getLocale, getTranslations } from "next-intl/server";

import FeatureItems from "@/_components/FeatureItems";
import SlideUpInView from "@/_components/SlideUpInView";
import content from "@/lib/content";
import { applyLocaleAll } from "@/utils/localize";

export default async function IntroSection() {
  const locale = await getLocale();
  const t = await getTranslations("Intro");
  const features = applyLocaleAll(content.intro, locale);

  return (
    <section id="competencies" className="pt-6 scroll-mt-10 md:scroll-mt-14">
      <SlideUpInView>
        <h2 className="section-eyebrow">{t("eyebrow")}</h2>
        <p className="section-title">{t("title")}</p>
        <FeatureItems features={features} />
      </SlideUpInView>
    </section>
  );
}
