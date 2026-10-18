"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Menu, X } from "react-feather";

import cn from "classnames";
import { stagger, useAnimate } from "motion/react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import Sparkle from "@/assets/shape-sparkle-round.svg";
import useCarriedState from "@/utils/useCarriedState";
import useFocusScope from "@/utils/useFocusScope";
import useIsDark from "@/utils/useIsDark";
import useOnEscape from "@/utils/useOnEscape";

import ContactMenu from "./ContactMenu";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";
import Tooltip from "./Tooltip";

const navItems = [{ id: "skills" }, { id: "career" }, { id: "projects" }, { id: "education" }] as const;

const nameNudge: Record<string, string> = {
  en: "-translate-y-[0.6px] md:translate-y-0",
  ko: "-translate-y-[0.7px] md:-translate-y-[0.2px]",
  ja: "-translate-y-[0.9px] md:-translate-y-[1.2px]",
  "zh-Hans": "-translate-y-[0.4px] md:-translate-y-[1.3px]",
  "zh-Hant": "-translate-y-[0.4px] md:-translate-y-[1.3px]",
};

const staggerMenuItems = stagger(0.06, { startDelay: 0.0875 });

let closeMenuAfterSwitch = false;

interface SiteHeaderProps {
  homeHref?: string;
}

const SiteHeader = ({ homeHref }: SiteHeaderProps) => {
  const HomeLink = homeHref ? "a" : Link;
  const t = useTranslations("Header");
  const tNav = useTranslations("Nav");
  const locale = useLocale();
  const themeLabel = t(useIsDark() ? "switchToLight" : "switchToDark");

  const [atTop, setAtTop] = useCarriedState("header.atTop", true);
  const [isExpanded, setIsExpanded] = useCarriedState("header.menu", false);
  const glass = !atTop || homeHref !== undefined;
  const [carriedOpen] = useState(isExpanded);
  const [scope, animate] = useAnimate();
  const initialClip = carriedOpen ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 100% 0%)";
  const initialItemStyle = carriedOpen ? { opacity: 1 } : undefined;

  useLayoutEffect(() => {
    const header = scope.current;
    const greeting = homeHref === undefined ? document.querySelector<HTMLElement>("#main h1") : null;
    const range = document.createRange();
    const onScroll = () => {
      setAtTop(window.scrollY <= 0);
      let progress = 1;
      if (greeting) {
        range.selectNodeContents(greeting);
        const line = range.getClientRects()[0];
        const shift = new DOMMatrixReadOnly(getComputedStyle(greeting).transform).m42;
        const distance = line ? line.top + window.scrollY - shift : 0;
        progress = distance > 0 ? Math.min(Math.max(window.scrollY / distance, 0), 1) : 1;
      }
      header?.style.setProperty("--glass", `${progress}`);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [homeHref, scope, setAtTop]);

  const didMountRef = useRef(false);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    animate([
      [
        ".mobile-menu",
        { clipPath: isExpanded ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 100% 0%)" },
        { type: "spring", bounce: 0, duration: 0.35 },
      ],
      [
        ".mobile-menu-item",
        { opacity: isExpanded ? 1 : 0 },
        { duration: 0.175, delay: isExpanded ? staggerMenuItems : 0, at: "-0.175" },
      ],
    ]);
  }, [isExpanded, animate]);

  useEffect(() => {
    if (!closeMenuAfterSwitch) return;
    const frame = requestAnimationFrame(() => {
      closeMenuAfterSwitch = false;
      setIsExpanded(false);
    });
    return () => cancelAnimationFrame(frame);
  }, [locale, setIsExpanded]);

  const pickedSection = useRef<HTMLElement | null>(null);
  const resumeBelow = useCallback(
    (openedByKeyboard: boolean) => {
      const section = pickedSection.current;
      pickedSection.current = null;
      if (openedByKeyboard && !section) return null;
      return () =>
        Math.max(scope.current?.getBoundingClientRect().bottom ?? 0, section?.getBoundingClientRect().top ?? 0);
    },
    [scope],
  );

  const expandedRef = useRef(isExpanded);
  useEffect(() => {
    expandedRef.current = isExpanded;
  }, [isExpanded]);

  useEffect(() => {
    let outside = false;
    const onPointerDown = (event: PointerEvent) => {
      outside = expandedRef.current && !scope.current?.contains(event.target as Node);
      if (!outside) return;
      event.stopPropagation();
      setIsExpanded(false);
    };
    const stopOutside = (event: Event) => {
      if (outside) event.stopPropagation();
    };
    const swallowClick = (event: MouseEvent) => {
      if (!outside || event.detail === 0) return;
      outside = false;
      event.preventDefault();
      event.stopPropagation();
    };
    window.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("touchstart", stopOutside, { capture: true, passive: true });
    window.addEventListener("mousedown", stopOutside, true);
    window.addEventListener("click", swallowClick, true);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("touchstart", stopOutside, true);
      window.removeEventListener("mousedown", stopOutside, true);
      window.removeEventListener("click", swallowClick, true);
    };
  }, [scope, setIsExpanded]);

  useEffect(() => {
    if (!isExpanded) return;
    const wide = window.matchMedia("(min-width: 80rem)");
    const close = () => {
      if (wide.matches) setIsExpanded(false);
    };
    wide.addEventListener("change", close);
    return () => wide.removeEventListener("change", close);
  }, [isExpanded, setIsExpanded]);

  useEffect(() => {
    const header = scope.current;
    if (!isExpanded || !header) return;
    const block = (event: Event) => event.preventDefault();
    header.addEventListener("wheel", block, { passive: false });
    header.addEventListener("touchmove", block, { passive: false });
    return () => {
      header.removeEventListener("wheel", block);
      header.removeEventListener("touchmove", block);
    };
  }, [isExpanded, scope]);

  useOnEscape(isExpanded, () => setIsExpanded(false));
  useFocusScope(scope, isExpanded, ".mobile-menu a", resumeBelow);

  const scrollToTop = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsExpanded(false);
    if (window.__lenis) window.__lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  };

  return (
    <header
      ref={scope}
      data-lenis-prevent={isExpanded || undefined}
      className={cn(
        "sticky top-0 z-50 h-14 -mb-14 pr-[23px] lg:pr-[22px] pl-[20px] lg:pl-[22px]",
        "flex items-center justify-between gap-4",

        "bg-[color-mix(in_oklab,var(--background)_calc(var(--glass,0)*42%),transparent)]",
        glass && "backdrop-blur-md",

        "before:content-[''] before:absolute before:inset-0 before:-z-10 before:bg-background",
        "before:transition-opacity before:duration-300",
        isExpanded ? "before:opacity-100" : "before:opacity-0",

        "after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px",
        "after:transition-colors after:duration-300",
        isExpanded ? "after:bg-foreground/10" : "after:bg-transparent",
      )}
    >
      <HomeLink
        className="no-underline flex items-center gap-[6px] lg:gap-[8px] min-w-0 focus-visible:rounded-md"
        href={homeHref ?? "#top"}
        onClick={homeHref ? undefined : scrollToTop}
      >
        <Sparkle className="shrink-0 text-lime" aria-hidden="true" />
        <p
          className={cn(
            "text-sm md:text-base whitespace-nowrap leading-none min-w-0 truncate py-1",

            nameNudge[locale] ?? "translate-y-0",
          )}
        >
          <span className="font-extrabold text-foreground">{t("name")}</span>
          <span className="font-normal text-foreground/45"> | {t("role")}</span>
        </p>
      </HomeLink>

      <div className="flex items-center gap-2 shrink-0">
        <div className="hidden xl:flex items-center gap-[13px]">
          <LanguageSwitcher hardNavigation={homeHref !== undefined} />
          <Tooltip label={themeLabel}>
            <ThemeToggle className="[&_svg]:w-5 [&_svg]:h-5 [&_svg]:[stroke-width:2.6] [&_svg:last-child]:translate-y-[0.5px]" />
          </Tooltip>
          <ContactMenu />
        </div>

        <button
          type="button"
          className="block xl:hidden shrink-0 text-foreground/70 -mr-1 p-1 focus-visible:rounded-md"
          onClick={() => setIsExpanded(prev => !prev)}
          aria-label={t(isExpanded ? "closeMenu" : "openMenu")}
          aria-expanded={isExpanded}
        >
          {isExpanded ? <X className="block w-5 h-5" /> : <Menu className="block w-5 h-5" />}
        </button>
      </div>

      <div
        className={cn(
          "mobile-menu",
          "absolute top-full left-0 right-0",

          "flex flex-col xl:hidden px-5 pt-3 pb-0 indent-0",

          "bg-background border-b-[2px] border-foreground/10 shadow-sm",
          isExpanded ? "pointer-events-auto" : "pointer-events-none",
        )}
        style={{ clipPath: initialClip }}
        inert={!isExpanded}
      >
        <ul className="flex flex-col list-none p-0 m-0 indent-0">
          {navItems.map(({ id }) => (
            <li key={`header-item-m-${id}`} className="mobile-menu-item" style={initialItemStyle}>
              <a
                href={`${homeHref ?? ""}#${id}`}
                className="block no-underline py-2.5 text-base font-semibold whitespace-nowrap text-foreground/80 focus-visible:rounded-sm"
                onClick={() => {
                  pickedSection.current = document.getElementById(id);
                  setIsExpanded(false);
                }}
              >
                {tNav(id)}
              </a>
            </li>
          ))}
        </ul>

        <div
          className="mobile-menu-item flex items-center justify-between gap-3 h-11 mt-2 border-t border-foreground/10"
          style={initialItemStyle}
        >
          <ContactMenu variant="inline" />
          <div className="flex items-center gap-3">
            <span aria-hidden className="w-px h-[22px] bg-foreground/15 shrink-0" />
            <ThemeToggle title={themeLabel} />
          </div>
        </div>

        <LanguageSwitcher
          variant="inline"
          hardNavigation={homeHref !== undefined}
          onLocaleChange={() => {
            closeMenuAfterSwitch = true;
          }}
          className="mobile-menu-item py-2.5 border-t border-foreground/10"
          style={initialItemStyle}
        />
      </div>
    </header>
  );
};

export default SiteHeader;
