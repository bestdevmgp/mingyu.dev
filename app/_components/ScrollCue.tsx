"use client";

import { useEffect, useState } from "react";

import cn from "classnames";

// "Scroll down" hint shown when the first content ("핵심 역량") isn't on screen yet:
// on mobile it sits at the hero/content seam; on desktop, just below the floating
// nav bar (it's placed after <Header/> in the tree, and the nav bar is desktop-only).
// It fades away for good once "핵심 역량" comes into view — either by scrolling, or
// immediately on a viewport tall enough to already show it (so it never appears there).
// `-mb-8` cancels its own height so it never shifts the content. Reduced-motion → static.
const ScrollCue = () => {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const target = document.querySelector("#intro .section-eyebrow");
    if (!target) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setHidden(true);
        io.disconnect();
      }
    });
    io.observe(target);
    return () => io.disconnect();
  }, []);

  return (
    <div
      aria-hidden
      className={cn(
        "w-full h-8 -mb-8 flex items-center justify-center text-foreground/55",
        "transition-opacity duration-500",
        hidden ? "opacity-0" : "opacity-100",
      )}
    >
      <div className="hero-rise" style={{ animationDelay: "2.4s" }}>
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
