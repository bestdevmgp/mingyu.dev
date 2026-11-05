let shown = false;
let queued: (() => void) | null = null;
const shownListeners = new Set<() => void>();

export const markViewerShown = () => {
  shown = true;
  queued = null;
  shownListeners.forEach(listener => listener());
};

export const settleViewerClose = () => {
  shown = false;
  const run = queued;
  queued = null;
  run?.();
};

export const afterViewerClose = (callback: () => void) => {
  if (shown) queued = callback;
  else callback();
};

export const subscribeViewerShown = (listener: () => void) => {
  shownListeners.add(listener);
  return () => {
    shownListeners.delete(listener);
  };
};
