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

    // On touch devices lenis (smoothWheel-only) does nothing for the scroll feel
    // yet keeps a permanent rAF loop running every frame — pure main-thread tax
    // during the already-contended first load. Skip lenis there and let anchor
    // links fall back to native smooth scroll (scroll-padding-top handles offset).
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
        const offset = window.matchMedia("(min-width: 64rem)").matches ? -60 : -24;
        lenis.scrollTo(el, { offset });
      } else {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
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
