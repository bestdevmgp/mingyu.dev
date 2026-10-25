"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight } from "react-feather";

import { prefersReducedMotion } from "@/utils/motionPreference";

const SHOW_DELAY = 300;
const HIDE_DELAY = 200;
const EXIT_FALLBACK = 175;
const GAP = 8;
const EDGE = 8;

const KEYCAPS = {
  Escape: "Esc",
  ArrowLeft: <ArrowLeft size={11} strokeWidth={2.75} />,
  ArrowRight: <ArrowRight size={11} strokeWidth={2.75} />,
};

type Phase = "hidden" | "enter" | "exit";

const unavailable = (trigger: HTMLElement) =>
  trigger.matches('[aria-disabled="true"]') || trigger.getAttribute("aria-expanded") === "true";

let handOff: (() => void) | null = null;
let visible: (() => void) | null = null;

interface TooltipProps {
  label: string;
  shortcut?: keyof typeof KEYCAPS;
  side?: "top" | "bottom";
  children: React.ReactNode;
}

export default function Tooltip({ label, shortcut, side = "bottom", children }: TooltipProps) {
  const [phase, setPhase] = useState<Phase>("hidden");
  const [exitLabel, setExitLabel] = useState(label);
  if (phase !== "exit" && exitLabel !== label) setExitLabel(label);
  const phaseRef = useRef<Phase>("hidden");
  const triggerRef = useRef<HTMLElement | null>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const timer = useRef(0);
  const suppressed = useRef(false);
  const ownHandOff = useRef<(() => void) | null>(null);
  const ownDismiss = useRef<(() => void) | null>(null);

  const go = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
    const own = ownDismiss.current;
    if (next === "enter") {
      if (visible && visible !== own) visible();
      visible = own;
    } else if (next === "hidden" && visible === own) visible = null;
  }, []);

  const release = useCallback(() => {
    if (handOff && handOff === ownHandOff.current) handOff = null;
    ownHandOff.current = null;
  }, []);

  const dismiss = useCallback(() => {
    window.clearTimeout(timer.current);
    release();
    if (phaseRef.current !== "hidden") go("hidden");
  }, [go, release]);

  useEffect(() => {
    ownDismiss.current = dismiss;
    return dismiss;
  }, [dismiss]);

  const show = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger || suppressed.current || unavailable(trigger)) return;
    window.clearTimeout(timer.current);
    release();
    if (phaseRef.current === "hidden" && !handOff) {
      timer.current = window.setTimeout(() => {
        if (!unavailable(trigger)) go("enter");
      }, SHOW_DELAY);
      return;
    }
    if (phaseRef.current !== "enter") go("enter");
  }, [go, release]);

  const hide = useCallback(
    (pressed: boolean) => {
      window.clearTimeout(timer.current);
      if (phaseRef.current !== "enter") return;
      const leave = () => {
        window.clearTimeout(timer.current);
        if (phaseRef.current !== "enter") return;
        if (prefersReducedMotion()) {
          dismiss();
          return;
        }
        go("exit");
        timer.current = window.setTimeout(dismiss, EXIT_FALLBACK);
      };
      if (pressed) {
        release();
        leave();
        return;
      }
      timer.current = window.setTimeout(leave, HIDE_DELAY);
      ownHandOff.current = dismiss;
      handOff = dismiss;
    },
    [dismiss, go, release],
  );

  const place = useCallback(() => {
    const trigger = triggerRef.current;
    const tip = tipRef.current;
    if (!trigger || !tip) return;
    const box = (trigger.querySelector("[data-tooltip-anchor]") ?? trigger).getBoundingClientRect();
    const { width, height } = tip.getBoundingClientRect();
    const start = box.left + (box.width - width) / 2;
    const left = Math.min(Math.max(EDGE, start), document.documentElement.clientWidth - EDGE - width);
    const top = side === "bottom" ? box.bottom + GAP : box.top - GAP - height;
    const snap = (value: number) => Math.round(value * window.devicePixelRatio) / window.devicePixelRatio;
    tip.style.left = `${snap(left)}px`;
    tip.style.top = `${snap(top)}px`;
  }, [side]);

  useLayoutEffect(() => {
    const trigger = triggerRef.current;
    const tip = tipRef.current;
    if (phase !== "enter" || !trigger || !tip) return;
    tip.style.fontFamily = getComputedStyle(trigger).fontFamily;
    place();
  }, [phase, place, label]);

  useEffect(() => {
    const trigger = triggerRef.current;
    if (phase !== "enter" || !trigger) return;
    const observer = new MutationObserver(() => {
      if (trigger.matches('[aria-disabled="true"]')) hide(true);
    });
    observer.observe(trigger, { attributes: true, attributeFilter: ["aria-disabled"] });
    return () => observer.disconnect();
  }, [phase, hide]);

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
            onAnimationEnd={event => {
              if (event.animationName === "tooltip-out" && phaseRef.current === "exit") dismiss();
            }}
          >
            {phase === "exit" ? exitLabel : label}
            {shortcut && <kbd>{KEYCAPS[shortcut]}</kbd>}
          </div>,
          document.body,
        )}
    </>
  );
}
