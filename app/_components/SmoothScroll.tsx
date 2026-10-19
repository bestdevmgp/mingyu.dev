"use client";

import { useEffect } from "react";

import type Lenis from "lenis";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

const SmoothScroll = () => {
  useEffect(() => {
    const keepRouterState = (event: MouseEvent) => {
      if (!(event.target as Element).closest?.('a[href^="#"]')) return;
      const state = window.history.state;
      if (!state?.__NA) return;
      setTimeout(() => {
        if (!window.history.state) window.history.replaceState(state, "", window.location.href);
      });
    };
    document.addEventListener("click", keepRouterState);
    return () => document.removeEventListener("click", keepRouterState);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const isTouch = window.matchMedia("(pointer: coarse)").matches;

    let lenis: Lenis | null = null;
    let rafId = 0;

    let disposed = false;

    if (!isTouch) {
      void (async () => {
        const modules = await Promise.all([import("lenis"), import("lenis/dist/lenis.css")]).catch(() => null);
        if (!modules || disposed) return;
        const [{ default: LenisCtor }] = modules;
        const root = document.documentElement;
        const instance = new LenisCtor({
          duration: 0.6,
          easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          respectReducedMotion: false,
          virtualScroll: () => !root.classList.contains("loader-js") || root.classList.contains("loader-done"),
        });
        lenis = instance;
        window.__lenis = instance;

        const raf = (time: number) => {
          instance.raf(time);
          rafId = requestAnimationFrame(raf);
        };
        rafId = requestAnimationFrame(raf);
      })();
    }

    const onAnchorClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      const href = anchor?.getAttribute("href");
      if (!href || href === "#") return;
      const el = document.getElementById(href.slice(1));
      if (!el) return;
      event.preventDefault();

      if (lenis) lenis.scrollTo(el);
      else el.scrollIntoView({ behavior: "smooth", block: "start" });

      window.history.replaceState(null, "", href);
    };
    document.addEventListener("click", onAnchorClick);

    return () => {
      disposed = true;
      document.removeEventListener("click", onAnchorClick);
      if (lenis) {
        cancelAnimationFrame(rafId);
        lenis.destroy();
        window.__lenis = undefined;
      }
    };
  }, []);

  return null;
};

export default SmoothScroll;
