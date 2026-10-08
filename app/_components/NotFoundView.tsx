"use client";

import { useEffect, useState } from "react";
import { Home } from "react-feather";

import { useTranslations } from "next-intl";

import SiteHeader from "@/_components/SiteHeader";
import CTAButton from "@/_components/buttons/CTAButton";
import monocleStill from "@/assets/emoji/face-with-monocle-still.webp";
import monocle from "@/assets/emoji/face-with-monocle.webp";

const NotFoundView = () => {
  const t = useTranslations("NotFound");
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: no-preference)").matches) return;
    let cancelled = false;
    const loadAnimation = () => {
      const image = new Image();
      image.fetchPriority = "low";
      image.src = monocle.src;
      image
        .decode()
        .then(() => {
          if (!cancelled) setAnimated(true);
        })
        .catch(() => {});
    };
    if (document.readyState === "complete") loadAnimation();
    else window.addEventListener("load", loadAnimation, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", loadAnimation);
    };
  }, []);

  return (
    <>
      <SiteHeader homeHref="/" />
      <main className="flex flex-col items-center justify-center px-5 pt-14 pb-[calc(var(--vh0,1vh)*12)]">
        <div className="hero-rise hero-rise-1 flex flex-col md:flex-row items-center gap-4 md:gap-7">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={animated ? monocle.src : monocleStill.src}
            width={monocleStill.width}
            height={monocleStill.height}
            alt=""
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="shrink-0 w-24 h-24 md:w-36 md:h-36"
          />
          <h1 className="flex flex-col items-center">
            <span className="text-7xl md:text-8xl font-extrabold leading-none tracking-tight pr-[0.025em]">404</span>
            <span lang="en" className="mt-2 md:mt-3 text-xl md:text-2xl font-semibold text-foreground/80">
              Page Not Found
            </span>
          </h1>
        </div>
        <p className="hero-rise hero-rise-2 mt-6 md:mt-8 text-center text-balance text-base text-foreground/70">
          {t("description")}
        </p>
        <CTAButton
          label={t("cta")}
          prefix={<Home className="w-4 h-4" />}
          link="/"
          newTab={false}
          className="hero-rise hero-rise-3 mt-8"
        />
      </main>
    </>
  );
};

export default NotFoundView;
