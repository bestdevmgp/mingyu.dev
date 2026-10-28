"use client";

import {
  type ComponentProps,
  type Ref,
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";

import cn from "classnames";
import { motion, AnimatePresence, animate, type Variants } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import afterPageLoad from "@/utils/afterPageLoad";
import { flipFrom, flipTo, getCenteredBox, getFlipTransform, getVisibleImageBox } from "@/utils/imageFlip";
import { isCoarsePointer, prefersReducedMotion } from "@/utils/motionPreference";
import { SCROLL_KEYS } from "@/utils/scrollKeys";
import useFocusScope from "@/utils/useFocusScope";
import useTouchPress, { TAP_SLOP } from "@/utils/useTouchPress";

import ImageSpinner from "./ImageSpinner";
import { markViewerShown, settleViewerClose } from "./viewerPresence";
import Tooltip from "../Tooltip";

interface ImageModalProps {
  images: string[];
  title: string;
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  getThumbnail: (index: number) => HTMLImageElement | null;
  imageSizes: Record<string, [number, number]>;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 5;
const MAX_PERCENT = 999;
const ZOOM_STEP = 1.5;
const DOUBLE_TAP_ZOOM = 2;
const DOUBLE_TAP_MS = 300;
const DOUBLE_TAP_SLOP = 30;
const CHROME_IDLE = 2000;
const WHEEL_SENSITIVITY = 0.0015;
const PINCH_WHEEL_SENSITIVITY = 0.01;
const PINCH_WHEEL_MAX_STEP = 0.15;
const PINCH_DEADZONE = 2;
const FIT_RATIO = 0.7;
const TALL_FIT_RATIO = 0.92;
const PRELOAD_REACH = 2;
const PRELOAD_FALLBACK_DELAY = 200;
const SLIDE_GAP = 20;
const SLIDE_SPRING = { stiffness: 225, damping: 30 };
const EDGE_STRETCH = 60;
const EDGE_LEAN = 28;
const EDGE_LEAN_OUT = 0.15;
const EDGE_LEAN_BACK = 0.375;
const FLICK_SPEED = 0.35;
const FLICK_WINDOW = 100;
const WHEEL_GESTURE_GAP = 120;
const WHEEL_SWIPE_COMMIT = 100;
const WHEEL_EDGE_PUSH = 20;
const WHEEL_MIN_INTERVAL = 8;
const WHEEL_SETTLED_RATIO = 0.15;
const WHEEL_SETTLED_SPEED = 0.12;
const WHEEL_RENEW_RISES = 3;
const WHEEL_MOMENTUM_RATIO = 0.8;
const WHEEL_MOMENTUM_FADE = 300;
const WHEEL_MOMENTUM_LOCK = 200;
const WHEEL_MOMENTUM_PUSH = 2;
const WHEEL_STREAM_GAP = 25;
const WHEEL_SPRING = 0.035;
const FLIP_CURVE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];
const FLIP_EASING = `cubic-bezier(${FLIP_CURVE.join(", ")})`;
const PHOTO_FADE = 0.09;
const POINTER_TIMING = { open: 240, close: 240 };
const TOUCH_TIMING = { open: 320, close: 320 };

interface Swipe {
  mode: "pending" | "swipe" | "pan" | "none";
  base: number;
  zoomed: boolean;
  samples: { time: number; x: number }[];
}

interface WheelGesture {
  axis: "x" | "y";
  mode: "pan" | "swipe" | "done";
  origin: number;
  offset: number;
  time: number;
  direction: number;
  speed: number;
  peak: number;
  settled: boolean;
  rises: number;
  delta: number;
  floor: number;
  decaySince: number | null;
}

type MotionSource = "button" | "wheel" | null;

interface ZoomView {
  x: number;
  y: number;
  zoom: number;
}

const zoomTransform = ({ x, y, zoom }: ZoomView) => `translate(${x}px, ${y}px) scale(${zoom})`;

const momentumWeight = (elapsed: number) => {
  const progress = Math.min(1, elapsed / WHEEL_MOMENTUM_FADE);
  return (1 - progress) * (1 - progress) * (1 + progress);
};

const rubberBand = (offset: number, size: number) =>
  Math.sign(offset) * size * (1 - 1 / ((Math.abs(offset) * 0.55) / size + 1));

interface EdgeMask {
  alpha: number;
  fade?: { stop: () => void };
}

interface ShownArea {
  top: number;
  bottom: number;
}

const shownArea = (pane: HTMLElement): ShownArea => {
  const paneTop = pane.getBoundingClientRect().top;
  const popup = pane.closest<HTMLElement>("#modal-content");
  if (popup) {
    const top = popup.getBoundingClientRect().top + popup.clientTop - paneTop;
    return { top, bottom: top + popup.clientHeight };
  }
  const header = document.querySelector("header");
  return { top: (header?.getBoundingClientRect().bottom ?? paneTop) - paneTop, bottom: pane.clientHeight };
};

const paintEdgeMask = (pane: HTMLElement, area: ShownArea, alpha: number) => {
  const hidden = `rgb(0 0 0 / ${alpha})`;
  pane.style.maskImage =
    alpha < 1
      ? `linear-gradient(${hidden} ${area.top}px, #000 ${area.top}px, #000 ${area.bottom}px, ${hidden} ${area.bottom}px)`
      : "";
};

const fadeEdgeMask = (mask: EdgeMask, pane: HTMLElement, area: ShownArea, to: number, delay = 0) => {
  mask.fade?.stop();
  paintEdgeMask(pane, area, mask.alpha);
  mask.fade = animate(mask.alpha, to, {
    delay,
    duration: PHOTO_FADE,
    ease: "easeOut",
    onUpdate: alpha => {
      mask.alpha = alpha;
      paintEdgeMask(pane, area, alpha);
    },
  });
};

const loadedSrc = (image: HTMLImageElement | null) =>
  image?.complete && image.naturalWidth > 0 ? image.currentSrc : null;

const fitBox = (ratio: number, pane: { width: number; height: number }, fill: boolean) => {
  const widthRatio = fill ? 1 : pane.height > pane.width ? TALL_FIT_RATIO : FIT_RATIO;
  const heightRatio = fill ? 1 : FIT_RATIO;
  const width = Math.min(pane.width * widthRatio, pane.height * ratio * heightRatio);
  return { width, height: width / ratio };
};

type PressHandlers = ReturnType<typeof useTouchPress>[1];

interface RoundButtonProps {
  label: string;
  shortcut: NonNullable<ComponentProps<typeof Tooltip>["shortcut"]>;
  icon: string;
  className?: string;
  padding: string;
  pressed: boolean;
  press: PressHandlers;
  onPress: () => void;
  disabled?: boolean;
  buttonRef?: Ref<HTMLButtonElement>;
}

const RoundButton = ({
  label,
  shortcut,
  icon,
  className,
  padding,
  pressed,
  press,
  onPress,
  disabled,
  buttonRef,
}: RoundButtonProps) => (
  <Tooltip label={label} shortcut={shortcut}>
    <button
      ref={buttonRef}
      onClick={() => {
        if (!disabled) onPress();
      }}
      aria-disabled={disabled || undefined}
      {...press}
      className={cn("group", className, "text-white rounded-full")}
      aria-label={label}
    >
      <span
        className={cn(
          "block rounded-full",
          padding,
          "transition-[opacity,background-color] duration-200",
          pressed
            ? "bg-[#0f0f0f]/70 opacity-100"
            : "bg-black/50 opacity-55 group-hover:bg-[#0f0f0f]/70 group-hover:opacity-100",
        )}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        </svg>
      </span>
    </button>
  </Tooltip>
);

interface PillButtonProps {
  label: string;
  ariaLabel?: string;
  pressed: boolean;
  press: PressHandlers;
  onPress: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

const PillButton = ({ label, ariaLabel, pressed, press, onPress, disabled, className, children }: PillButtonProps) => (
  <Tooltip label={label} side="top">
    <button
      onClick={() => {
        if (!disabled) onPress();
      }}
      aria-disabled={disabled || undefined}
      {...press}
      className={cn(
        "p-[11px] rounded-full transition-colors duration-200",
        className,
        disabled
          ? "text-white/25 cursor-not-allowed"
          : pressed
            ? "text-white bg-[#000]/40"
            : "text-white/55 hover:text-white hover:bg-[#000]/40",
      )}
      aria-label={ariaLabel ?? label}
    >
      {children}
    </button>
  </Tooltip>
);

const ZoomIcon = ({ path }: { path: string }) => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
  </svg>
);

export default function ImageModal({
  images,
  title,
  initialIndex,
  isOpen,
  onClose,
  getThumbnail,
  imageSizes,
}: ImageModalProps) {
  const t = useTranslations("ImageViewer");
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [openedIndex, setOpenedIndex] = useState<number | null>(null);
  if (isOpen && openedIndex !== initialIndex) {
    setOpenedIndex(initialIndex);
    setCurrentIndex(initialIndex);
  } else if (!isOpen && openedIndex !== null) setOpenedIndex(null);
  const [zoom, setZoom] = useState(1);
  const [motionSource, setMotionSource] = useState<MotionSource>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isPinching, setIsPinching] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const [aspect, setAspect] = useState<number | null>(null);
  const [loaded, setLoaded] = useState<ReadonlySet<number>>(() => new Set());
  const [failed, setFailed] = useState<ReadonlySet<number>>(() => new Set());
  const [standIns, setStandIns] = useState<ReadonlyMap<number, string>>(() => new Map());
  const [fitted, setFitted] = useState<{ width: number; height: number } | null>(null);
  const [paneSize, setPaneSize] = useState<{ width: number; height: number } | null>(null);
  const [coarsePointer, setCoarsePointer] = useState(false);
  const [preloadReach, setPreloadReach] = useState(0);
  const [closeFlies, setCloseFlies] = useState(false);
  const [heading, setHeading] = useState<number | null>(null);
  const [chromeHidden, setChromeHidden] = useState(false);
  const [closePressed, closePress] = useTouchPress();
  const [prevPressed, prevPress] = useTouchPress();
  const [nextPressed, nextPress] = useTouchPress();
  const [zoomOutPressed, zoomOutPress] = useTouchPress();
  const [resetPressed, resetPress] = useTouchPress();
  const [zoomInPressed, zoomInPress] = useTouchPress();
  const timing = coarsePointer ? TOUCH_TIMING : POINTER_TIMING;

  const overlayRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const imageContentRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const mouseDownPosRef = useRef({ x: 0, y: 0 });
  const dragStartRef = useRef({ x: 0, y: 0 });
  const pinchStartRef = useRef({ distance: 0, zoom: 1, midpoint: { x: 0, y: 0 }, position: { x: 0, y: 0 } });
  const lastTouchTimeRef = useRef(0);
  const touchStartPosRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);
  const multiTouchRef = useRef(false);
  const pinchDistanceRef = useRef(0);
  const pinchDirectionRef = useRef(0);
  const isClosingRef = useRef(false);
  const trackOffsetRef = useRef(0);
  const pendingOffsetRef = useRef(0);
  const indexRef = useRef(initialIndex);
  const slideRef = useRef<{ target: number; velocity: number; stop: () => void } | null>(null);
  const swipeRef = useRef<Swipe | null>(null);
  const wheelGestureRef = useRef<WheelGesture | null>(null);
  const wheelTimerRef = useRef(0);
  const targetViewRef = useRef<ZoomView>({ x: 0, y: 0, zoom: 1 });
  const followRef = useRef<{ shown: ZoomView; velocity: ZoomView; time: number; frame: number } | null>(null);
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);
  const tapTimerRef = useRef(0);
  const chromeTimerRef = useRef(0);
  const hoveredRef = useRef<Element | null>(null);
  const edgeMaskRef = useRef<EdgeMask>({ alpha: 1 });
  const sessionRef = useRef(0);
  const previousRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const focusAfterStepRef = useRef<RefObject<HTMLButtonElement | null> | null>(null);
  useFocusScope(overlayRef, isOpen);

  const restartIdle = useCallback(() => {
    window.clearTimeout(chromeTimerRef.current);
    chromeTimerRef.current = window.setTimeout(() => {
      if (hoveredRef.current?.closest("button") || document.activeElement?.matches("button:focus-visible")) return;
      setChromeHidden(true);
    }, CHROME_IDLE);
  }, []);

  const wakeChrome = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    hoveredRef.current = e.target as Element;
    setChromeHidden(false);
    restartIdle();
  };

  useEffect(() => {
    const active = document.activeElement;
    const hidesFocus = active instanceof HTMLButtonElement && overlayRef.current?.contains(active);
    if (chromeHidden && hidesFocus && !active.matches(":focus-visible")) active.blur();
  }, [chromeHidden]);

  const measureVisualBox = useCallback(() => {
    const wrapper = flipRef.current;
    const content = imageContentRef.current;
    if (!wrapper || !content) return null;

    const inFlight = getComputedStyle(wrapper).transform;
    const transition = wrapper.style.transition;

    wrapper.style.transition = "none";
    wrapper.style.transform = "none";
    const rect = content.getBoundingClientRect();
    const frame = wrapper.getBoundingClientRect();
    wrapper.style.transform = inFlight === "none" ? "" : inFlight;
    void wrapper.offsetWidth;
    wrapper.style.transition = transition;

    return {
      box: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      pivot: { x: frame.left + frame.width / 2, y: frame.top + frame.height / 2 },
    };
  }, []);

  const fitToPane = useCallback(
    (ratio: number) => {
      const pane = imageRef.current;
      return pane ? fitBox(ratio, { width: pane.offsetWidth, height: pane.offsetHeight }, coarsePointer) : null;
    },
    [coarsePointer],
  );

  const knownRatio = useCallback(
    (index: number) => {
      const size = imageSizes[images[index]];
      return size ? size[0] / size[1] : null;
    },
    [images, imageSizes],
  );

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setMotionSource(null);
  }, []);

  const stopFollow = useCallback(() => {
    const follow = followRef.current;
    if (!follow) return;
    cancelAnimationFrame(follow.frame);
    followRef.current = null;
    const content = imageContentRef.current;
    if (content) content.style.transform = zoomTransform(targetViewRef.current);
  }, []);

  const followWheel = useCallback((target: ZoomView) => {
    targetViewRef.current = target;
    const content = imageContentRef.current;
    if (followRef.current || !content || prefersReducedMotion()) return;

    const step = (now: number) => {
      const follow = followRef.current;
      const element = imageContentRef.current;
      if (!follow || !element) return;
      const goal = targetViewRef.current;
      const elapsed = Math.max(0, now - follow.time);
      const decay = Math.exp(-WHEEL_SPRING * elapsed);
      const shown = { ...follow.shown };
      const velocity = { ...follow.velocity };
      for (const key of ["x", "y", "zoom"] as const) {
        const offset = follow.shown[key] - goal[key];
        const pull = follow.velocity[key] + WHEEL_SPRING * offset;
        shown[key] = goal[key] + (offset + pull * elapsed) * decay;
        velocity[key] = (follow.velocity[key] - WHEEL_SPRING * pull * elapsed) * decay;
      }
      const settled =
        Math.abs(goal.zoom - shown.zoom) < 1e-4 &&
        Math.abs(velocity.zoom) < 1e-5 &&
        Math.abs(goal.x - shown.x) < 0.1 &&
        Math.abs(velocity.x) < 0.01 &&
        Math.abs(goal.y - shown.y) < 0.1 &&
        Math.abs(velocity.y) < 0.01;
      element.style.transform = zoomTransform(settled ? goal : shown);
      followRef.current = settled ? null : { shown, velocity, time: now, frame: requestAnimationFrame(step) };
    };

    const { a, e, f } = new DOMMatrixReadOnly(getComputedStyle(content).transform);
    followRef.current = {
      shown: { x: e, y: f, zoom: a },
      velocity: { x: 0, y: 0, zoom: 0 },
      time: performance.now(),
      frame: requestAnimationFrame(step),
    };
  }, []);

  useLayoutEffect(() => {
    targetViewRef.current = { x: position.x, y: position.y, zoom };
    if (motionSource !== "wheel") stopFollow();
  }, [position, zoom, motionSource, stopFollow]);

  const showImage = useCallback(
    (index: number) => {
      setCurrentIndex(index);
      setPreloadReach(0);
      setHeading(null);
      resetZoom();
      const ratio = knownRatio(index);
      if (!ratio) return;
      setAspect(ratio);
      setFitted(fitToPane(ratio));
    },
    [knownRatio, fitToPane, resetZoom],
  );

  const setTrack = useCallback((offset: number) => {
    trackOffsetRef.current = offset;
    const track = trackRef.current;
    if (track) track.style.transform = offset ? `translate3d(${offset}px, 0, 0)` : "";
  }, []);

  const stopSlide = useCallback(() => {
    const slide = slideRef.current;
    slideRef.current = null;
    slide?.stop();
    return slide;
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (index === images.length - 1 && document.activeElement === nextRef.current)
        focusAfterStepRef.current = previousRef;
      if (index === 0 && document.activeElement === previousRef.current) focusAfterStepRef.current = nextRef;
      showImage(index);
    },
    [images.length, showImage],
  );

  useLayoutEffect(() => {
    focusAfterStepRef.current?.current?.focus();
    focusAfterStepRef.current = null;
  }, [currentIndex]);

  useLayoutEffect(() => {
    indexRef.current = currentIndex;
    setTrack(pendingOffsetRef.current);
    pendingOffsetRef.current = 0;
  }, [currentIndex, setTrack]);

  const paneWidth = useCallback(() => imageRef.current?.offsetWidth ?? 0, []);

  const takeOverSlide = useCallback(() => {
    const slide = stopSlide();
    const index = indexRef.current;
    if (!slide) return { swapped: false, velocity: 0 };
    if (slide.target !== index) {
      pendingOffsetRef.current = trackOffsetRef.current + (slide.target - index) * (paneWidth() + SLIDE_GAP);
      flushSync(() => goTo(slide.target));
    }
    return { swapped: slide.target !== index, velocity: slide.velocity };
  }, [goTo, paneWidth, stopSlide]);

  const requestClose = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    takeOverSlide();
    window.clearTimeout(wheelTimerRef.current);
    window.clearTimeout(tapTimerRef.current);
    window.clearTimeout(chromeTimerRef.current);

    const pane = imageRef.current;
    const offset = trackOffsetRef.current;
    if (offset) setTrack(0);
    const wrapper = flipRef.current;
    const thumbnail = getThumbnail(indexRef.current);
    const origin = thumbnail ? getVisibleImageBox(thumbnail) : null;
    const target = measureVisualBox();
    if (offset) setTrack(offset);
    const transform = origin && target ? getFlipTransform(origin, target.box, target.pivot) : null;
    const flies = wrapper !== null && transform !== null && !prefersReducedMotion();

    if (flies) {
      flipTo(wrapper, transform, timing.close, FLIP_EASING);
      if (pane) fadeEdgeMask(edgeMaskRef.current, pane, shownArea(pane), 0);
    }
    if (offset) animate(offset, 0, { duration: timing.close / 1000, ease: FLIP_CURVE, onUpdate: setTrack });

    setIsDragging(false);
    setIsPinching(false);
    setIsTouching(false);
    setChromeHidden(false);
    setCloseFlies(flies);
    onClose();
  }, [getThumbnail, measureVisualBox, setTrack, takeOverSlide, timing.close, onClose]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (isCoarsePointer()) setCoarsePointer(true);
  }, []);

  useEffect(() => settleViewerClose, []);

  useLayoutEffect(() => {
    if (!isOpen) return;
    markViewerShown();
    isClosingRef.current = false;
    sessionRef.current += 1;
    swipeRef.current = null;
    wheelGestureRef.current = null;
    lastTapRef.current = null;
    hoveredRef.current = null;
    window.clearTimeout(tapTimerRef.current);
    window.clearTimeout(chromeTimerRef.current);
    edgeMaskRef.current.fade?.stop();
    edgeMaskRef.current.alpha = 1;
    setTrack(0);
    setLoaded(new Set());
    setFailed(new Set());
    setPreloadReach(0);
    setHeading(null);
    setChromeHidden(false);
    if (!isCoarsePointer()) restartIdle();
    resetZoom();

    const pane = imageRef.current;
    if (pane) setPaneSize({ width: pane.offsetWidth, height: pane.offsetHeight });

    const thumbnail = getThumbnail(initialIndex);
    const standIn = loadedSrc(thumbnail);
    setStandIns(standIn ? new Map([[initialIndex, standIn]]) : new Map());

    const ratio = knownRatio(initialIndex) ?? (thumbnail ? thumbnail.naturalWidth / thumbnail.naturalHeight : NaN);
    if (!Number.isFinite(ratio) || ratio <= 0) return;

    const size = fitToPane(ratio);
    setAspect(ratio);
    setFitted(size);

    const wrapper = flipRef.current;
    const content = imageContentRef.current;
    const origin = thumbnail ? getVisibleImageBox(thumbnail) : null;
    if (!pane || !wrapper || !content || !size || !origin || prefersReducedMotion()) return;

    content.style.width = `${size.width}px`;
    content.style.height = `${size.height}px`;

    const transform = getFlipTransform(origin, getCenteredBox(pane, size));
    if (!transform) return;
    flipFrom(wrapper, transform, timing.open, FLIP_EASING);

    edgeMaskRef.current.alpha = 0;
    fadeEdgeMask(edgeMaskRef.current, pane, shownArea(pane), 1, timing.open / 1000 - PHOTO_FADE);
  }, [isOpen, initialIndex, getThumbnail, knownRatio, fitToPane, resetZoom, restartIdle, setTrack, timing.open]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!isOpen) return;

    const preventScroll = (e: TouchEvent) => e.preventDefault();

    document.addEventListener("touchmove", preventScroll, { passive: false });
    return () => document.removeEventListener("touchmove", preventScroll);
  }, [isOpen]);

  useEffect(() => {
    const pane = imageRef.current;
    if (!isOpen || !pane) return;

    const fit = () => {
      const width = pane.offsetWidth;
      const height = pane.offsetHeight;
      setPaneSize(previous => (previous?.width === width && previous.height === height ? previous : { width, height }));
      if (aspect) setFitted(fitToPane(aspect));
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(pane);
    return () => observer.disconnect();
  }, [isOpen, aspect, fitToPane]);

  useEffect(() => {
    if (!isOpen || preloadReach >= PRELOAD_REACH) return;
    for (let index = currentIndex - preloadReach; index <= currentIndex + preloadReach; index++)
      if (index >= 0 && index < images.length && !loaded.has(index)) return;

    return afterPageLoad(() => setPreloadReach(reach => reach + 1), PRELOAD_FALLBACK_DELAY);
  }, [isOpen, currentIndex, images.length, loaded, preloadReach]);

  const constrainPosition = (newX: number, newY: number, currentZoom: number) => {
    const content = imageContentRef.current;
    if (!content) return { x: newX, y: newY };

    const maxX = Math.max(0, ((currentZoom - 1) * content.offsetWidth) / 2);
    const maxY = Math.max(0, ((currentZoom - 1) * content.offsetHeight) / 2);

    return {
      x: Math.max(-maxX, Math.min(maxX, newX)),
      y: Math.max(-maxY, Math.min(maxY, newY)),
    };
  };

  const naturalWidth = imageSizes[images[currentIndex]]?.[0];
  const fitScale = fitted && naturalWidth ? fitted.width / naturalWidth : 1;
  const naturalZoom = 1 / fitScale;
  const minZoom = Math.min(MIN_ZOOM, naturalZoom);
  const maxZoom = Math.max(Math.min(MAX_ZOOM, MAX_PERCENT / 100 / fitScale), naturalZoom);

  const paneOffset = (clientX: number, clientY: number) => {
    const rect = imageRef.current?.getBoundingClientRect();
    return rect ? { x: clientX - rect.left - rect.width / 2, y: clientY - rect.top - rect.height / 2 } : { x: 0, y: 0 };
  };

  const zoomBy = (factor: number, anchor = { x: 0, y: 0 }, source: MotionSource = null) => {
    const clamped = Math.max(minZoom, Math.min(maxZoom, zoom * factor));
    if (clamped === zoom) return;

    const ratio = clamped / zoom;
    const next = constrainPosition(
      position.x * ratio - anchor.x * (ratio - 1),
      position.y * ratio - anchor.y * (ratio - 1),
      clamped,
    );
    setMotionSource(source);
    setZoom(clamped);
    setPosition(next);
    if (source === "wheel") followWheel({ ...next, zoom: clamped });
  };

  const handleZoomIn = () => zoomBy(ZOOM_STEP, undefined, "button");
  const handleZoomOut = () => zoomBy(1 / ZOOM_STEP, undefined, "button");
  const toggleNaturalZoom = () => {
    if (zoom !== 1) {
      resetZoom();
      setMotionSource("button");
      return;
    }

    zoomBy(naturalZoom, undefined, "button");
  };

  const markLoaded = (index: number) =>
    setLoaded(previous => (previous.has(index) ? previous : new Set(previous).add(index)));

  const markFailed = (index: number) => {
    markLoaded(index);
    setFailed(previous => (previous.has(index) ? previous : new Set(previous).add(index)));
    const thumbnail = getThumbnail(index);
    if (!thumbnail) return;
    const session = sessionRef.current;
    const adoptThumbnail = () => {
      const src = loadedSrc(thumbnail);
      if (session !== sessionRef.current || !src) return;
      setStandIns(previous => (previous.has(index) ? previous : new Map(previous).set(index, src)));
    };
    if (thumbnail.complete) adoptThumbnail();
    else thumbnail.addEventListener("load", adoptThumbnail, { once: true });
  };

  const resist = (offset: number) => {
    const blocked = offset > 0 ? currentIndex === 0 : currentIndex === images.length - 1;
    return blocked ? rubberBand(offset, EDGE_STRETCH) : offset;
  };

  const holdEdge = (offset: number, origin: number) => {
    const held = currentIndex === images.length - 1 ? Math.max(offset, Math.min(origin, 0)) : offset;
    return currentIndex === 0 ? Math.min(held, Math.max(origin, 0)) : held;
  };

  const settleSlide = (target: number, velocity = 0, lean = 0) => {
    stopSlide();
    const index = indexRef.current;
    const land = () => (target === index ? setTrack(0) : goTo(target));

    const from = trackOffsetRef.current;
    const to = (index - target) * (paneWidth() + SLIDE_GAP);
    const leaning = lean !== 0 && from * lean >= 0 && Math.abs(from) < Math.abs(lean);
    if ((from === to && !velocity && !leaning) || prefersReducedMotion()) return land();

    const outward = target === index ? Math.sign(from || velocity) : 0;
    const blocked = outward > 0 ? index === 0 : outward < 0 && index === images.length - 1;
    const direction = Math.sign(to - from);
    const limit = Math.abs(to - from) * Math.sqrt(SLIDE_SPRING.stiffness);
    const toward = direction * velocity > limit ? direction * limit : velocity;
    const start = blocked && outward * velocity > 0 ? 0 : toward;
    setHeading(target === index ? null : target);
    let controls: { stop: () => void } | null = null;
    let sample = { time: performance.now(), value: from };
    const slide = { target, velocity: start, stop: () => controls?.stop() };
    slideRef.current = slide;
    const onUpdate = (value: number) => {
      const time = performance.now();
      if (time > sample.time) slide.velocity = ((value - sample.value) / (time - sample.time)) * 1000;
      sample = { time, value };
      setTrack(value);
    };
    const onComplete = () => {
      if (slideRef.current !== slide) return;
      slideRef.current = null;
      land();
    };
    controls = leaning
      ? animate(from, [from, lean, to], {
          duration: EDGE_LEAN_OUT + EDGE_LEAN_BACK,
          times: [0, EDGE_LEAN_OUT / (EDGE_LEAN_OUT + EDGE_LEAN_BACK), 1],
          ease: [
            [0.33, 0.33, 0.8, 1],
            [0.15, 0, 0.2, 1],
          ],
          onUpdate,
          onComplete,
        })
      : animate(from, to, { type: "spring", ...SLIDE_SPRING, velocity: start, onUpdate, onComplete });
  };

  const slideBy = (direction: number) => {
    const { velocity } = takeOverSlide();
    const index = indexRef.current;
    const target = index + direction;
    if (target >= 0 && target < images.length) settleSlide(target, velocity);
    else settleSlide(index, velocity, -direction * EDGE_LEAN);
  };

  const slideByRef = useRef(slideBy);
  useEffect(() => {
    slideByRef.current = slideBy;
  });

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        e.stopPropagation();

        if (e.key === "Escape") requestClose();
        else slideByRef.current(e.key === "ArrowLeft" ? -1 : 1);
        return;
      }

      if (e.key === "Tab") {
        flushSync(() => setChromeHidden(false));
        if (!isCoarsePointer()) restartIdle();
      }

      if (SCROLL_KEYS.has(e.key) && !(e.key === " " && e.target instanceof HTMLButtonElement)) e.preventDefault();
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [isOpen, requestClose, restartIdle]);

  const releaseSwipe = (swipe: Swipe, time: number) => {
    const offset = trackOffsetRef.current;
    if (!offset) return;

    const recent = swipe.samples.filter(sample => time - sample.time <= FLICK_WINDOW);
    const first = recent[0];
    const last = recent[recent.length - 1];
    const speed = last && last.time > first.time ? (last.x - first.x) / (last.time - first.time) : 0;
    const width = paneWidth();
    const moved = offset - swipe.base;
    let target = currentIndex;
    if (Math.abs(speed) > FLICK_SPEED && Math.abs(moved) > (swipe.zoomed ? width * 0.2 : TAP_SLOP)) {
      if (Math.sign(speed) === Math.sign(moved)) target += speed < 0 ? 1 : -1;
    } else if (Math.abs(offset) > width / 2) target += offset < 0 ? 1 : -1;

    settleSlide(target >= 0 && target < images.length ? target : currentIndex, speed * 1000);
  };

  const toggleZoomAt = (point: { x: number; y: number }) => {
    if (zoom !== 1) {
      resetZoom();
      setMotionSource("button");
      return;
    }

    zoomBy(Math.min(DOUBLE_TAP_ZOOM, maxZoom), paneOffset(point.x, point.y), "button");
  };

  const handleTap = (point: { x: number; y: number }, time: number) => {
    const last = lastTapRef.current;
    window.clearTimeout(tapTimerRef.current);
    if (!last || time - last.time > DOUBLE_TAP_MS || Math.hypot(point.x - last.x, point.y - last.y) > DOUBLE_TAP_SLOP) {
      lastTapRef.current = { time, ...point };
      tapTimerRef.current = window.setTimeout(() => setChromeHidden(hidden => !hidden), DOUBLE_TAP_MS);
      return;
    }

    lastTapRef.current = null;
    toggleZoomAt(point);
  };

  const handleWheel = (e: WheelEvent) => {
    const pane = imageRef.current;
    if (!pane) return;

    const zoomWithWheel = (weight = 1) => {
      const step = e.ctrlKey
        ? Math.max(-PINCH_WHEEL_MAX_STEP, Math.min(PINCH_WHEEL_MAX_STEP, e.deltaY * PINCH_WHEEL_SENSITIVITY))
        : e.deltaY * WHEEL_SENSITIVITY * weight;
      const rect = pane.getBoundingClientRect();
      zoomBy(
        Math.exp(-step),
        {
          x: e.clientX - rect.left - rect.width / 2,
          y: e.clientY - rect.top - rect.height / 2,
        },
        e.ctrlKey ? null : "wheel",
      );
    };
    if (e.ctrlKey) return zoomWithWheel();

    const magnitude = Math.abs(e.deltaX);
    let gesture = wheelGestureRef.current;
    const speed = gesture ? magnitude / Math.max(e.timeStamp - gesture.time, WHEEL_MIN_INTERVAL) : 0;
    let started = false;
    let swapped = false;
    const renewed =
      gesture?.axis === "x" &&
      gesture.mode !== "swipe" &&
      magnitude >= 1 &&
      (Math.sign(e.deltaX) === -gesture.direction ||
        (gesture.settled && speed > gesture.speed && gesture.rises + 1 >= WHEEL_RENEW_RISES));
    if (!gesture || e.timeStamp - gesture.time > WHEEL_GESTURE_GAP || renewed) {
      started = true;
      const axis = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? "x" : "y";
      swapped = axis === "x" && takeOverSlide().swapped;
      const probe = constrainPosition(position.x - Math.sign(e.deltaX), position.y, zoom);
      const canPan = !swapped && !trackOffsetRef.current && Math.abs(probe.x - position.x) > 0.5;
      gesture = {
        axis,
        mode: canPan ? "pan" : "swipe",
        origin: trackOffsetRef.current,
        offset: trackOffsetRef.current,
        time: e.timeStamp,
        direction: Math.sign(e.deltaX),
        speed,
        peak: speed,
        settled: false,
        rises: 0,
        delta: 0,
        floor: 0,
        decaySince: null,
      };
    }

    const elapsed = Math.max(e.timeStamp - gesture.time, WHEEL_MIN_INTERVAL);
    if (gesture.axis === "y") {
      const delta = Math.abs(e.deltaY);
      const locked =
        gesture.decaySince !== null &&
        e.timeStamp - gesture.decaySince >= WHEEL_MOMENTUM_LOCK &&
        e.timeStamp - gesture.time <= WHEEL_STREAM_GAP;
      const decaying =
        delta < gesture.delta && (delta >= gesture.delta * WHEEL_MOMENTUM_RATIO || gesture.delta - delta <= 1);
      const keeps = locked ? delta <= (gesture.floor + 1) * WHEEL_MOMENTUM_PUSH : decaying || delta === gesture.delta;
      const decaySince = !keeps ? null : decaying ? (gesture.decaySince ?? e.timeStamp) : gesture.decaySince;
      const floor = decaySince === null ? delta : Math.min(gesture.floor, delta);
      wheelGestureRef.current = { ...gesture, time: e.timeStamp, delta, floor, decaySince };
      return zoomWithWheel(decaySince === null ? 1 : momentumWeight(e.timeStamp - decaySince));
    }

    let { mode, offset } = gesture;
    if (mode === "pan") {
      const next = constrainPosition(position.x - e.deltaX, position.y, zoom);
      setMotionSource("wheel");
      setPosition(next);
      followWheel({ ...next, zoom });
    } else if (mode === "swipe" && !swapped) {
      offset -= e.deltaX;
      setTrack(holdEdge(offset, gesture.origin));
      const moved = offset - gesture.origin;
      const target = currentIndex + (moved < 0 ? 1 : -1);
      const exists = target >= 0 && target < images.length;
      if (Math.abs(moved) >= (exists ? WHEEL_SWIPE_COMMIT : WHEEL_EDGE_PUSH)) {
        mode = "done";
        settleSlide(
          exists ? target : currentIndex,
          (-e.deltaX / elapsed) * 1000,
          exists ? 0 : Math.sign(moved) * EDGE_LEAN,
        );
      }
    }

    const committed = gesture.mode === "swipe" && mode === "done";
    const peak = committed ? speed : Math.max(gesture.peak, speed);
    const latest = {
      ...gesture,
      mode,
      offset,
      time: e.timeStamp,
      direction: magnitude >= 1 ? Math.sign(e.deltaX) : gesture.direction,
      speed,
      peak,
      settled:
        !committed &&
        !started &&
        (gesture.settled || speed <= Math.max(WHEEL_SETTLED_SPEED, peak * WHEEL_SETTLED_RATIO)),
      rises: speed > gesture.speed ? gesture.rises + 1 : 0,
    };
    wheelGestureRef.current = latest;
    window.clearTimeout(wheelTimerRef.current);
    wheelTimerRef.current = window.setTimeout(() => {
      if (wheelGestureRef.current === latest && latest.mode === "swipe" && trackOffsetRef.current)
        settleSlide(indexRef.current);
    }, WHEEL_GESTURE_GAP);
  };

  const wheelHandlerRef = useRef(handleWheel);
  useEffect(() => {
    wheelHandlerRef.current = handleWheel;
  });

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!isOpen || !overlay) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      wheelHandlerRef.current(e);
    };

    overlay.addEventListener("wheel", onWheel, { passive: false });
    return () => overlay.removeEventListener("wheel", onWheel);
  }, [isOpen]);

  const isOutsideImage = (clientX: number, clientY: number) => {
    const el = imageContentRef.current;
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom;
  };

  const handleImageClick = (e: React.MouseEvent) => {
    if (Date.now() - lastTouchTimeRef.current < 300) {
      return;
    }

    if (!isOutsideImage(e.clientX, e.clientY)) {
      if (e.detail > 0 && e.detail % 2 === 0) toggleZoomAt({ x: e.clientX, y: e.clientY });
      return;
    }

    const movedFromDown = Math.hypot(e.clientX - mouseDownPosRef.current.x, e.clientY - mouseDownPosRef.current.y);
    if (movedFromDown < TAP_SLOP) {
      requestClose();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    mouseDownPosRef.current = { x: e.clientX, y: e.clientY };
    if (isOutsideImage(e.clientX, e.clientY)) return;

    setMotionSource(null);
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleDragMove = (e: MouseEvent) => {
    if (!(e.buttons & 1)) return setIsDragging(false);
    setPosition(constrainPosition(e.clientX - dragStartRef.current.x, e.clientY - dragStartRef.current.y, zoom));
  };

  const dragMoveRef = useRef(handleDragMove);
  useEffect(() => {
    dragMoveRef.current = handleDragMove;
  });

  useEffect(() => {
    if (!isDragging || isTouching) return;

    const onMove = (e: MouseEvent) => dragMoveRef.current(e);
    const onUp = () => setIsDragging(false);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging, isTouching]);

  const getDistance = (touch1: React.Touch, touch2: React.Touch) =>
    Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);

  const getMidpoint = (touch1: React.Touch, touch2: React.Touch) =>
    paneOffset((touch1.clientX + touch2.clientX) / 2, (touch1.clientY + touch2.clientY) / 2);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    multiTouchRef.current = e.touches.length > 1;
    setIsTouching(true);
    setMotionSource(null);

    if (e.touches.length === 2) {
      if (swipeRef.current) {
        swipeRef.current = null;
        settleSlide(indexRef.current);
      }
      const distance = getDistance(e.touches[0], e.touches[1]);
      pinchDistanceRef.current = distance;
      pinchDirectionRef.current = 0;
      setIsPinching(true);
      pinchStartRef.current = { distance, zoom, midpoint: getMidpoint(e.touches[0], e.touches[1]), position };
      hasMovedRef.current = false;
    } else if (e.touches.length === 1) {
      touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
      hasMovedRef.current = false;

      const { swapped } = takeOverSlide();
      const base = trackOffsetRef.current;
      const pan = !swapped && !base && zoom > 1 && !isOutsideImage(touch.clientX, touch.clientY);
      swipeRef.current = {
        mode: pan ? "pan" : base ? "swipe" : "pending",
        base,
        zoomed: pan,
        samples: [{ time: e.timeStamp, x: touch.clientX }],
      };
      if (!pan) return;

      setIsDragging(true);
      dragStartRef.current = {
        x: touch.clientX - position.x,
        y: touch.clientY - position.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && isPinching) {
      const distance = getDistance(e.touches[0], e.touches[1]);
      const delta = distance - pinchDistanceRef.current;
      if (!delta || (Math.sign(delta) !== pinchDirectionRef.current && Math.abs(delta) < PINCH_DEADZONE)) return;
      pinchDirectionRef.current = Math.sign(delta);
      pinchDistanceRef.current = distance;
      const start = pinchStartRef.current;
      const newZoom = Math.max(minZoom, Math.min(maxZoom, start.zoom * (distance / start.distance)));
      const ratio = newZoom / start.zoom;
      const midpoint = getMidpoint(e.touches[0], e.touches[1]);
      setZoom(newZoom);
      setPosition(
        constrainPosition(
          midpoint.x - (start.midpoint.x - start.position.x) * ratio,
          midpoint.y - (start.midpoint.y - start.position.y) * ratio,
          newZoom,
        ),
      );
      hasMovedRef.current = true;
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      const start = touchStartPosRef.current;
      if (Math.hypot(touch.clientX - start.x, touch.clientY - start.y) > TAP_SLOP) hasMovedRef.current = true;

      const swipe = swipeRef.current;
      if (!swipe) {
        if (isDragging) {
          setPosition(
            constrainPosition(touch.clientX - dragStartRef.current.x, touch.clientY - dragStartRef.current.y, zoom),
          );
        }
        return;
      }

      swipe.samples.push({ time: e.timeStamp, x: touch.clientX });
      while (swipe.samples.length > 2 && e.timeStamp - swipe.samples[0].time > FLICK_WINDOW) swipe.samples.shift();

      if (swipe.mode === "pending" && hasMovedRef.current)
        swipe.mode = Math.abs(touch.clientX - start.x) > Math.abs(touch.clientY - start.y) ? "swipe" : "none";

      if (swipe.mode === "swipe") setTrack(resist(swipe.base + touch.clientX - start.x));
      else if (swipe.mode === "pan") {
        const x = touch.clientX - dragStartRef.current.x;
        const next = constrainPosition(x, touch.clientY - dragStartRef.current.y, zoom);
        setPosition(next);
        setTrack(resist(x - next.x));
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    lastTouchTimeRef.current = Date.now();

    if (e.touches.length === 0) {
      setIsTouching(false);
      const swipe = swipeRef.current;
      swipeRef.current = null;
      const start = touchStartPosRef.current;
      if (!hasMovedRef.current && !multiTouchRef.current && !swipe?.base) handleTap(start, e.timeStamp);
      if (swipe) releaseSwipe(swipe, e.timeStamp);

      setIsDragging(false);
      setIsPinching(false);
      hasMovedRef.current = false;
    } else if (e.touches.length === 1 && isPinching) {
      setIsPinching(false);
      hasMovedRef.current = false;

      const touch = e.touches[0];
      setIsDragging(true);
      dragStartRef.current = {
        x: touch.clientX - position.x,
        y: touch.clientY - position.y,
      };
    }
  };

  const handleTouchCancel = () => {
    setIsTouching(false);
    setIsDragging(false);
    setIsPinching(false);
    hasMovedRef.current = false;
    swipeRef.current = null;
    if (trackOffsetRef.current) settleSlide(indexRef.current);
  };

  const slides = Array.from({ length: PRELOAD_REACH * 2 + 1 }, (_, i) => currentIndex - PRELOAD_REACH + i).filter(
    index => index >= 0 && index < images.length,
  );
  const zoomPercent = `${Math.round(zoom * fitScale * 100)}%`;
  const atFit = zoom === 1;
  const shownIndex = heading ?? currentIndex;
  const showsPrevious = Math.max(shownIndex, currentIndex) > 0;
  const showsNext = Math.min(shownIndex, currentIndex) < images.length - 1;
  const leavingPrevious = shownIndex === 0;
  const leavingNext = shownIndex === images.length - 1;

  const overlayVariants: Variants = {
    exit: (flies: boolean) => ({
      opacity: 0,
      transition: flies
        ? { delay: timing.close / 1000, duration: PHOTO_FADE, ease: "easeOut" }
        : { duration: timing.close / 1000, ease: "easeIn" },
    }),
  };
  const chromeFade = {
    variants: {
      exit: (flies: boolean) =>
        flies ? { opacity: 0, transition: { duration: timing.close / 1000, ease: FLIP_CURVE } } : {},
    } satisfies Variants,
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: timing.open / 1000, ease: FLIP_CURVE },
  } as const;
  const reachable = !chromeHidden && "pointer-events-auto";

  return (
    <AnimatePresence
      custom={closeFlies}
      onExitComplete={() => {
        resetZoom();
        settleViewerClose();
      }}
    >
      {isOpen && (
        <motion.div
          key="image-modal"
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          tabIndex={-1}
          data-lenis-prevent
          className="fixed inset-0 z-50 flex items-center justify-center select-none touch-none outline-none [--focus-ring:rgb(255,255,255)]"
          variants={overlayVariants}
          exit="exit"
          onPointerMove={wakeChrome}
          onPointerDown={wakeChrome}
        >
          <motion.div {...chromeFade} className="absolute inset-0 bg-black/90 backdrop-blur-xs" />

          <div className="relative w-full h-full flex items-center justify-center">
            <motion.div {...chromeFade} className="absolute top-4 left-4 right-4 z-20 pointer-events-none">
              <div
                className={cn(
                  "flex justify-between items-center transition-opacity duration-200",
                  chromeHidden && "opacity-0",
                )}
              >
                {images.length > 1 && (
                  <div
                    aria-live="polite"
                    aria-atomic="true"
                    className={cn("bg-black/50 text-white px-3 py-1 rounded-full text-sm", reachable)}
                  >
                    {shownIndex + 1} / {images.length}
                  </div>
                )}

                <div className={cn("ml-auto", reachable)}>
                  <RoundButton
                    label={t("close")}
                    shortcut="Escape"
                    icon="M6 18L18 6M6 6l12 12"
                    padding="p-2"
                    pressed={closePressed}
                    press={closePress}
                    onPress={requestClose}
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              ref={imageRef}
              className="relative w-full h-full overflow-hidden select-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: PHOTO_FADE, ease: "easeOut" }}
              onClick={handleImageClick}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchCancel}
              style={{
                cursor: isDragging ? "grabbing" : "var(--cursor-default)",
              }}
            >
              <div ref={trackRef} className="absolute inset-0">
                {slides.map(index => {
                  const current = index === currentIndex;
                  const distance = Math.abs(index - currentIndex);
                  const standIn = standIns.get(index);
                  const showsStandIn = standIn !== undefined && (!loaded.has(index) || failed.has(index));
                  const ratio = current ? null : knownRatio(index);
                  const box = current ? fitted : ratio && paneSize ? fitBox(ratio, paneSize, coarsePointer) : null;

                  return (
                    <div
                      key={index}
                      className="absolute inset-0"
                      style={
                        current
                          ? undefined
                          : { transform: `translateX(calc(${index - currentIndex} * (100% + ${SLIDE_GAP}px)))` }
                      }
                      aria-hidden={current ? undefined : true}
                    >
                      <div
                        ref={current ? flipRef : undefined}
                        className="w-full h-full flex items-center justify-center"
                      >
                        <div
                          ref={current ? imageContentRef : undefined}
                          className={cn(
                            "relative",
                            current && !isTouching && motionSource !== "wheel" && "transition-transform",
                            current &&
                              !isTouching &&
                              motionSource !== "wheel" &&
                              (motionSource === "button" ? "ease-[ease]" : "ease-out"),
                            current && !isDragging && !isPinching && motionSource !== "wheel" && "duration-300",
                            current && "motion-reduce:transition-none",
                          )}
                          style={{
                            width: box ? `${box.width}px` : "100%",
                            height: box ? `${box.height}px` : "100%",
                            ...(current
                              ? {
                                  transform: zoomTransform({ x: position.x, y: position.y, zoom }),
                                  willChange: isDragging || isPinching ? "transform" : "auto",
                                  cursor: isDragging ? "grabbing" : "grab",
                                }
                              : {}),
                          }}
                        >
                          {showsStandIn && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={standIn}
                              alt=""
                              aria-hidden
                              draggable={false}
                              className="absolute inset-0 w-full h-full object-contain"
                            />
                          )}

                          {!failed.has(index) && (distance <= preloadReach || loaded.has(index)) && (
                            <Image
                              src={images[index]}
                              alt={`${title} ${index + 1}`}
                              width={1200}
                              height={800}
                              sizes="100vw"
                              quality={85}
                              className={cn(
                                "relative w-full h-full object-contain image-reveal",
                                !loaded.has(index) && !showsStandIn && "image-reveal-pending",
                              )}
                              preload={current}
                              loading={current ? undefined : "eager"}
                              draggable={false}
                              onLoad={e => {
                                if (current && !knownRatio(index))
                                  setAspect(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight);
                                markLoaded(index);
                              }}
                              onError={() => markFailed(index)}
                            />
                          )}
                        </div>
                      </div>

                      <AnimatePresence propagate>
                        {distance <= 1 && !loaded.has(index) && !showsStandIn && (
                          <motion.div
                            key="image-spinner"
                            className="absolute inset-0"
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.14, ease: "easeOut" }}
                          >
                            <ImageSpinner label={t("loading")} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            <motion.div {...chromeFade} className="absolute inset-0 pointer-events-none">
              <div className={cn("absolute inset-0 transition-opacity duration-200", chromeHidden && "opacity-0")}>
                {images.length > 1 && (
                  <>
                    {showsPrevious && (
                      <RoundButton
                        label={t("previous")}
                        shortcut="ArrowLeft"
                        icon="M15 19l-7-7 7-7"
                        className={cn(
                          "absolute left-4 top-1/2 -translate-y-1/2 z-10",
                          reachable,
                          leavingPrevious && "opacity-0 cursor-(--cursor-default)",
                        )}
                        padding="p-3"
                        pressed={prevPressed}
                        press={prevPress}
                        onPress={() => slideBy(-1)}
                        disabled={leavingPrevious}
                        buttonRef={previousRef}
                      />
                    )}

                    {showsNext && (
                      <RoundButton
                        label={t("next")}
                        shortcut="ArrowRight"
                        icon="M9 5l7 7-7 7"
                        className={cn(
                          "absolute right-4 top-1/2 -translate-y-1/2 z-10",
                          reachable,
                          leavingNext && "opacity-0 cursor-(--cursor-default)",
                        )}
                        padding="p-3"
                        pressed={nextPressed}
                        press={nextPress}
                        onPress={() => slideBy(1)}
                        disabled={leavingNext}
                        buttonRef={nextRef}
                      />
                    )}
                  </>
                )}

                <div
                  className={cn(
                    "absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/50 rounded-full p-[5px]",
                    reachable,
                  )}
                >
                  <PillButton
                    label={t("zoomOut")}
                    disabled={zoom <= minZoom}
                    pressed={zoomOutPressed}
                    press={zoomOutPress}
                    onPress={handleZoomOut}
                  >
                    <ZoomIcon path="M20 12H4" />
                  </PillButton>

                  <PillButton
                    label={t(atFit ? "resetZoom" : "fitZoom")}
                    ariaLabel={`${zoomPercent}, ${t(atFit ? "resetZoom" : "fitZoom")}`}
                    className="text-sm"
                    pressed={resetPressed}
                    press={resetPress}
                    onPress={toggleNaturalZoom}
                  >
                    <span className="grid justify-items-center">
                      <span className="invisible col-start-1 row-start-1">444%</span>
                      <span className="col-start-1 row-start-1">{zoomPercent}</span>
                    </span>
                  </PillButton>

                  <PillButton
                    label={t("zoomIn")}
                    disabled={zoom >= maxZoom}
                    pressed={zoomInPressed}
                    press={zoomInPress}
                    onPress={handleZoomIn}
                  >
                    <ZoomIcon path="M12 4v16m8-8H4" />
                  </PillButton>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
