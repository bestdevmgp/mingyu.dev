"use client";

import { useEffect } from "react";

import Lenis from "lenis";

declare global {
  interface Window {
    __lenis?: Lenis;
    __pauseSmoothScroll?: () => void;
    __resumeSmoothScroll?: () => void;
  }
}

const SmoothScroll = () => {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const isTouch = window.matchMedia("(pointer: coarse)").matches;

    let lenis: Lenis | null = null;
    let rafId = 0;
    let running = true;

    if (!isTouch) {
      const instance = new Lenis({
        duration: 1.2,
        easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });
      lenis = instance;
      window.__lenis = instance;

      const raf = (time: number) => {
        if (running) instance.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);

      window.__pauseSmoothScroll = () => {
        running = false;
        instance.stop();
      };
      window.__resumeSmoothScroll = () => {
        running = true;
        instance.start();
      };
    }

    const onAnchorClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      const href = anchor?.getAttribute("href");
      if (!href || href === "#") return;
      const id = href.slice(1);
      if (id === "top") {
        event.preventDefault();
        if (lenis) lenis.scrollTo(0);
        else window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      const el = document.getElementById(id);
      if (!el) return;
      event.preventDefault();

      if (lenis) {
        // scroll-padding-top already reserves the header space (3.75rem at lg / 1.5rem below),
        // so this offset only adds a small breathing gap below the sticky sub-nav.
        // Keep the lg value in sync with the scroll-spy activation line in Header.tsx.
        const offset = window.matchMedia("(min-width: 64rem)").matches ? -18 : -8;
        lenis.scrollTo(el, { offset });
      } else {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      window.history.replaceState(null, "", href);
    };
    document.addEventListener("click", onAnchorClick);

    return () => {
      document.removeEventListener("click", onAnchorClick);
      if (lenis) {
        cancelAnimationFrame(rafId);
        lenis.destroy();
        window.__lenis = undefined;
        window.__pauseSmoothScroll = undefined;
        window.__resumeSmoothScroll = undefined;
      }
    };
  }, []);

  return null;
};

export default SmoothScroll;
