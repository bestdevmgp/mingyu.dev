"use client";

import { useEffect } from "react";

import cn from "classnames";

import { isLocaleSwitching } from "@/utils/localeSwitch";
import useCarriedState from "@/utils/useCarriedState";

const ScrollCue = () => {
  const [hidden, setHidden] = useCarriedState("cue.hidden", false);

  useEffect(() => {
    const target = document.querySelector("#intro .section-eyebrow");
    if (!target) return;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || isLocaleSwitching()) return;
      setHidden(true);
      io.disconnect();
    });
    io.observe(target);
    return () => io.disconnect();
  }, [setHidden]);

  return (
    <div
      aria-hidden
      className={cn(
        "scroll-cue-wrap w-full h-8 flex items-center justify-center text-foreground/55",
        "transition-opacity duration-500",
        hidden ? "scroll-cue-done opacity-0" : "opacity-100",
      )}
    >
      <div className="hero-rise hero-rise-4">
        <svg
          className="scroll-cue w-[26px] h-[14px]"
          viewBox="0 0 30 16"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 4l11 9 11-9" />
        </svg>
      </div>
    </div>
  );
};

export default ScrollCue;
