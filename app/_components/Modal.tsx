"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "react-feather";
import { RemoveScroll } from "react-remove-scroll";

import cn from "classnames";
import { AnimatePresence, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";

import localeFontClass from "@/lib/localeFontClass";
import { prefersReducedMotion } from "@/utils/motionPreference";
import { subtleBoxClasses } from "@/utils/pressClasses";
import useFocusScope from "@/utils/useFocusScope";
import useOnClickOutside from "@/utils/useOnClickOutside";
import useTouchPress from "@/utils/useTouchPress";

import Tooltip from "./Tooltip";
import { afterViewerClose, subscribeViewerShown } from "./project/viewerPresence";

const MOTION_CURVE: [number, number, number, number] = [0.15, 1, 0.3, 1];
const MOTION_EASING = `cubic-bezier(${MOTION_CURVE.join(", ")})`;
const FADE_MS = 350;
const SLIDE_MS = 700;
const RELEASE_MS = FADE_MS / 3;

interface ModalProps extends React.PropsWithChildren {
  onRelease: () => void;
  onExited: () => void;
  labelledBy: string;
  label?: string;
}

const Modal = ({ children, onRelease, onExited, labelledBy, label }: ModalProps) => {
  const t = useTranslations("Common");
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(true);
  const [isReleased, setIsReleased] = useState(false);
  const [still] = useState(prefersReducedMotion);

  const close = useCallback(() => setIsOpen(false), []);

  const releasedRef = useRef(false);
  const release = useCallback(() => {
    if (releasedRef.current) return;
    releasedRef.current = true;
    setIsReleased(true);
    onRelease();
  }, [onRelease]);

  const dismiss = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (event.type === "mousedown") event.preventDefault();
      const swallowClick = (click: MouseEvent) => {
        if (click.detail === 0) return;
        click.preventDefault();
        click.stopPropagation();
      };
      window.addEventListener("click", swallowClick, { capture: true, once: true });
      window.addEventListener("pointerdown", () => window.removeEventListener("click", swallowClick, true), {
        capture: true,
        once: true,
      });
      close();
    },
    [close],
  );

  const transitionRef = useRef<HTMLDivElement | null>(null);
  const slideRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [isClosePressed, closePress] = useTouchPress();
  useOnClickOutside(contentRef, isOpen, dismiss);
  useFocusScope(contentRef, isOpen, "#modal-focus");

  const innerRef = useRef<HTMLDivElement | null>(null);
  const [box, setBox] = useState<{ h: number; animate: boolean }>();
  const [scrolls, setScrolls] = useState(true);

  useEffect(() => {
    const outer = contentRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    const shrinkable = getComputedStyle(outer).getPropertyValue("scrollbar-gutter") === "stable";
    let seen = false;
    let last = -1;
    const measure = () => {
      const maxH = window.innerHeight - (window.matchMedia("(min-width: 768px)").matches ? 64 : 28);
      const borderY = outer.offsetHeight - outer.clientHeight;
      const { paddingTop, paddingBottom } = getComputedStyle(outer);
      const fits = inner.offsetHeight + parseFloat(paddingTop) + parseFloat(paddingBottom);
      const h = Math.min((shrinkable && fits < outer.clientHeight ? fits : outer.scrollHeight) + borderY, maxH);
      if (h === last) return;
      last = h;
      setBox({ h, animate: seen });
      if (seen) setScrolls(false);
      seen = true;
    };
    const ro = new ResizeObserver(measure);
    ro.observe(inner);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") afterViewerClose(close);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close]);

  useLayoutEffect(() => {
    if (still) return;
    let entrance: Animation | undefined;
    const frame = requestAnimationFrame(() => {
      entrance = slideRef.current?.animate(
        [
          { opacity: 0, transform: "translate3d(0, calc(5% + 4px), 0)", easing: MOTION_EASING },
          { opacity: 1, offset: FADE_MS / SLIDE_MS, easing: MOTION_EASING },
          { opacity: 1, transform: "none" },
        ],
        SLIDE_MS,
      );
    });
    return () => {
      cancelAnimationFrame(frame);
      entrance?.cancel();
    };
  }, [still]);

  useEffect(
    () =>
      subscribeViewerShown(() => {
        for (const element of [transitionRef.current, slideRef.current]) {
          element?.getAnimations().forEach(animation => animation.finish());
        }
      }),
    [],
  );

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("scroll-locked");
    window.__lenis?.stop();
    return () => {
      root.classList.remove("scroll-locked");
      window.__lenis?.start();
    };
  }, []);

  useLayoutEffect(() => {
    const slide = slideRef.current;
    if (isOpen || still || !slide) return;
    const lift = slide.animate([{ transform: "translate3d(0, calc(-5% - 4px), 0)" }], {
      duration: SLIDE_MS,
      easing: MOTION_EASING,
      fill: "forwards",
    });
    return () => lift.cancel();
  }, [isOpen, still]);

  useEffect(() => {
    if (isOpen) return;
    const timer = setTimeout(release, still ? 0 : RELEASE_MS);
    return () => clearTimeout(timer);
  }, [isOpen, still, release]);

  const fade = {
    initial: still ? false : { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: still ? { duration: 0 } : { duration: FADE_MS / 1000, ease: MOTION_CURVE },
  };

  return createPortal(
    <div className={cn("contents", localeFontClass(locale), isReleased && "pointer-events-none")} lang={locale}>
      <AnimatePresence
        onExitComplete={() => {
          release();
          onExited();
        }}
      >
        {isOpen && (
          <>
            <motion.div
              id="modal-overlay"
              className="w-screen h-screen bg-[#000]/[25.5%] dark:bg-[#000]/[27.7%] backdrop-blur-[3px] fixed top-0 left-0 z-modal-overlay"
              {...fade}
            />

            <div
              id="modal-container"
              className="
              w-screen h-screen fixed top-0 left-0 z-modal-content
              flex justify-center items-start"
            >
              <RemoveScroll removeScrollBar={false}>
                <motion.div id="modal-transition" ref={transitionRef} {...fade}>
                  <div ref={slideRef}>
                    <motion.div
                      id="modal-content"
                      ref={contentRef}
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby={labelledBy}
                      aria-label={label}
                      data-lenis-prevent
                      className="
                      w-[calc(100vw-1.75rem)] md:w-[calc(100vw-4rem)] md:max-w-4xl max-h-[calc(100vh-1.75rem)] md:max-h-[calc(100vh-4rem)] my-3.5 md:my-8 p-6 md:p-8
                      overscroll-contain
                      bg-background border border-foreground/15 rounded-md md:rounded-lg
                      relative
                      "
                      style={{ overflowY: scrolls ? "auto" : "hidden" }}
                      animate={box ? { height: box.h } : undefined}
                      transition={box?.animate ? { duration: 0.25, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
                      onAnimationComplete={() => setScrolls(true)}
                    >
                      <div id="modal-focus" tabIndex={-1} className="absolute outline-none pointer-events-none" />
                      <div ref={innerRef}>{children}</div>
                      <Tooltip label={t("close")} shortcut="Escape">
                        <button
                          type="button"
                          onClick={close}
                          aria-label={t("close")}
                          {...closePress}
                          className={cn(
                            "absolute top-5 right-5 md:top-7 md:right-7",
                            "before:-inset-[0.75px] md:before:inset-px before:rounded-md before:transition-colors",
                            subtleBoxClasses(isClosePressed),
                          )}
                        >
                          <X
                            aria-hidden
                            className="block w-6 h-6 md:w-8 md:h-8 text-foreground opacity-45"
                            strokeWidth={1.5}
                          />
                        </button>
                      </Tooltip>
                    </motion.div>
                  </div>
                </motion.div>
              </RemoveScroll>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>,
    document.getElementById("modal-root")!,
  );
};
export default Modal;
