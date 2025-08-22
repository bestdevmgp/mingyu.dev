import FeatureItems from "@/_components/FeatureItems";
import SlideUpInView from "@/_components/SlideUpInView";
import prisma from "@/lib/prisma";

async function getIntro() {
  const response = await prisma.intro.findMany({ orderBy: { id: "asc" } });
  return response;
}

export default async function IntroSection() {
  const features = await getIntro();

  return (
    <section id="intro">
      <SlideUpInView>
        <p className="section-eyebrow">핵심 역량</p>
        <p className="section-title">유연하게 소통하고 견고하게 개발합니다.</p>
        <FeatureItems features={features} />
      </SlideUpInView>
    </section>
  );
}
