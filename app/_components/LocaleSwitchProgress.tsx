"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { isLocaleSwitching, onLocaleSwitchEnd, onLocaleSwitchStart } from "@/utils/localeSwitch";
import { prefersReducedMotion } from "@/utils/motionPreference";

const SHOW_DELAY = 400;
const MIN_VISIBLE = 300;
const CREEP_MS = 10000;
const RISE_SHARE = 0.03;
const RISE_TO = 0.25;
const HOLD_AT = 0.9;
const FILL_MS = 200;
const FADE_MS = 200;

type Phase = "hidden" | "running" | "finishing";

const LocaleSwitchProgress = () => {
  const [phase, setPhase] = useState<Phase>("hidden");
  const phaseRef = useRef<Phase>("hidden");
  const barRef = useRef<HTMLDivElement>(null);
  const showTimer = useRef(0);
  const finishTimer = useRef(0);
  const shownAt = useRef(0);

  const go = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  useEffect(() => {
    const start = () => {
      window.clearTimeout(finishTimer.current);
      if (phaseRef.current === "running" || showTimer.current) return;
      showTimer.current = window.setTimeout(() => {
        showTimer.current = 0;
        shownAt.current = performance.now();
        go("running");
      }, SHOW_DELAY);
    };

    const end = () => {
      window.clearTimeout(showTimer.current);
      showTimer.current = 0;
      if (phaseRef.current !== "running") return;
      const wait = Math.max(0, shownAt.current + MIN_VISIBLE - performance.now());
      finishTimer.current = window.setTimeout(() => go(prefersReducedMotion() ? "hidden" : "finishing"), wait);
    };

    const stopStart = onLocaleSwitchStart(start);
    const stopEnd = onLocaleSwitchEnd(end);
    if (isLocaleSwitching()) start();
    return () => {
      stopStart();
      stopEnd();
      window.clearTimeout(showTimer.current);
      window.clearTimeout(finishTimer.current);
    };
  }, [go]);

  useLayoutEffect(() => {
    const bar = barRef.current;
    if (!bar || phase === "hidden") return;

    if (phase === "running") {
      bar.getAnimations().forEach(animation => animation.cancel());
      if (prefersReducedMotion()) {
        bar.style.transform = "scaleX(1)";
        return;
      }
      bar.style.transform = "scaleX(0)";
      bar.animate(
        [
          { transform: "scaleX(0)", easing: "cubic-bezier(0.3, 0.7, 0.4, 1)" },
          { transform: `scaleX(${RISE_TO})`, offset: RISE_SHARE, easing: "cubic-bezier(0.1, 0.5, 0.25, 1)" },
          { transform: `scaleX(${HOLD_AT})` },
        ],
        { duration: CREEP_MS, fill: "forwards" },
      );
      return;
    }

    const from = new DOMMatrixReadOnly(getComputedStyle(bar).transform).a;
    bar.getAnimations().forEach(animation => animation.cancel());
    bar.style.transform = `scaleX(${from})`;
    bar.animate([{ transform: `scaleX(${from})` }, { transform: "scaleX(1)" }], {
      duration: FILL_MS,
      easing: "ease-out",
      fill: "forwards",
    });
    bar
      .animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: FADE_MS,
        delay: FILL_MS,
        easing: "ease",
        fill: "forwards",
      })
      .finished.then(
        () => {
          if (phaseRef.current === "finishing") go("hidden");
        },
        () => {},
      );
  }, [phase, go]);

  if (phase === "hidden") return null;
  return (
    <div
      ref={barRef}
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-primary pointer-events-none"
    />
  );
};

export default LocaleSwitchProgress;
