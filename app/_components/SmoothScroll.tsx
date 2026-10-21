"use client";

import { useEffect } from "react";

import isModifiedClick from "@/utils/isModifiedClick";
import { isCoarsePointer, prefersReducedMotion } from "@/utils/motionPreference";
import { SCROLL_KEYS } from "@/utils/scrollKeys";

import type Lenis from "lenis";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

const SmoothScroll = () => {
  useEffect(() => {
    let routerState: unknown = null;
    const rememberRouterState = () => {
      if (window.history.state?.__NA) routerState = window.history.state;
    };
    const restoreRouterState = () => {
      if (!window.history.state && routerState) window.history.replaceState(routerState, "", window.location.href);
    };
    const keepRouterState = (event: MouseEvent) => {
      if (!(event.target as Element).closest?.('a[href^="#"]')) return;
      rememberRouterState();
      setTimeout(restoreRouterState);
    };
    document.addEventListener("click", keepRouterState);
    window.addEventListener("blur", rememberRouterState);
    window.addEventListener("popstate", restoreRouterState);
    return () => {
      document.removeEventListener("click", keepRouterState);
      window.removeEventListener("blur", rememberRouterState);
      window.removeEventListener("popstate", restoreRouterState);
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const isTouch = isCoarsePointer();

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
      if (event.defaultPrevented || isModifiedClick(event)) return;
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

    const onKeyDown = (event: KeyboardEvent) => {
      if (lenis?.isScrolling !== "smooth" || !SCROLL_KEYS.has(event.key)) return;
      lenis.stop();
      lenis.start();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      disposed = true;
      document.removeEventListener("click", onAnchorClick);
      window.removeEventListener("keydown", onKeyDown);
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
