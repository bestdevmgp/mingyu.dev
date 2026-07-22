"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "react-feather";

import cn from "classnames";
import { stagger, useAnimate } from "motion/react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import Sparkle from "@/assets/shape-sparkle.svg";
import useOnClickOutside from "@/utils/useOnClickOutside";

import ContactMenu from "./ContactMenu";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";

const navItems = [{ id: "skill" }, { id: "experience" }, { id: "project" }, { id: "education" }] as const;

const staggerMenuItems = stagger(0.07, { startDelay: 0.1 });

const SiteHeader = () => {
  const t = useTranslations("Header");
  const tNav = useTranslations("Nav");
  const locale = useLocale();

  const [scrolled, setScrolled] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [scope, animate] = useAnimate();

  useEffect(() => {
    const hero = document.getElementById("main");
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting), { threshold: 0 });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY <= 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
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
        "sticky top-0 z-50 h-14 px-6 -mb-14",
        "flex items-center justify-between gap-4",

        // Bottom hairline is drawn as a pseudo-element (not border-b) so its left end
        // can be inset 10px — matching the right end, which the scrollbar already
        // pushes in — without shifting the header's content off Megan's spacing.
        "after:content-[''] after:absolute after:bottom-0 after:left-2.5 after:right-0 after:h-px",
        "transition-colors duration-300 after:transition-colors after:duration-300",
        !atTop && !scrolled && !isExpanded && "backdrop-blur-md",
        scrolled || isExpanded
          ? "bg-background after:bg-foreground/10"
          : atTop
            ? "bg-transparent after:bg-transparent"
            : "bg-background/50 after:bg-transparent",
      )}
    >
      <Link className="no-underline flex items-center gap-1.5 min-w-0" href="#top" onClick={scrollToTop}>
        <Sparkle className="w-[18px] h-[18px] shrink-0 text-lime" aria-hidden="true" />
        <p
          className={cn(
            // py-1 gives ascenders/descenders room inside the truncate's
            // overflow:hidden box, so they aren't intermittently clipped when the
            // web font swaps in (leading-none makes the line box otherwise too tight).
            "text-sm md:text-base whitespace-nowrap leading-none min-w-0 truncate py-1",

            locale === "en" && "-translate-y-px",
          )}
        >
          <span className="font-extrabold text-foreground">{t("name")}</span>
          <span className="font-normal text-foreground/45"> | {t("role")}</span>
        </p>
      </Link>

      <div className="flex items-center gap-2 shrink-0">
        <div className="hidden lg:flex items-center gap-3.5">
          <LanguageSwitcher />
          <ThemeToggle />
          <ContactMenu />
        </div>

        <button
          type="button"
          className="block lg:hidden shrink-0 text-foreground/70 -mr-1 p-1"
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

          "flex flex-col lg:hidden px-5 pt-3 pb-0 indent-0",

          "bg-background border-b-[3px] border-foreground/10 shadow-sm",
          isExpanded ? "pointer-events-auto" : "pointer-events-none",
        )}
        style={{ clipPath: "inset(0% 0% 100% 0%)" }}
      >
        <ul className="flex flex-col list-none p-0 m-0 indent-0">
          {navItems.map(({ id }) => (
            <Link
              key={`header-item-m-${id}`}
              href={`#${id}`}
              className={cn("mobile-menu-item", "no-underline")}
              onClick={() => setIsExpanded(false)}
            >
              <li className="py-2.5 text-base font-semibold whitespace-nowrap text-foreground/80">{tNav(id)}</li>
            </Link>
          ))}
        </ul>

        <div className="mobile-menu-item flex items-center justify-between gap-3 h-11 mt-2 border-t border-foreground/10">
          <ContactMenu variant="inline" />
          <ThemeToggle />
        </div>

        <LanguageSwitcher variant="inline" className="mobile-menu-item py-2.5 border-t border-foreground/10" />
      </div>
    </header>
  );
};

export default SiteHeader;
