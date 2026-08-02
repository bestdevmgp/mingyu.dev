import { ExternalLink } from "react-feather";

import { getTranslations } from "next-intl/server";

import CTAButton from "@/_components/buttons/CTAButton";

const MainSection = async () => {
  const t = await getTranslations("Main");

  return (
    <div
      id="main"
      className="relative w-full flex flex-col items-center justify-center pt-32 md:pt-44 pb-32 mb-12 md:mb-20"
      style={{ minHeight: "clamp(600px, 80vh, 1080px)" }}
    >
      <div aria-hidden className="hero-bg">
        <div className="hero-bg-canvas">
          <div className="hero-blob hero-blob-blue" />
          <div className="hero-blob hero-blob-green" />
          <div className="hero-blob hero-blob-lime" />
        </div>
      </div>

      <h1 className="hero-rise relative z-10 w-full p-6 md:p-8 leading-[1.15]" style={{ animationDelay: "0.5s" }}>
        {t.rich("heading", { br: () => <br />, em: chunks => <em>{chunks}</em> })}
      </h1>

      <p
        className="hero-rise relative z-10 max-w-[21rem] md:max-w-none text-center text-base font-normal text-foreground/70 mb-8"
        style={{ animationDelay: "1.5s" }}
      >
        {t.rich("subtitle", { br: () => <br /> })}
      </p>

      <div className="hero-rise relative z-10" style={{ animationDelay: "1.9s" }}>
        <CTAButton label={t("cta")} prefix={<ExternalLink className="w-4 h-4" />} link="https://cv.mingyu.dev" />
      </div>
    </div>
  );
};

export default MainSection;
