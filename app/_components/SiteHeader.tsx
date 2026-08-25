"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "react-feather";

import cn from "classnames";
import { stagger, useAnimate } from "motion/react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import Sparkle from "@/assets/shape-sparkle-round.svg";
import useCarriedState from "@/utils/useCarriedState";
import useOnClickOutside from "@/utils/useOnClickOutside";

import ContactMenu from "./ContactMenu";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";

const navItems = [{ id: "skills" }, { id: "career" }, { id: "projects" }, { id: "education" }] as const;

const nameNudge: Record<string, string> = {
  en: "-translate-y-[0.6px] md:translate-y-0",
  ko: "-translate-y-[0.7px] md:-translate-y-[0.2px]",
  ja: "-translate-y-[0.9px] md:-translate-y-[1.1px]",
  "zh-Hans": "-translate-y-[0.4px] md:-translate-y-[0.7px]",
  "zh-Hant": "-translate-y-[0.4px] md:-translate-y-[0.7px]",
};

const staggerMenuItems = stagger(0.07, { startDelay: 0.1 });

const SiteHeader = () => {
  const t = useTranslations("Header");
  const tNav = useTranslations("Nav");
  const locale = useLocale();

  const [scrolled, setScrolled] = useCarriedState("header.scrolled", false);
  const [atTop, setAtTop] = useCarriedState("header.atTop", true);
  const [isExpanded, setIsExpanded] = useCarriedState("header.menu", false);
  const [carriedOpen] = useState(isExpanded);
  const [scope, animate] = useAnimate();
  const initialClip = carriedOpen ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 100% 0%)";
  const initialItemStyle = carriedOpen ? { opacity: 1 } : undefined;

  useEffect(() => {
    const hero = document.getElementById("main");
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting), { threshold: 0 });
    observer.observe(hero);
    return () => observer.disconnect();
  }, [setScrolled]);

  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY <= 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [setAtTop]);

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
        { type: "spring", bounce: 0, duration: 0.4 },
      ],
      [
        ".mobile-menu-item",
        { opacity: isExpanded ? 1 : 0 },
        { duration: 0.2, delay: isExpanded ? staggerMenuItems : 0, at: "-0.2" },
      ],
    ]);
  }, [isExpanded, animate]);

  useOnClickOutside(scope, () => setIsExpanded(false));

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
      className={cn(
        "fixed top-0 inset-x-0 z-50 h-14 pr-[23px] lg:pr-[22px] pl-[20px] lg:pl-[22px]",
        "flex items-center justify-between gap-4",

        "after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px",
        "transition-colors duration-300 after:transition-colors after:duration-300",
        !atTop && !scrolled && !isExpanded && "backdrop-blur-md",
        scrolled || isExpanded
          ? "bg-background after:bg-foreground/10"
          : atTop
            ? "bg-transparent after:bg-transparent"
            : "bg-background/50 after:bg-transparent",
      )}
    >
      <Link className="no-underline flex items-center gap-[6px] lg:gap-[8px] min-w-0" href="#top" onClick={scrollToTop}>
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
      </Link>

      <div className="flex items-center gap-2 shrink-0">
        <div className="hidden xl:flex items-center gap-3.5">
          <LanguageSwitcher />
          <ThemeToggle />
          <ContactMenu />
        </div>

        <button
          type="button"
          className="block xl:hidden shrink-0 text-foreground/70 -mr-1 p-1"
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
      >
        <ul className="flex flex-col list-none p-0 m-0 indent-0">
          {navItems.map(({ id }) => (
            <a
              key={`header-item-m-${id}`}
              href={`#${id}`}
              className={cn("mobile-menu-item", "no-underline")}
              style={initialItemStyle}
              onClick={() => setIsExpanded(false)}
            >
              <li className="py-2.5 text-base font-semibold whitespace-nowrap text-foreground/80">{tNav(id)}</li>
            </a>
          ))}
        </ul>

        <div
          className="mobile-menu-item flex items-center justify-between gap-3 h-11 mt-2 border-t border-foreground/10"
          style={initialItemStyle}
        >
          <ContactMenu variant="inline" />
          <div className="flex items-center gap-3">
            <span aria-hidden className="w-px h-[22px] bg-foreground/15 shrink-0" />
            <ThemeToggle />
          </div>
        </div>

        <LanguageSwitcher
          variant="inline"
          className="mobile-menu-item py-2.5 border-t border-foreground/10"
          style={initialItemStyle}
        />
      </div>
    </header>
  );
};

export default SiteHeader;
