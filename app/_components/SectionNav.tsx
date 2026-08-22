"use client";

import { useEffect, useRef, useState } from "react";

import cn from "classnames";
import { useTranslations } from "next-intl";

import useCarriedState from "@/utils/useCarriedState";

const navItems = [{ id: "skills" }, { id: "career" }, { id: "projects" }, { id: "education" }] as const;

const SectionNav = () => {
  const t = useTranslations("Nav");
  const tHeader = useTranslations("Header");

  const [activeId, setActiveId] = useCarriedState("nav.activeId", "");
  const [isVisible, setIsVisible] = useCarriedState("nav.visible", false);

  useEffect(() => {
    const hero = document.getElementById("main");
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => setIsVisible(!entry.isIntersecting), { threshold: 0 });
    observer.observe(hero);
    return () => observer.disconnect();
  }, [setIsVisible]);

  const pendingId = useRef<string | null>(null);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 80rem)");
    let detach: (() => void) | null = null;

    const attach = () => {
      if (detach) return;
      const ids = navItems.map(({ id }) => id);
      let queued = false;
      const compute = () => {
        queued = false;
        let current = "";
        for (const id of ids) {
          const el = document.getElementById(id);
          if (el && el.getBoundingClientRect().top <= 60) current = id;
        }
        const pending = pendingId.current;
        if (pending) {
          if (current === pending) pendingId.current = null;
          setActiveId(pending);
          return;
        }
        setActiveId(current);
      };
      const update = () => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(compute);
      };
      const release = () => {
        pendingId.current = null;
      };
      update();
      window.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);
      window.addEventListener("wheel", release, { passive: true });
      window.addEventListener("touchstart", release, { passive: true });
      detach = () => {
        window.removeEventListener("scroll", update);
        window.removeEventListener("resize", update);
        window.removeEventListener("wheel", release);
        window.removeEventListener("touchstart", release);
        detach = null;
      };
    };

    const sync = () => {
      if (wide.matches) attach();
      else detach?.();
    };
    sync();
    wide.addEventListener("change", sync);
    return () => {
      wide.removeEventListener("change", sync);
      detach?.();
    };
  }, [setActiveId]);

  const handleNavClick = (id: string) => {
    pendingId.current = id;
    setActiveId(id);
  };

  return (
    <nav
      aria-label={tHeader("sectionNav")}
      className={cn(
        "fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-3.5",
        "transition-opacity duration-200",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none",
      )}
    >
      {navItems.map(({ id }) => {
        const isActive = activeId === id;
        return (
          <a
            key={`section-nav-${id}`}
            href={`#${id}`}
            aria-current={isActive ? "true" : undefined}
            onClick={() => handleNavClick(id)}
            className="group flex items-center gap-2.5 no-underline"
          >
            <span
              className={cn(
                "w-2.5 h-2.5 rounded-full border-2 transition-all duration-200",
                isActive
                  ? "bg-primary border-primary scale-110"
                  : "bg-transparent border-foreground/25 group-hover:border-foreground/50",
              )}
            />
            <span
              className={cn(
                "text-xs font-semibold whitespace-nowrap transition-colors duration-200",
                isActive ? "text-foreground" : "text-foreground/40 group-hover:text-foreground/70",
              )}
            >
              {t(id)}
            </span>
          </a>
        );
      })}
    </nav>
  );
};

export default SectionNav;
