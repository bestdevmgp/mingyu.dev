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
      <div aria-hidden className="absolute -top-16 bottom-0 left-1/2 -translate-x-1/2 w-screen overflow-hidden z-0">
        <div
          className="hero-blob hero-blob-blue w-[560px] h-[560px] md:w-[1160px] md:h-[1160px] top-[-20%] left-[-4%] md:top-[-26%] md:left-[-10%]"
          style={{ animation: "hero-drift-a 22s ease-in-out infinite alternate" }}
        />
        <div
          className="hero-blob hero-blob-green w-[540px] h-[540px] md:w-[1140px] md:h-[1140px] top-[0%] right-[-6%] md:top-[-6%] md:right-[-12%]"
          style={{ animation: "hero-drift-b 26s ease-in-out infinite alternate" }}
        />
        <div
          className="hero-blob hero-blob-lime w-[470px] h-[470px] md:w-[1000px] md:h-[1000px] bottom-[-24%] left-[24%] md:bottom-[-30%] md:left-[18%]"
          style={{ animation: "hero-drift-c 30s ease-in-out infinite alternate" }}
        />
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
        <CTAButton label={t("cta")} suffix={<ExternalLink className="w-4 h-4" />} link="https://cv.mingyu.dev" />
      </div>
    </div>
  );
};

export default MainSection;
