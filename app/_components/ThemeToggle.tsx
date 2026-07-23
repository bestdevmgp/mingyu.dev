"use client";

import { useCallback, useRef } from "react";
import { Moon, Sun } from "react-feather";

import cn from "classnames";
import { useTranslations } from "next-intl";

type ThemeToggleProps = React.HTMLAttributes<HTMLButtonElement> & { duration?: number };

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { ready: Promise<unknown> };
};

const COOLDOWN_MS = 1000;

const ThemeToggle = ({ className, duration = 500, ...props }: ThemeToggleProps) => {
  const t = useTranslations("Header");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const lockedUntil = useRef(0);

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
    const startViewTransition = (document as ViewTransitionDocument).startViewTransition;

    if (!button || prefersReducedMotion || !startViewTransition) {
      applyTheme();
      return;
    }

    const now = performance.now();
    if (now < lockedUntil.current) return;
    lockedUntil.current = now + COOLDOWN_MS;

    const { top, left, width, height } = button.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const maxRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    const transition = startViewTransition.call(document, () => {
      applyTheme();
    });

    transition.ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxRadius}px at ${x}px ${y}px)`] },
          { duration, easing: "ease-in-out", pseudoElement: "::view-transition-new(root)" },
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
      <Sun className="w-[18px] h-[18px] dark:hidden" strokeWidth={2} />
      <Moon className="w-[18px] h-[18px] hidden dark:block" strokeWidth={2} />
    </button>
  );
};

export default ThemeToggle;
