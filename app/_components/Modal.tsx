"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "react-feather";
import { RemoveScroll } from "react-remove-scroll";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import localeFontClass from "@/lib/localeFontClass";
import useFocusScope from "@/utils/useFocusScope";
import useOnClickOutside from "@/utils/useOnClickOutside";

import Tooltip from "./Tooltip";
import { afterViewerClose } from "./project/viewerPresence";

interface ModalProps extends React.PropsWithChildren {
  onClose: () => void;
  labelledBy: string;
  label?: string;
}

const Modal = ({ children, onClose, labelledBy, label }: ModalProps) => {
  const router = useRouter();
  const t = useTranslations("Common");
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(true);

  const close = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);
  const exit = useCallback(() => {
    router.back();
  }, [router]);

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

  const contentRef = useRef<HTMLDivElement | null>(null);
  useOnClickOutside(contentRef, true, dismiss);
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

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("scroll-locked");
    window.__lenis?.stop();
    return () => {
      root.classList.remove("scroll-locked");
      window.__lenis?.start();
    };
  }, []);

  useEffect(() => {
    if (isOpen) return;
    onClose();
    const timer = setTimeout(exit, 200);
    return () => clearTimeout(timer);
  }, [isOpen, exit, onClose]);

  return createPortal(
    <div className={`contents ${localeFontClass(locale)}`} lang={locale}>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              id="modal-overlay"
              className="w-screen h-screen bg-black/30 fixed top-0 left-0 z-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
            />

            <div
              id="modal-container"
              className="
              w-screen h-screen fixed top-0 left-0 z-modal-content
              flex justify-center items-start"
            >
              <RemoveScroll removeScrollBar={false}>
                <motion.div
                  id="modal-transition"
                  initial={{ opacity: 0, translateY: 20, scale: 0.95 }}
                  animate={{ opacity: 1, translateY: 0, scale: 1 }}
                  exit={{ opacity: 0, translateY: 20, scale: 0.9 }}
                  transition={{ duration: 0.1, damping: 0, ease: "easeOut" }}
                >
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
                        className="group absolute top-5 right-5 md:top-7 md:right-7 focus-visible:outline-none"
                      >
                        <X
                          aria-hidden
                          className="block w-6 h-6 md:w-8 md:h-8
                        text-foreground opacity-45 group-hover:opacity-100 group-active:opacity-100
                        transition-opacity duration-200
                      "
                          strokeWidth={1.5}
                        />
                        <span
                          data-tooltip-anchor
                          className="absolute inset-0.5 md:inset-1 rounded-md group-focus-visible:outline-solid"
                        />
                      </button>
                    </Tooltip>
                  </motion.div>
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
