"use client";

import { useCallback } from "react";
import { Moon, Sun } from "react-feather";

import cn from "classnames";
import { useTranslations } from "next-intl";

type ThemeToggleProps = React.HTMLAttributes<HTMLButtonElement>;

const TRANSITION_MS = 300;

let cleanupTimer = 0;

const ThemeToggle = ({ className, ...props }: ThemeToggleProps) => {
  const t = useTranslations("Header");

  const toggle = useCallback(() => {
    const root = document.documentElement;

    root.classList.add("theme-transition");
    const isDark = root.classList.toggle("dark");
    try {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    } catch {}

    window.clearTimeout(cleanupTimer);
    cleanupTimer = window.setTimeout(() => root.classList.remove("theme-transition"), TRANSITION_MS);
  }, []);

  return (
    <button
      type="button"
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
