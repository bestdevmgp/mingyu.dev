let shown = false;
let queued: (() => void) | null = null;

export const markViewerShown = () => {
  shown = true;
  queued = null;
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
