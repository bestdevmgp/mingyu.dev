"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import cn from "classnames";
import { useTranslations } from "next-intl";

import isModifiedClick from "@/utils/isModifiedClick";
import { prefersReducedMotion } from "@/utils/motionPreference";
import navigationType from "@/utils/navigationType";
import { SCROLL_KEYS } from "@/utils/scrollKeys";
import { anchorsOf, landingOf, sectionElements, TOC_QUERY, type NavSection } from "@/utils/sectionLanding";
import smoothScrollTo from "@/utils/smoothScrollTo";
import useCarriedState from "@/utils/useCarriedState";

const SECTION_COLORS: Record<NavSection, string> = {
  competencies: "#007aff",
  skills: "#00a6c3",
  career: "#00c676",
  projects: "#92e35c",
  blog: "#92e35c",
  education: "#e2ff00",
};

const LABEL_GAP = 10;
const HOLD = 0.25;
const BLEND_START = 0.8125;
const BLEND_END = 0.9375;

const rgb = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));

const blend = (from: number[], to: number[], amount: number) =>
  `rgb(${from.map((channel, i) => Math.round(channel + (to[i] - channel) * amount)).join(", ")})`;

const SETTLE_MS = 200;

const anchorsHeldAt = (anchors: number[], index: number, landing: number) => {
  const held = [...anchors];
  held[index] = Math.min(held[index], landing);
  for (let i = index + 1; i < held.length; i++) {
    const floor = i === index + 1 ? held[index] + (landing + 2 - held[index]) / HOLD : held[i - 1] + 1;
    held[i] = Math.max(held[i], floor);
  }
  return held;
};

let hashChecked = false;

interface SectionNavProps {
  sections: NavSection[];
}

