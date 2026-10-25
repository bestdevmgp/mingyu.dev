"use client";

import { useEffect } from "react";

import cn from "classnames";

import useCarriedState from "@/utils/useCarriedState";

const ScrollCue = () => {
  const [hidden, setHidden] = useCarriedState("cue.hidden", false);

  useEffect(() => {
    const target = document.querySelector("#competencies .section-eyebrow");
    if (!target) return;
    const block = target.closest("[data-reveal]");
    let first = true;
    let reveal: MutationObserver | undefined;
    const io = new IntersectionObserver(([entry]) => {
      const atMount = first;
      first = false;
      if (!entry.isIntersecting) return;
      io.disconnect();
      if (!atMount || !block || block.classList.contains("is-revealed")) {
        setHidden(true);
        return;
      }
      reveal = new MutationObserver(() => {
        if (!block.classList.contains("is-revealed")) return;
        setHidden(true);
        reveal?.disconnect();
      });
      reveal.observe(block, { attributes: true, attributeFilter: ["class"] });
    });
    io.observe(target);
    return () => {
      io.disconnect();
      reveal?.disconnect();
    };
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
