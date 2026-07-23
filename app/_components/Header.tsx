"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "react-feather";

import cn from "classnames";
import { useAnimate, stagger } from "motion/react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import useOnClickOutside from "@/utils/useOnClickOutside";

import Logo from "./Logo";

interface HeaderProps extends React.HTMLAttributes<HTMLHeadElement> {}

const navItems = [{ id: "skill" }, { id: "experience" }, { id: "project" }, { id: "education" }] as const;

const staggerMenuItems = stagger(0.1, { startDelay: 0.15 });

const Header = ({ className, ...props }: HeaderProps) => {
  const t = useTranslations("Nav");

  const [activeId, setActiveId] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [scope, animate] = useAnimate();

  useEffect(() => {
    const ids = navItems.map(({ id }) => id);
    const update = () => {
      let current = "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) current = id;
      }
      setActiveId(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsExpanded(!isExpanded);
  };

  const scrollToTop = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (window.__lenis) window.__lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  };

  useEffect(() => {
    animate([
      [
        ".mobile-menu",
        { clipPath: isExpanded ? "inset(0% 0% 0% 0% round 16px)" : "inset(0% 10% 100% 90% round 16px)" },
        { type: "spring", bounce: 0, duration: 0.5 },
      ],
      [
        ".mobile-menu-item",
        { opacity: isExpanded ? 1 : 0 },
        { duration: 0.2, delay: isExpanded ? staggerMenuItems : 0, at: "-0.2" },
      ],
    ]);
  }, [isExpanded, animate]);

  useOnClickOutside(scope, () => setIsExpanded(false));

  return (
    <header className="hidden lg:block sticky top-20 z-40 px-0" {...props} ref={scope}>
      <div
        className={cn(
          className,
          "w-full h-10 md:h-12 px-4 md:px-6 sm:pr-1.5 md:pr-2 bg-foreground/[0.07] backdrop-blur-lg rounded-full",
          "flex justify-between items-center  gap-1.5 md:gap-2",
          "dark:bg-light/10 ",
        )}
      >
        <Link className="no-underline" href="#top" onClick={scrollToTop}>
          <Logo className="mr-4" />
        </Link>

        <ul className="hidden sm:flex gap-1.5 md:gap-2 items-center list-none p-0 indent-0">
          {navItems.map(({ id }) => (
            <Link key={`header-item-${id}`} href={`#${id}`} className="no-underline">
              <li
                className={cn(
                  "px-3 md:px-4 py-1.5 md:py-2 rounded-full flex gap-0.5 items-center transition-colors",
                  "hover:bg-background/50",
                  activeId === id && "bg-background",
                )}
              >
                <span
                  className={cn(
                    "text-xs md:text-sm font-semibold whitespace-nowrap transition-colors",
                    activeId === id ? "text-foreground" : "text-foreground/60 hover:text-foreground/80",
                  )}
                >
                  {t(id)}
                </span>
              </li>
            </Link>
          ))}
        </ul>

        <button className="block sm:hidden" onClick={toggleMobileMenu}>
          {isExpanded ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <ul
        className={cn(
          "mobile-menu",
          "absolute top-12 left-1 right-1",
          "h-fit px-5 py-4 mt-2 flex flex-col sm:hidden indent-0",
          "bg-foreground/[0.07] backdrop-blur-lg list-none",
          isExpanded ? "pointer-events-auto" : "pointer-events-none",
        )}
        style={{ clipPath: "inset(0% 50% 100% 50% round 10px)" }}
      >
        {navItems.map(({ id }) => (
          <Link
            key={`header-item-m-${id}`}
            href={`#${id}`}
            className={cn("mobile-menu-item", "no-underline")}
            onClick={() => setIsExpanded(false)}
          >
            <li className="py-2.5 text-base font-semibold whitespace-nowrap text-foreground/80">{t(id)}</li>
          </Link>
        ))}
      </ul>
    </header>
  );
};

export default Header;
