"use client";

import { useCallback, useRef } from "react";
import { flushSync } from "react-dom";
import { Moon, Sun } from "react-feather";

import cn from "classnames";
import { useTranslations } from "next-intl";

type ThemeToggleProps = React.HTMLAttributes<HTMLButtonElement> & { duration?: number };

const ThemeToggle = ({ className, duration = 450, ...props }: ThemeToggleProps) => {
  const t = useTranslations("Header");
  const buttonRef = useRef<HTMLButtonElement>(null);

  const applyTheme = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    } catch {}
  };

  const toggle = useCallback(() => {
    const button = buttonRef.current;
    const prefersReducedMotion =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!button || typeof document.startViewTransition !== "function" || prefersReducedMotion) {
      applyTheme();
      return;
    }

    const { top, left, width, height } = button.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const maxRadius = Math.hypot(Math.max(x, vw - x), Math.max(y, vh - y));

    const transition = document.startViewTransition(() => flushSync(applyTheme));
    transition.ready
      .then(() => {
        document.documentElement.animate(
          {
            clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxRadius}px at ${x}px ${y}px)`],
          },
          {
            duration,
            easing: "ease-in-out",
            fill: "forwards",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      })
      .catch(() => {});
  }, [duration]);

  return (
    <button
      type="button"
      ref={buttonRef}
      onClick={toggle}
      aria-label={t("toggleTheme")}
      title={t("toggleTheme")}
      className={cn("text-foreground/55 hover:text-foreground transition-colors", className)}
      {...props}
    >
      <Sun className="w-[18px] h-[18px] dark:hidden" strokeWidth={1.5} />
      <Moon className="w-[18px] h-[18px] hidden dark:block" strokeWidth={1.5} />
    </button>
  );
};

export default ThemeToggle;