const SectionNav = ({ sections }: SectionNavProps) => {
  const t = useTranslations("Nav");
  const tHeader = useTranslations("Header");

  const [activeId, setActiveId] = useCarriedState("nav.activeId", "");
  const [isVisible, setIsVisible] = useCarriedState("nav.visible", false);

  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const nav = navRef.current;
    const main = document.querySelector("main");
    if (!nav || !main) return;
    const fit = () => {
      const widest = Math.max(0, ...labelRefs.current.map(label => label?.scrollWidth ?? 0));
      const left = nav.getBoundingClientRect().right - (dotRefs.current[0]?.offsetWidth ?? 0) - LABEL_GAP - widest;
      setCompact(left < main.getBoundingClientRect().right - parseFloat(getComputedStyle(main).paddingRight));
    };
    fit();
    window.addEventListener("resize", fit);
    document.fonts?.addEventListener("loadingdone", fit);
    return () => {
      window.removeEventListener("resize", fit);
      document.fonts?.removeEventListener("loadingdone", fit);
    };
  }, []);

  useEffect(() => {
    const hero = document.getElementById("main");
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.intersectionRatio === 0), {
      threshold: [0, 0.0001],
    });
    observer.observe(hero);
    return () => observer.disconnect();
  }, [setIsVisible]);

  const pendingId = useRef<string | null>(null);
  const pendingLanding = useRef(0);
  const pendingSettled = useRef(false);
  const settleTimer = useRef(0);

  const armSettle = useCallback(() => {
    pendingSettled.current = false;
    window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => {
      pendingSettled.current = true;
    }, SETTLE_MS);
  }, []);

  const hold = useCallback(
    (id: string, landing: number) => {
      pendingId.current = id;
      pendingLanding.current = landing;
      armSettle();
      setActiveId(id);
    },
    [armSettle, setActiveId],
  );

  useEffect(() => {
    const wide = window.matchMedia(TOC_QUERY);
    const palette = sections.map(id => SECTION_COLORS[id]);
    const colors = palette.map(rgb);
    let detach: (() => void) | null = null;

    const placeIndicator = (anchors: number[]) => {
      const indicator = indicatorRef.current;
      const dots = dotRefs.current;
      if (!indicator || dots.length !== anchors.length || dots.some(dot => !dot)) return;

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
      indicator.style.backgroundColor = amount > 0 ? blend(colors[index], colors[next], amount) : palette[index];
    };

    const landOnHash = () => {
      const id = window.location.hash.slice(1);
      const elements = sectionElements(sections);
      if (!elements.some(element => element.id === id)) return;
      const { natural, landing } = landingOf(elements, id);
      if (landing === natural || Math.abs(window.scrollY - natural) > 1) return;
      window.scrollTo(0, landing);
      hold(id, landing);
    };

    const attach = () => {
      let queued = false;
      let traversing = false;
      const compute = () => {
        queued = false;
        const elements = sectionElements(sections);
        const pending = pendingId.current;
        const anchors = pending
          ? anchorsHeldAt(
              anchorsOf(elements),
              elements.findIndex(element => element.id === pending),
              pendingLanding.current,
            )
          : anchorsOf(elements);
        placeIndicator(anchors);
        if (pending) {
          setActiveId(pending);
          return;
        }
        let current = "";
        elements.forEach((element, i) => {
          if (window.scrollY >= anchors[i]) current = element.id;
        });
        setActiveId(current);
      };
      const update = () => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(compute);
      };
      const release = () => {
        pendingId.current = null;
        window.clearTimeout(settleTimer.current);
      };
      const releaseOnKey = (event: KeyboardEvent) => {
        if (SCROLL_KEYS.has(event.key)) release();
      };
      const onScroll = () => {
        if (pendingId.current) {
          if (pendingSettled.current) release();
          else armSettle();
        }
        update();
      };
      const onNavigate = (event: NavigateEvent) => {
        traversing = event.navigationType === "traverse";
      };
      const onPopState = () => {
        if (traversing) traversing = false;
        else window.setTimeout(landOnHash);
      };
      update();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", update);
      window.addEventListener("wheel", release, { passive: true });
      window.addEventListener("touchstart", release, { passive: true });
      window.addEventListener("keydown", releaseOnKey);
      window.navigation?.addEventListener("navigate", onNavigate);
      window.addEventListener("popstate", onPopState);
      detach = () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", update);
        window.removeEventListener("wheel", release);
        window.removeEventListener("touchstart", release);
        window.removeEventListener("keydown", releaseOnKey);
        window.navigation?.removeEventListener("navigate", onNavigate);
        window.removeEventListener("popstate", onPopState);
        detach = null;
      };
    };

    const sync = () => {
      if (wide.matches) attach();
      else detach?.();
    };
    sync();
    if (!hashChecked && wide.matches && navigationType() === "navigate") landOnHash();
    hashChecked = true;
    wide.addEventListener("change", sync);
    return () => {
      wide.removeEventListener("change", sync);
      detach?.();
    };
  }, [sections, setActiveId, armSettle, hold]);

  const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (isModifiedClick(event)) return;
    const { natural, landing } = landingOf(sectionElements(sections), id);
    if (landing !== natural && !prefersReducedMotion()) {
      event.preventDefault();
      smoothScrollTo(landing);
      window.history.replaceState(null, "", `#${id}`);
    }
    hold(id, landing);
  };

  return (
    <nav
      ref={navRef}
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
      {sections.map((id, index) => {
        const isActive = activeId === id;
        return (
          <a
            key={`section-nav-${id}`}
            href={`#${id}`}
            aria-current={isActive ? "true" : undefined}
            onClick={event => handleNavClick(event, id)}
            className={cn("group flex items-center no-underline focus-visible:rounded-sm", !compact && "gap-2.5")}
          >
            <span
              ref={dot => {
                dotRefs.current[index] = dot;
              }}
              className="w-2.5 h-2.5 rounded-full bg-foreground/15 transition-colors duration-200 group-hover:bg-foreground/30"
            />
            <span
              ref={label => {
                labelRefs.current[index] = label;
              }}
              className={cn(
                "text-xs font-semibold whitespace-nowrap transition-colors duration-200",
                compact && "w-0 overflow-hidden",
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
