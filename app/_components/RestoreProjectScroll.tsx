"use client";

import { useEffect } from "react";

import { recaptureLocaleAnchor } from "@/utils/localeSwitch";
import { landingOf, NAV_SECTIONS, sectionElements, TOC_QUERY } from "@/utils/sectionLanding";

const WAIT_LIMIT = 8000;
const RETRY_INTERVAL = 100;
const SETTLED_TOLERANCE = 2;

const RestoreProjectScroll = () => {
  useEffect(() => {
    let origin: string | null;
    try {
      origin = sessionStorage.getItem("from-project");
    } catch {
      return;
    }
    if (!origin) return;

    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (origin === "page" && navigation?.type !== "back_forward") {
      sessionStorage.removeItem("from-project");
      return;
    }

    const started = Date.now();
    let retry = 0;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      sessionStorage.removeItem("from-project");
      window.clearInterval(retry);
      window.removeEventListener("wheel", finish);
      window.removeEventListener("touchstart", finish);
      window.removeEventListener("keydown", finish);
    };

    const step = () => {
      if (finished) return;
      if (Date.now() - started > WAIT_LIMIT) return finish();

      const target = document.getElementById("projects");
      if (!target) return;

      const before = window.scrollY;
      const lenis = window.__lenis;
      lenis?.resize();
      const { natural, landing } = landingOf(sectionElements(NAV_SECTIONS), "projects");
      const tall = window.matchMedia(TOC_QUERY).matches && landing !== natural;
      if (lenis) lenis.scrollTo(tall ? landing : target, { immediate: true });
      else if (tall) window.scrollTo(0, landing);
      else target.scrollIntoView();
      recaptureLocaleAnchor();

      const reached = tall
        ? Math.abs(window.scrollY - landing) < SETTLED_TOLERANCE
        : target.getBoundingClientRect().top < window.innerHeight / 2;
      if (reached && Math.abs(window.scrollY - before) < SETTLED_TOLERANCE) finish();
    };

    step();

    if (!finished) {
      retry = window.setInterval(step, RETRY_INTERVAL);
      window.addEventListener("wheel", finish, { once: true, passive: true });
      window.addEventListener("touchstart", finish, { once: true, passive: true });
      window.addEventListener("keydown", finish, { once: true });
    }

    return finish;
  }, []);

  return null;
};

export default RestoreProjectScroll;
