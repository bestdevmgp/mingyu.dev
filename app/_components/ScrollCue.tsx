"use client";

import { useEffect, useState } from "react";

import cn from "classnames";

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
