"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight } from "react-feather";

import { prefersReducedMotion } from "@/utils/imageFlip";

const SHOW_DELAY = 300;
const HIDE_DELAY = 200;
const EXIT_FALLBACK = 250;
const GAP = 8;
const EDGE = 8;

const KEYCAPS = {
  Escape: "Esc",
  ArrowLeft: <ArrowLeft size={11} strokeWidth={2.75} />,
  ArrowRight: <ArrowRight size={11} strokeWidth={2.75} />,
};

type Phase = "hidden" | "enter" | "exit";

interface TooltipProps {
  label: string;
  shortcut?: keyof typeof KEYCAPS;
  side?: "top" | "bottom";
  align?: "start" | "center" | "end";
  children: React.ReactNode;
}

export default function Tooltip({ label, shortcut, side = "bottom", align = "center", children }: TooltipProps) {
  const [phase, setPhase] = useState<Phase>("hidden");
  const phaseRef = useRef<Phase>("hidden");
  const triggerRef = useRef<HTMLElement | null>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const timer = useRef(0);
  const suppressed = useRef(false);

  const go = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const dismiss = useCallback(() => {
    window.clearTimeout(timer.current);
    if (phaseRef.current !== "hidden") go("hidden");
  }, [go]);

  useEffect(() => dismiss, [dismiss]);

  const show = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger || suppressed.current) return;
    if (trigger.matches(":disabled") || trigger.getAttribute("aria-expanded") === "true") return;
    window.clearTimeout(timer.current);
    if (phaseRef.current === "exit") go("enter");
    else if (phaseRef.current === "hidden") timer.current = window.setTimeout(() => go("enter"), SHOW_DELAY);
  }, [go]);

  const hide = useCallback(
    (pressed: boolean) => {
      window.clearTimeout(timer.current);
      if (phaseRef.current !== "enter") return;
      const leave = () => {
        if (prefersReducedMotion()) {
          dismiss();
          return;
        }
        go("exit");
        timer.current = window.setTimeout(dismiss, EXIT_FALLBACK);
      };
      if (pressed) leave();
      else timer.current = window.setTimeout(leave, HIDE_DELAY);
    },
    [dismiss, go],
  );

  const place = useCallback(() => {
    const trigger = triggerRef.current;
    const tip = tipRef.current;
    if (!trigger || !tip) return;
    const box = trigger.getBoundingClientRect();
    const width = tip.offsetWidth;
    const start =
      align === "start" ? box.left : align === "end" ? box.right - width : box.left + (box.width - width) / 2;
    const left = Math.min(Math.max(EDGE, start), document.documentElement.clientWidth - EDGE - width);
    const top = side === "bottom" ? box.bottom + GAP : box.top - GAP - tip.offsetHeight;
    const snap = (value: number) => Math.round(value * window.devicePixelRatio) / window.devicePixelRatio;
    tip.style.left = `${snap(left)}px`;
    tip.style.top = `${snap(top)}px`;
  }, [align, side]);

  useLayoutEffect(() => {
    const trigger = triggerRef.current;
    const tip = tipRef.current;
    if (phase !== "enter" || !trigger || !tip) return;
    tip.style.fontFamily = getComputedStyle(trigger).fontFamily;
    place();
  }, [phase, place, label]);

  useEffect(() => {
    if (phase === "hidden") return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("scroll", place, { capture: true, passive: true });
    window.addEventListener("resize", dismiss);
    window.addEventListener("blur", dismiss);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", dismiss);
      window.removeEventListener("blur", dismiss);
    };
  }, [phase, place, dismiss]);

  const attach = useCallback(
    (wrapper: HTMLSpanElement | null) => {
      const trigger = wrapper?.firstElementChild;
      if (!wrapper || !(trigger instanceof HTMLElement)) return;
      triggerRef.current = trigger;
      if (shortcut) trigger.setAttribute("aria-keyshortcuts", shortcut);

      const onEnter = (event: PointerEvent) => {
        suppressed.current = false;
        if (event.pointerType !== "touch") show();
      };
      const onLeave = () => {
        suppressed.current = false;
        hide(false);
      };
      const onPress = () => {
        suppressed.current = true;
        hide(true);
      };
      const onFocus = () => {
        if (trigger.matches(":focus-visible")) show();
      };

      wrapper.addEventListener("pointerenter", onEnter);
      wrapper.addEventListener("pointerleave", onLeave);
      wrapper.addEventListener("pointerdown", onPress);
      wrapper.addEventListener("click", onPress);
      wrapper.addEventListener("focusin", onFocus);
      wrapper.addEventListener("focusout", onLeave);
      return () => {
        wrapper.removeEventListener("pointerenter", onEnter);
        wrapper.removeEventListener("pointerleave", onLeave);
        wrapper.removeEventListener("pointerdown", onPress);
        wrapper.removeEventListener("click", onPress);
        wrapper.removeEventListener("focusin", onFocus);
        wrapper.removeEventListener("focusout", onLeave);
        if (shortcut) trigger.removeAttribute("aria-keyshortcuts");
        triggerRef.current = null;
      };
    },
    [shortcut, show, hide],
  );

  return (
    <>
      <span ref={attach} className="contents">
        {children}
      </span>
      {phase !== "hidden" &&
        createPortal(
          <div
            ref={tipRef}
            className="tooltip"
            data-side={side}
            data-state={phase}
            aria-hidden="true"
            onAnimationEnd={() => {
              if (phaseRef.current === "exit") dismiss();
            }}
          >
            {label}
            {shortcut && <kbd>{KEYCAPS[shortcut]}</kbd>}
          </div>,
          document.body,
        )}
    </>
  );
}
