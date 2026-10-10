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
    <section id="intro" className="pt-6">
      <SlideUpInView>
        <p className="section-eyebrow">{t("eyebrow")}</p>
        <p className="section-title">{t("title")}</p>
        <FeatureItems features={features} />
      </SlideUpInView>
    </section>
  );
}
