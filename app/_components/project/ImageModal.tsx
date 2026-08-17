"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import cn from "classnames";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";

import useTouchPress from "@/utils/useTouchPress";

import ImageSpinner from "./ImageSpinner";

interface ImageModalProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 5;
const ZOOM_STEP = 1.5;
const WHEEL_SENSITIVITY = 0.0015;
const FIT_RATIO = 0.7;
const SCROLL_KEYS = [" ", "PageUp", "PageDown", "Home", "End", "ArrowUp", "ArrowDown"];
const MIN_SPINNER_MS = 3000;

export default function ImageModal({ images, initialIndex, isOpen, onClose }: ImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isPinching, setIsPinching] = useState(false);
  const [pinchStart, setPinchStart] = useState({ distance: 0, zoom: 1 });
  const [lastTouchTime, setLastTouchTime] = useState(0);
  const [touchStartPos, setTouchStartPos] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const [aspect, setAspect] = useState<number | null>(null);
  const [loadedIndex, setLoadedIndex] = useState<number | null>(null);
  const [fitted, setFitted] = useState<{ width: number; height: number } | null>(null);
  const [closePressed, closePress] = useTouchPress();
  const [prevPressed, prevPress] = useTouchPress();
  const [nextPressed, nextPress] = useTouchPress();
  const [zoomOutPressed, zoomOutPress] = useTouchPress();
  const [resetPressed, resetPress] = useTouchPress();
  const [zoomInPressed, zoomInPress] = useTouchPress();

  const overlayRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const imageContentRef = useRef<HTMLDivElement>(null);
  const mouseDownPosRef = useRef({ x: 0, y: 0 });

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const goToNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(prev => prev + 1);
      resetZoom();
    }
  }, [currentIndex, images.length, resetZoom]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      resetZoom();
    }
  }, [currentIndex, resetZoom]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setCurrentIndex(initialIndex);
    resetZoom();
  }, [initialIndex, isOpen, resetZoom]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;

      document.body.style.overflow = "hidden";

      const preventScroll = (e: TouchEvent) => {
        const target = e.target as Element;
        if (target?.closest(".image-modal-container")) {
          return;
        }
        e.preventDefault();
      };

      document.addEventListener("touchmove", preventScroll, { passive: false });

      return () => {
        document.body.style.overflow = originalOverflow || "";
        document.removeEventListener("touchmove", preventScroll);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        e.stopPropagation();

        if (e.key === "Escape") onClose();
        else if (e.key === "ArrowLeft") goToPrevious();
        else goToNext();
        return;
      }

      if (SCROLL_KEYS.includes(e.key)) e.preventDefault();
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [isOpen, onClose, goToPrevious, goToNext]);

  useEffect(() => {
    const pane = imageRef.current;
    if (!isOpen || !pane || !aspect) return;

    const fit = () => {
      const fittedWidth = Math.min(pane.offsetWidth, pane.offsetHeight * aspect) * FIT_RATIO;
      setFitted({ width: fittedWidth, height: fittedWidth / aspect });
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(pane);
    return () => observer.disconnect();
  }, [isOpen, aspect]);

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

  const applyZoom = (nextZoom: number, anchor?: { x: number; y: number }) => {
    const clamped = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, nextZoom));
    if (clamped === zoom) return;

    const ratio = clamped / zoom;
    const shifted = anchor
      ? { x: position.x - anchor.x * (ratio - 1), y: position.y - anchor.y * (ratio - 1) }
      : { x: position.x * ratio, y: position.y * ratio };

    setZoom(clamped);
    setPosition(constrainPosition(shifted.x, shifted.y, clamped));
  };

  const zoomBy = (factor: number, anchor?: { x: number; y: number }) => applyZoom(zoom * factor, anchor);

  const handleZoomIn = () => zoomBy(ZOOM_STEP);
  const handleZoomOut = () => zoomBy(1 / ZOOM_STEP);

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

      const rect = pane.getBoundingClientRect();
      zoomByRef.current(Math.exp(-e.deltaY * WHEEL_SENSITIVITY), {
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
      onClose();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    mouseDownPosRef.current = { x: e.clientX, y: e.clientY };
    if (isOutsideImage(e.clientX, e.clientY)) return;

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

    if (e.touches.length === 2) {
      e.preventDefault();
      const distance = getDistance(e.touches[0], e.touches[1]);
      setIsPinching(true);
      setPinchStart({ distance, zoom });
      setHasMoved(false);
    } else if (e.touches.length === 1) {
      setTouchStartPos({ x: touch.clientX, y: touch.clientY });
      setHasMoved(false);

      if (isOutsideImage(touch.clientX, touch.clientY)) return;

      if (zoom > 1) e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && isPinching) {
      e.preventDefault();
      const distance = getDistance(e.touches[0], e.touches[1]);
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
        if (zoom > 1) e.preventDefault();
        setPosition(constrainPosition(touch.clientX - dragStart.x, touch.clientY - dragStart.y, zoom));
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setLastTouchTime(Date.now());

    if (e.touches.length === 0) {
      if (!hasMoved && !isPinching && isOutsideImage(touchStartPos.x, touchStartPos.y)) {
        e.stopPropagation();
        onClose();
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="image-modal"
          ref={overlayRef}
          className="fixed inset-0 bg-black/90 backdrop-blur-xs z-50 flex items-center justify-center select-none image-modal-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
        >
          <motion.div
            className="relative w-full h-full flex items-center justify-center p-2 md:p-4"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9, transition: { duration: 0.25, ease: "easeIn" } }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
          >
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20 pointer-events-none">
              {images.length > 1 && (
                <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm pointer-events-auto">
                  {currentIndex + 1} / {images.length}
                </div>
              )}

              <div className="ml-auto pointer-events-auto">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onClose();
                  }}
                  {...closePress}
                  className={cn(
                    "text-white rounded-full p-2 transition-[opacity,background-color] duration-200",
                    closePressed
                      ? "bg-black/70 opacity-100"
                      : "bg-black/50 opacity-55 hover:bg-black/70 hover:opacity-100",
                  )}
                  aria-label="닫기"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
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
              style={{
                cursor: isDragging ? "grabbing" : "default",
              }}
            >
              <div
                ref={imageContentRef}
                className={cn("transition-transform ease-out", !isDragging && !isPinching && "duration-300")}
                style={{
                  width: fitted ? `${fitted.width}px` : "100%",
                  height: fitted ? `${fitted.height}px` : "100%",
                  transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                  willChange: isDragging || isPinching ? "transform" : "auto",
                  cursor: isDragging ? "grabbing" : "grab",
                }}
              >
                <Image
                  src={images[currentIndex]}
                  alt={`Image ${currentIndex + 1}`}
                  width={1200}
                  height={800}
                  sizes="100vw"
                  quality={85}
                  className={cn("w-full h-full object-contain", loadedIndex !== currentIndex && "opacity-0")}
                  priority
                  draggable={false}
                  onLoad={e => {
                    setAspect(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight);
                    const index = currentIndex;
                    window.setTimeout(() => setLoadedIndex(index), MIN_SPINNER_MS);
                  }}
                  onError={() => setLoadedIndex(currentIndex)}
                />
              </div>

              {loadedIndex !== currentIndex && <ImageSpinner />}
            </div>

            {images.length > 1 && (
              <>
                {currentIndex > 0 && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      goToPrevious();
                    }}
                    {...prevPress}
                    className={cn(
                      "absolute left-4 top-1/2 -translate-y-1/2 text-white rounded-full p-3 z-10",
                      "transition-[opacity,background-color] duration-200",
                      prevPressed
                        ? "bg-black/70 opacity-100"
                        : "bg-black/50 opacity-55 hover:bg-black/70 hover:opacity-100",
                    )}
                    aria-label="이전 이미지"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}

                {currentIndex < images.length - 1 && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      goToNext();
                    }}
                    {...nextPress}
                    className={cn(
                      "absolute right-4 top-1/2 -translate-y-1/2 text-white rounded-full p-3 z-10",
                      "transition-[opacity,background-color] duration-200",
                      nextPressed
                        ? "bg-black/70 opacity-100"
                        : "bg-black/50 opacity-55 hover:bg-black/70 hover:opacity-100",
                    )}
                    aria-label="다음 이미지"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </>
            )}

            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 rounded-full p-2"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleZoomOut();
                }}
                disabled={zoom <= MIN_ZOOM}
                {...zoomOutPress}
                className={cn(
                  "text-white p-2 rounded-full transition-colors duration-200",
                  zoom <= MIN_ZOOM
                    ? "opacity-50 cursor-not-allowed"
                    : zoomOutPressed
                      ? "bg-white/20"
                      : "hover:bg-white/20",
                )}
                aria-label="축소"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>

              <button
                onClick={e => {
                  e.stopPropagation();
                  resetZoom();
                }}
                {...resetPress}
                className={cn(
                  "text-white px-3 py-2 rounded-full transition-colors duration-200 text-sm",
                  resetPressed ? "bg-white/20" : "hover:bg-white/20",
                )}
                aria-label="원래 크기"
              >
                {Math.round(zoom * 100)}%
              </button>

              <button
                onClick={e => {
                  e.stopPropagation();
                  handleZoomIn();
                }}
                disabled={zoom >= MAX_ZOOM}
                {...zoomInPress}
                className={cn(
                  "text-white p-2 rounded-full transition-colors duration-200",
                  zoom >= MAX_ZOOM
                    ? "opacity-50 cursor-not-allowed"
                    : zoomInPressed
                      ? "bg-white/20"
                      : "hover:bg-white/20",
                )}
                aria-label="확대"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
