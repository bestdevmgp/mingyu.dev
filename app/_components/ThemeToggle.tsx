"use client";

import { useCallback } from "react";
import { Moon, Sun } from "react-feather";

import cn from "classnames";

import { subtleBoxClasses } from "@/utils/pressClasses";
import useTouchPress from "@/utils/useTouchPress";

type ThemeToggleProps = React.HTMLAttributes<HTMLButtonElement> & { label: string };

const TRANSITION_MS = 300;

let cleanupTimer = 0;

const ThemeToggle = ({ label, className, ...props }: ThemeToggleProps) => {
  const [isPressed, pressHandlers] = useTouchPress();
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
      aria-label={label}
      {...pressHandlers}
      className={cn(
        "relative text-foreground/55",
        "before:-inset-1.5 before:rounded-md before:transition-colors",
        subtleBoxClasses(isPressed),
        className,
      )}
      {...props}
    >
      <Sun className="w-[18px] h-[18px] dark:hidden" strokeWidth={2.3} />
      <Moon className="w-[18px] h-[18px] hidden dark:block" strokeWidth={2.3} />
    </button>
  );
};

export default ThemeToggle;
