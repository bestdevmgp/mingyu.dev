export const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isCoarsePointer = () => window.matchMedia("(pointer: coarse)").matches;
