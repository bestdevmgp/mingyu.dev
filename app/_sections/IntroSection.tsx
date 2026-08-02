import { getLocale, getTranslations } from "next-intl/server";

import FeatureItems from "@/_components/FeatureItems";
import SlideUpInView from "@/_components/SlideUpInView";
import prisma, { CACHE_STRATEGY } from "@/lib/prisma";
import { applyLocaleAll } from "@/utils/localize";

async function getIntro() {
  const response = await prisma.intro.findMany({ orderBy: { id: "asc" }, cacheStrategy: CACHE_STRATEGY });
  return response;
}

export default async function IntroSection() {
  const locale = await getLocale();
  const t = await getTranslations("Intro");
  const features = applyLocaleAll(await getIntro(), locale);

  return (
    <section id="intro" className="pt-6">
      {/* Tighter top padding than other sections: the hero already sits above,
          and this keeps the blur-to-eyebrow gap small while the scroll cue stays
          at its original spot (via MainSection's restored bottom margin). */}
      <SlideUpInView>
        <p className="section-eyebrow">{t("eyebrow")}</p>
        <p className="section-title">{t("title")}</p>
        <FeatureItems features={features} />
      </SlideUpInView>
    </section>
  );
}
