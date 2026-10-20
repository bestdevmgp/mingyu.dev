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

import cn from "classnames";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import {
  flipFrom,
  flipTo,
  getCenteredBox,
  getFlipTransform,
  getVisibleImageBox,
  prefersReducedMotion,
  prefersSlowerMotion,
  type Box,
} from "@/utils/imageFlip";
import { SCROLL_KEYS } from "@/utils/scrollKeys";
import useFocusScope from "@/utils/useFocusScope";
import useTouchPress from "@/utils/useTouchPress";

import ImageSpinner from "./ImageSpinner";
import Tooltip from "../Tooltip";

interface ImageModalProps {
  images: string[];
  title: string;
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  getThumbnail?: (index: number) => HTMLImageElement | null;
  imageSizes?: Record<string, [number, number]>;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 5;
const ZOOM_STEP = 1.5;
const WHEEL_SENSITIVITY = 0.0015;
const PINCH_WHEEL_SENSITIVITY = 0.01;
const PINCH_WHEEL_MAX_STEP = 0.15;
const PINCH_DEADZONE = 2;
const FIT_RATIO = 0.7;
const TALL_FIT_RATIO = 0.92;
const FLIP_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";
const POINTER_TIMING = { open: 420, close: 320, fade: 220 };
const TOUCH_TIMING = { open: 560, close: 430, fade: 280 };

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
  buttonRef,
}: RoundButtonProps) => (
  <Tooltip label={label} shortcut={shortcut}>
    <button
      ref={buttonRef}
      onClick={e => {
        e.stopPropagation();
        onPress();
      }}
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
  pressed: boolean;
  press: PressHandlers;
  onPress: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

const PillButton = ({ label, pressed, press, onPress, disabled, className, children }: PillButtonProps) => (
  <Tooltip label={label} side="top">
    <button
      onClick={e => {
        e.stopPropagation();
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
      aria-label={label}
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
  const [zoom, setZoom] = useState(1);
  const [buttonZoom, setButtonZoom] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isPinching, setIsPinching] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const [pinchStart, setPinchStart] = useState({ distance: 0, zoom: 1 });
  const [lastTouchTime, setLastTouchTime] = useState(0);
  const [touchStartPos, setTouchStartPos] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const [aspect, setAspect] = useState<number | null>(null);
  const [loadedIndex, setLoadedIndex] = useState<number | null>(null);
  const [fitted, setFitted] = useState<{ width: number; height: number } | null>(null);
  const [originSrc, setOriginSrc] = useState<string | null>(null);
  const [timing, setTiming] = useState(POINTER_TIMING);
  const [closePressed, closePress] = useTouchPress();
  const [prevPressed, prevPress] = useTouchPress();
  const [nextPressed, nextPress] = useTouchPress();
  const [zoomOutPressed, zoomOutPress] = useTouchPress();
  const [resetPressed, resetPress] = useTouchPress();
  const [zoomInPressed, zoomInPress] = useTouchPress();

  const overlayRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const imageContentRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<HTMLDivElement>(null);
  const mouseDownPosRef = useRef({ x: 0, y: 0 });
  const multiTouchRef = useRef(false);
  const pinchDistanceRef = useRef(0);
  const pinchDirectionRef = useRef(0);
  const isClosingRef = useRef(false);
  const previousRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const focusAfterStepRef = useRef<RefObject<HTMLButtonElement | null> | null>(null);
  useFocusScope(overlayRef, isOpen);

  const measureVisualBox = useCallback((): Box | null => {
    const wrapper = flipRef.current;
    const content = imageContentRef.current;
    if (!wrapper || !content) return null;

    const inFlight = getComputedStyle(wrapper).transform;
    const transition = wrapper.style.transition;

    wrapper.style.transition = "none";
    wrapper.style.transform = "none";
    const rect = content.getBoundingClientRect();
    wrapper.style.transform = inFlight === "none" ? "" : inFlight;
    void wrapper.offsetWidth;
    wrapper.style.transition = transition;

    return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
  }, []);

  const fitToPane = useCallback((ratio: number) => {
    const pane = imageRef.current;
    if (!pane) return null;

    const widthRatio = pane.offsetHeight > pane.offsetWidth ? TALL_FIT_RATIO : FIT_RATIO;
    const width = Math.min(pane.offsetWidth * widthRatio, pane.offsetHeight * ratio * FIT_RATIO);
    return { width, height: width / ratio };
  }, []);

  const knownRatio = useCallback(
    (index: number) => {
      const size = imageSizes?.[images[index]];
      return size ? size[0] / size[1] : null;
    },
    [images, imageSizes],
  );

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setButtonZoom(false);
  }, []);

  const showImage = useCallback(
    (index: number) => {
      setCurrentIndex(index);
      resetZoom();
      const ratio = knownRatio(index);
      if (!ratio) return;
      setAspect(ratio);
      setFitted(fitToPane(ratio));
    },
    [knownRatio, fitToPane, resetZoom],
  );

  const goToNext = useCallback(() => {
    if (currentIndex >= images.length - 1) return;
    if (currentIndex + 1 === images.length - 1 && document.activeElement === nextRef.current)
      focusAfterStepRef.current = previousRef;
    showImage(currentIndex + 1);
  }, [currentIndex, images.length, showImage]);

  const goToPrevious = useCallback(() => {
    if (currentIndex <= 0) return;
    if (currentIndex === 1 && document.activeElement === previousRef.current) focusAfterStepRef.current = nextRef;
    showImage(currentIndex - 1);
  }, [currentIndex, showImage]);

  useLayoutEffect(() => {
    focusAfterStepRef.current?.current?.focus();
    focusAfterStepRef.current = null;
  }, [currentIndex]);

  const requestClose = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    const wrapper = flipRef.current;
    const thumbnail = getThumbnail?.(currentIndex) ?? null;
    const origin = thumbnail ? getVisibleImageBox(thumbnail) : null;
    const target = measureVisualBox();
    const transform = origin && target ? getFlipTransform(origin, target) : null;

    if (wrapper && transform && !prefersReducedMotion()) flipTo(wrapper, transform, timing.close, FLIP_EASING);

    onClose();
  }, [currentIndex, getThumbnail, measureVisualBox, timing.close, onClose]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (prefersSlowerMotion()) setTiming(TOUCH_TIMING);
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) return;
    isClosingRef.current = false;
    setCurrentIndex(initialIndex);
    setLoadedIndex(null);
    resetZoom();

    const thumbnail = getThumbnail?.(initialIndex) ?? null;
    setOriginSrc(thumbnail?.currentSrc || null);

    const ratio = knownRatio(initialIndex) ?? (thumbnail ? thumbnail.naturalWidth / thumbnail.naturalHeight : NaN);
    if (!Number.isFinite(ratio) || ratio <= 0) return;

    const size = fitToPane(ratio);
    setAspect(ratio);
    setFitted(size);

    const pane = imageRef.current;
    const wrapper = flipRef.current;
    const content = imageContentRef.current;
    const origin = thumbnail ? getVisibleImageBox(thumbnail) : null;
    if (!pane || !wrapper || !content || !size || !origin || prefersReducedMotion()) return;

    content.style.width = `${size.width}px`;
    content.style.height = `${size.height}px`;

    const transform = getFlipTransform(origin, getCenteredBox(pane, size));
    if (transform) flipFrom(wrapper, transform, timing.open, FLIP_EASING);
  }, [isOpen, initialIndex, getThumbnail, knownRatio, fitToPane, resetZoom, timing.open]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!isOpen) return;

    const preventScroll = (e: TouchEvent) => e.preventDefault();

    document.addEventListener("touchmove", preventScroll, { passive: false });
    return () => document.removeEventListener("touchmove", preventScroll);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        e.stopPropagation();

        if (e.key === "Escape") requestClose();
        else if (e.key === "ArrowLeft") goToPrevious();
        else goToNext();
        return;
      }

      if (SCROLL_KEYS.has(e.key) && !(e.key === " " && e.target instanceof HTMLButtonElement)) e.preventDefault();
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [isOpen, requestClose, goToPrevious, goToNext]);

  useEffect(() => {
    const pane = imageRef.current;
    if (!isOpen || !pane || !aspect) return;

    const fit = () => setFitted(fitToPane(aspect));

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(pane);
    return () => observer.disconnect();
  }, [isOpen, aspect, fitToPane]);

  const constrainPosition = (newX: number, newY: number, currentZoom: number) => {
    const container = imageRef.current;
    const content = imageContentRef.current;
    if (!container || !content) return { x: newX, y: newY };

    const scaledWidth = content.offsetWidth * currentZoom;
    const scaledHeight = content.offsetHeight * currentZoom;

    const maxX = Math.max(0, (scaledWidth - container.offsetWidth) / 2);
    const maxY = Math.max(0, (scaledHeight - container.offsetHeight) / 2);

    return {
      x: Math.max(-maxX, Math.min(maxX, newX)),
      y: Math.max(-maxY, Math.min(maxY, newY)),
    };
  };

  const applyZoom = (nextZoom: number, anchor?: { x: number; y: number }, fromButton = false) => {
    const clamped = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, nextZoom));
    if (clamped === zoom) return;

    const ratio = clamped / zoom;
    const shifted = anchor
      ? { x: position.x - anchor.x * (ratio - 1), y: position.y - anchor.y * (ratio - 1) }
      : { x: position.x * ratio, y: position.y * ratio };

    setButtonZoom(fromButton);
    setZoom(clamped);
    setPosition(constrainPosition(shifted.x, shifted.y, clamped));
  };

  const zoomBy = (factor: number, anchor?: { x: number; y: number }, fromButton = false) =>
    applyZoom(zoom * factor, anchor, fromButton);

  const handleZoomIn = () => zoomBy(ZOOM_STEP, undefined, true);
  const handleZoomOut = () => zoomBy(1 / ZOOM_STEP, undefined, true);

  const zoomByRef = useRef(zoomBy);
  useEffect(() => {
    zoomByRef.current = zoomBy;
  });

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!isOpen || !overlay) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const pane = imageRef.current;
      if (!pane) return;

      const step = e.ctrlKey
        ? Math.max(-PINCH_WHEEL_MAX_STEP, Math.min(PINCH_WHEEL_MAX_STEP, e.deltaY * PINCH_WHEEL_SENSITIVITY))
        : e.deltaY * WHEEL_SENSITIVITY;
      const rect = pane.getBoundingClientRect();
      zoomByRef.current(Math.exp(-step), {
        x: e.clientX - rect.left - rect.width / 2,
        y: e.clientY - rect.top - rect.height / 2,
      });
    };

    overlay.addEventListener("wheel", handleWheel, { passive: false });
    return () => overlay.removeEventListener("wheel", handleWheel);
  }, [isOpen]);

  const isOutsideImage = (clientX: number, clientY: number) => {
    const el = imageContentRef.current;
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom;
  };

  const handleImageClick = (e: React.MouseEvent) => {
    if (Date.now() - lastTouchTime < 300) {
      return;
    }

    e.stopPropagation();

    const movedFromDown = Math.hypot(e.clientX - mouseDownPosRef.current.x, e.clientY - mouseDownPosRef.current.y);
    if (movedFromDown < 10 && isOutsideImage(e.clientX, e.clientY)) {
      requestClose();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    mouseDownPosRef.current = { x: e.clientX, y: e.clientY };
    if (isOutsideImage(e.clientX, e.clientY)) return;

    setButtonZoom(false);
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition(constrainPosition(e.clientX - dragStart.x, e.clientY - dragStart.y, zoom));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    multiTouchRef.current = e.touches.length > 1;
    setIsTouching(true);
    setButtonZoom(false);

    if (e.touches.length === 2) {
      const distance = getDistance(e.touches[0], e.touches[1]);
      pinchDistanceRef.current = distance;
      pinchDirectionRef.current = 0;
      setIsPinching(true);
      setPinchStart({ distance, zoom });
      setHasMoved(false);
    } else if (e.touches.length === 1) {
      setTouchStartPos({ x: touch.clientX, y: touch.clientY });
      setHasMoved(false);

      if (isOutsideImage(touch.clientX, touch.clientY)) return;

      setIsDragging(true);
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && isPinching) {
      const distance = getDistance(e.touches[0], e.touches[1]);
      const delta = distance - pinchDistanceRef.current;
      if (!delta || (Math.sign(delta) !== pinchDirectionRef.current && Math.abs(delta) < PINCH_DEADZONE)) return;
      pinchDirectionRef.current = Math.sign(delta);
      pinchDistanceRef.current = distance;
      const scale = distance / pinchStart.distance;
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, pinchStart.zoom * scale));
      setZoom(newZoom);
      setPosition(constrainPosition(position.x, position.y, newZoom));
      setHasMoved(true);
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      const moveDistance = Math.sqrt(
        Math.pow(touch.clientX - touchStartPos.x, 2) + Math.pow(touch.clientY - touchStartPos.y, 2),
      );

      if (moveDistance > 10) {
        setHasMoved(true);
      }

      if (isDragging) {
        setPosition(constrainPosition(touch.clientX - dragStart.x, touch.clientY - dragStart.y, zoom));
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setLastTouchTime(Date.now());

    if (e.touches.length === 0) {
      setIsTouching(false);
      if (!hasMoved && !multiTouchRef.current && isOutsideImage(touchStartPos.x, touchStartPos.y)) {
        e.stopPropagation();
        requestClose();
      }

      setIsDragging(false);
      setIsPinching(false);
      setHasMoved(false);
    } else if (e.touches.length === 1 && isPinching) {
      setIsPinching(false);
      setHasMoved(false);

      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y,
      });
    }
  };

  const handleTouchCancel = () => {
    setIsTouching(false);
    setIsDragging(false);
    setIsPinching(false);
    setHasMoved(false);
  };

  const showOrigin = Boolean(originSrc) && currentIndex === initialIndex && loadedIndex !== currentIndex;

  return (
    <AnimatePresence onExitComplete={resetZoom}>
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: timing.close / 1000, ease: "easeIn" } }}
          transition={{ duration: timing.fade / 1000, ease: "easeOut" }}
        >
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xs" />

          <div
            className="relative w-full h-full flex items-center justify-center p-2 md:p-4"
            onMouseDown={e => {
              if (e.target === e.currentTarget) mouseDownPosRef.current = { x: e.clientX, y: e.clientY };
            }}
            onClick={e => {
              if (e.target === e.currentTarget) handleImageClick(e);
            }}
          >
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20 pointer-events-none">
              {images.length > 1 && (
                <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm pointer-events-auto">
                  {currentIndex + 1} / {images.length}
                </div>
              )}

              <div className="ml-auto pointer-events-auto">
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

            <div
              ref={imageRef}
              className="relative w-full h-full flex items-center justify-center overflow-hidden select-none"
              onClick={handleImageClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchCancel}
              style={{
                cursor: isDragging ? "grabbing" : "var(--cursor-default)",
              }}
            >
              <div ref={flipRef} className="flex items-center justify-center">
                <div
                  ref={imageContentRef}
                  className={cn(
                    "relative",
                    !isTouching && "transition-transform",
                    !isTouching && (buttonZoom ? "ease-[ease]" : "ease-out"),
                    !isDragging && !isPinching && "duration-300",
                  )}
                  style={{
                    width: fitted ? `${fitted.width}px` : "100%",
                    height: fitted ? `${fitted.height}px` : "100%",
                    transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                    willChange: isDragging || isPinching ? "transform" : "auto",
                    cursor: isDragging ? "grabbing" : "grab",
                  }}
                >
                  {showOrigin && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={originSrc!}
                      alt=""
                      aria-hidden
                      draggable={false}
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  )}

                  <Image
                    src={images[currentIndex]}
                    alt={`${title} ${currentIndex + 1}`}
                    width={1200}
                    height={800}
                    sizes="100vw"
                    quality={85}
                    className={cn(
                      "relative w-full h-full object-contain image-reveal",
                      loadedIndex !== currentIndex && !showOrigin && "image-reveal-pending",
                    )}
                    preload
                    draggable={false}
                    onLoad={e => {
                      if (!knownRatio(currentIndex))
                        setAspect(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight);
                      setLoadedIndex(currentIndex);
                    }}
                    onError={() => setLoadedIndex(currentIndex)}
                  />
                </div>
              </div>

              <AnimatePresence>
                {loadedIndex !== currentIndex && !showOrigin && (
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

            {images.length > 1 && (
              <>
                {currentIndex > 0 && (
                  <RoundButton
                    label={t("previous")}
                    shortcut="ArrowLeft"
                    icon="M15 19l-7-7 7-7"
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10"
                    padding="p-3"
                    pressed={prevPressed}
                    press={prevPress}
                    onPress={goToPrevious}
                    buttonRef={previousRef}
                  />
                )}

                {currentIndex < images.length - 1 && (
                  <RoundButton
                    label={t("next")}
                    shortcut="ArrowRight"
                    icon="M9 5l7 7-7 7"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
                    padding="p-3"
                    pressed={nextPressed}
                    press={nextPress}
                    onPress={goToNext}
                    buttonRef={nextRef}
                  />
                )}
              </>
            )}

            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/50 rounded-full p-[5px]"
              onClick={e => e.stopPropagation()}
            >
              <PillButton
                label={t("zoomOut")}
                disabled={zoom <= MIN_ZOOM}
                pressed={zoomOutPressed}
                press={zoomOutPress}
                onPress={handleZoomOut}
              >
                <ZoomIcon path="M20 12H4" />
              </PillButton>

              <PillButton
                label={t("resetZoom")}
                className="text-sm"
                pressed={resetPressed}
                press={resetPress}
                onPress={() => {
                  resetZoom();
                  setButtonZoom(true);
                }}
              >
                <span className="grid justify-items-center">
                  <span className="invisible col-start-1 row-start-1">444%</span>
                  <span className="col-start-1 row-start-1">{Math.round(zoom * 100)}%</span>
                </span>
              </PillButton>

              <PillButton
                label={t("zoomIn")}
                disabled={zoom >= MAX_ZOOM}
                pressed={zoomInPressed}
                press={zoomInPress}
                onPress={handleZoomIn}
              >
                <ZoomIcon path="M12 4v16m8-8H4" />
              </PillButton>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
