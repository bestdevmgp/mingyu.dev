"use client";

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface FlipTransform {
  x: number;
  y: number;
  scale: number;
}

export const getVisibleImageBox = (image: HTMLImageElement): Box | null => {
  const rect = image.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;

  const natural = image.naturalWidth / image.naturalHeight;
  if (!Number.isFinite(natural) || natural <= 0) {
    return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
  }

  const boxRatio = rect.width / rect.height;
  const width = natural > boxRatio ? rect.width : rect.height * natural;
  const height = natural > boxRatio ? rect.width / natural : rect.height;

  return {
    left: rect.left + (rect.width - width) / 2,
    top: rect.top + (rect.height - height) / 2,
    width,
    height,
  };
};

export const getFlipTransform = (from: Box, to: Box): FlipTransform | null => {
  if (!to.width || !from.width) return null;
  return {
    x: from.left + from.width / 2 - (to.left + to.width / 2),
    y: from.top + from.height / 2 - (to.top + to.height / 2),
    scale: from.width / to.width,
  };
};

const toCss = (transform: FlipTransform) => `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`;

export const flipFrom = (element: HTMLElement, from: FlipTransform, duration: number, easing: string) => {
  element.style.transition = "none";
  element.style.transform = toCss(from);
  void element.offsetWidth;
  element.style.transition = `transform ${duration}ms ${easing}`;
  element.style.transform = "translate(0px, 0px) scale(1)";
};

export const flipTo = (element: HTMLElement, to: FlipTransform, duration: number, easing: string) => {
  element.style.transition = `transform ${duration}ms ${easing}`;
  element.style.transform = toCss(to);
};

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
