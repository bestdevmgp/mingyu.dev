"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import cn from "classnames";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface ImageModalProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

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
  const [hasMouseMoved, setHasMouseMoved] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    setCurrentIndex(initialIndex);
    resetZoom();
  }, [initialIndex, resetZoom]);

  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;

      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth + parseInt(originalPaddingRight || "0")}px`;

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
        document.body.style.paddingRight = originalPaddingRight || "";
        document.removeEventListener("touchmove", preventScroll);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, []);

  const onCloseCallback = useCallback(onClose, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onCloseCallback();
      } else if (e.key === "ArrowLeft" && currentIndex > 0) {
        goToPrevious();
      } else if (e.key === "ArrowRight" && currentIndex < images.length - 1) {
        goToNext();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, images.length, onCloseCallback, goToPrevious, goToNext]);

  const handleZoomIn = (clickX?: number, clickY?: number) => {
    if (clickX !== undefined && clickY !== undefined && imageRef.current) {
      const container = imageRef.current;
      const containerRect = container.getBoundingClientRect();
      const containerCenterX = containerRect.width / 2;
      const containerCenterY = containerRect.height / 2;

      const offsetX = clickX - containerCenterX;
      const offsetY = clickY - containerCenterY;

      const newZoom = Math.min(zoom * 1.5, 5);
      setZoom(newZoom);

      const newPosition = {
        x: -offsetX * (newZoom / zoom - 1),
        y: -offsetY * (newZoom / zoom - 1),
      };

      const constrainedPos = constrainPosition(newPosition.x, newPosition.y, newZoom);
      setPosition(constrainedPos);
    } else {
      setZoom(prev => Math.min(prev * 1.5, 5));
    }
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.5, 0.5));
  };

  const handleImageClick = (e: React.MouseEvent) => {
    const now = Date.now();
    if (now - lastTouchTime < 300) {
      return;
    }

    e.stopPropagation();
    if (zoom === 1) {
      const rect = (e.currentTarget as Element).getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      handleZoomIn(clickX, clickY);
    } else if (zoom > 1 && !hasMouseMoved) {
      resetZoom();
    }

    setHasMouseMoved(false);
  };

  const constrainPosition = (newX: number, newY: number, currentZoom: number) => {
    if (!imageRef.current) return { x: newX, y: newY };

    const container = imageRef.current;
    const containerRect = container.getBoundingClientRect();
    const imageWidth = containerRect.width * currentZoom;
    const imageHeight = containerRect.height * currentZoom;

    const maxX = Math.max(0, (imageWidth - containerRect.width) / 2);
    const maxY = Math.max(0, (imageHeight - containerRect.height) / 2);

    return {
      x: Math.max(-maxX, Math.min(maxX, newX)),
      y: Math.max(-maxY, Math.min(maxY, newY)),
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setHasMouseMoved(false);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setHasMouseMoved(true);
      const newPos = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      };
      const constrainedPos = constrainPosition(newPos.x, newPos.y, zoom);
      setPosition(constrainedPos);
    }
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

      if (zoom > 1) {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({
          x: touch.clientX - position.x,
          y: touch.clientY - position.y,
        });
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && isPinching) {
      e.preventDefault();
      const distance = getDistance(e.touches[0], e.touches[1]);
      const scale = distance / pinchStart.distance;
      const newZoom = Math.max(0.5, Math.min(5, pinchStart.zoom * scale));
      setZoom(newZoom);
      setHasMoved(true);
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      const moveDistance = Math.sqrt(
        Math.pow(touch.clientX - touchStartPos.x, 2) + Math.pow(touch.clientY - touchStartPos.y, 2),
      );

      if (moveDistance > 10) {
        setHasMoved(true);
      }

      if (isDragging && zoom > 1) {
        e.preventDefault();
        const newPos = {
          x: touch.clientX - dragStart.x,
          y: touch.clientY - dragStart.y,
        };
        const constrainedPos = constrainPosition(newPos.x, newPos.y, zoom);
        setPosition(constrainedPos);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setLastTouchTime(Date.now());

    if (e.touches.length === 0) {
      if (!hasMoved && !isPinching) {
        e.stopPropagation();
        if (zoom === 1) {
          const rect = (e.currentTarget as Element).getBoundingClientRect();
          const tapX = touchStartPos.x - rect.left;
          const tapY = touchStartPos.y - rect.top;
          handleZoomIn(tapX, tapY);
        } else {
          resetZoom();
        }
      }

      setIsDragging(false);
      setIsPinching(false);
      setHasMoved(false);
    } else if (e.touches.length === 1 && isPinching) {
      setIsPinching(false);
      setHasMoved(false);

      if (zoom > 1) {
        const touch = e.touches[0];
        setIsDragging(true);
        setDragStart({
          x: touch.clientX - position.x,
          y: touch.clientY - position.y,
        });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center image-modal-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative w-full h-full flex items-center justify-center p-4"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
        >
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
            {images.length > 1 && (
              <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentIndex + 1} / {images.length}
              </div>
            )}

            <div className="ml-auto">
              <button
                onClick={e => {
                  e.stopPropagation();
                  onCloseCallback();
                }}
                className="bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
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
            className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-pointer select-none"
            onClick={handleImageClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
            }}
          >
            <div
              className={cn("transition-transform ease-out", !isDragging && !isPinching && "duration-300")}
              style={{
                transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                willChange: isDragging || isPinching ? "transform" : "auto",
              }}
            >
              <Image
                src={images[currentIndex]}
                alt={`Image ${currentIndex + 1}`}
                width={1200}
                height={800}
                className="max-w-full max-h-[80vh] w-auto h-auto object-contain"
                quality={90}
                priority
                draggable={false}
              />
            </div>
          </div>

          {images.length > 1 && (
            <>
              {currentIndex > 0 && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    goToPrevious();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-colors z-10"
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-colors z-10"
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
              disabled={zoom <= 0.5}
              className={cn(
                "text-white p-2 rounded-full transition-colors",
                zoom <= 0.5 ? "opacity-50 cursor-not-allowed" : "hover:bg-white/20",
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
              className="text-white px-3 py-2 rounded-full hover:bg-white/20 transition-colors text-sm"
              aria-label="원래 크기"
            >
              {Math.round(zoom * 100)}%
            </button>

            <button
              onClick={e => {
                e.stopPropagation();
                handleZoomIn();
              }}
              disabled={zoom >= 5}
              className={cn(
                "text-white p-2 rounded-full transition-colors",
                zoom >= 5 ? "opacity-50 cursor-not-allowed" : "hover:bg-white/20",
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
    </AnimatePresence>
  );
}
