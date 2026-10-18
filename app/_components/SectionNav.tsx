"use client";

import { useEffect, useRef } from "react";

import cn from "classnames";
import { useTranslations } from "next-intl";

import useCarriedState from "@/utils/useCarriedState";

const navItems = [
  { id: "competencies", color: "#007aff" },
  { id: "skills", color: "#00a6c3" },
  { id: "career", color: "#00c676" },
  { id: "projects", color: "#92e35c" },
  { id: "education", color: "#e2ff00" },
] as const;

const ACTIVE_LINE = 60;
const HOLD = 0.25;
const BLEND_START = 0.8125;
const BLEND_END = 0.9375;

const rgb = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
const colors = navItems.map(({ color }) => rgb(color));

const blend = (from: number[], to: number[], amount: number) =>
  `rgb(${from.map((channel, i) => Math.round(channel + (to[i] - channel) * amount)).join(", ")})`;

const landingTop = (section: HTMLElement) =>
  section.getBoundingClientRect().top - (parseFloat(getComputedStyle(section).scrollMarginTop) || 0);

const SectionNav = () => {
  const t = useTranslations("Nav");
  const tHeader = useTranslations("Header");

  const [activeId, setActiveId] = useCarriedState("nav.activeId", "");
  const [isVisible, setIsVisible] = useCarriedState("nav.visible", false);

  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const indicatorRef = useRef<HTMLSpanElement>(null);

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

    const placeIndicator = (sections: HTMLElement[]) => {
      const indicator = indicatorRef.current;
      const dots = dotRefs.current;
      if (!indicator || dots.length !== sections.length || dots.some(dot => !dot)) return;

      const anchors = sections.map(section => landingTop(section) + window.scrollY - ACTIVE_LINE);
      let index = 0;
      while (index < anchors.length - 1 && window.scrollY >= anchors[index + 1]) index++;
      const next = Math.min(index + 1, anchors.length - 1);
      const span = anchors[next] - anchors[index];
      const progress = span > 0 ? Math.min(Math.max((window.scrollY - anchors[index]) / span, 0), 1) : 0;
      const move = progress < HOLD ? 0 : (progress - HOLD) / (1 - HOLD);

      const size = dots[0]!.offsetHeight;
      const from = dots[index]!.offsetTop;
      const pitch = dots[next]!.offsetTop - from;
      const gap = pitch - size;

      let top = from;
      let height = size;
      if (next !== index) {
        if (move <= 0.25) height = size + gap * (move / 0.25);
        else if (move <= 0.5) height = size + gap + size * ((move - 0.25) / 0.25);
        else {
          const shrink = (move - 0.5) / 0.5;
          top = from + pitch * shrink;
          height = size + pitch * (1 - shrink);
        }
      }

      indicator.style.top = `${top}px`;
      indicator.style.height = `${height}px`;
      const amount = Math.min(Math.max((progress - BLEND_START) / (BLEND_END - BLEND_START), 0), 1);
      indicator.style.backgroundColor = amount > 0 ? blend(colors[index], colors[next], amount) : navItems[index].color;
    };

    const attach = () => {
      if (detach) return;
      const ids = navItems.map(({ id }) => id);
      let queued = false;
      const compute = () => {
        queued = false;
        const sections = ids.map(id => document.getElementById(id)).filter(el => el !== null);
        placeIndicator(sections);
        let current = "";
        for (const section of sections) {
          if (landingTop(section) <= ACTIVE_LINE) current = section.id;
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
      inert={!isVisible}
      className={cn(
        "fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-3.5",
        "transition-opacity duration-200",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none",
      )}
    >
      <span
        ref={indicatorRef}
        aria-hidden="true"
        className="absolute left-0 top-0 w-2.5 h-2.5 rounded-full pointer-events-none bg-blue will-change-[top,height]"
      />
      {navItems.map(({ id }, index) => {
        const isActive = activeId === id;
        return (
          <a
            key={`section-nav-${id}`}
            href={`#${id}`}
            aria-current={isActive ? "true" : undefined}
            onClick={() => handleNavClick(id)}
            className="group flex items-center gap-2.5 no-underline focus-visible:rounded-sm"
          >
            <span
              ref={dot => {
                dotRefs.current[index] = dot;
              }}
              className="w-2.5 h-2.5 rounded-full bg-foreground/15 transition-colors duration-200 group-hover:bg-foreground/30"
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
