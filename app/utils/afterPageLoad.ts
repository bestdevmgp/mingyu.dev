const IDLE_TIMEOUT = 2000;

const afterPageLoad = (task: () => void, fallbackDelay: number) => {
  const idle = "requestIdleCallback" in globalThis;
  let handle: number | undefined;
  const schedule = () => {
    handle = idle
      ? window.requestIdleCallback(task, { timeout: IDLE_TIMEOUT })
      : window.setTimeout(task, fallbackDelay);
  };
  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });
  return () => {
    window.removeEventListener("load", schedule);
    if (handle === undefined) return;
    if (idle) window.cancelIdleCallback(handle);
    else window.clearTimeout(handle);
  };
};

export default afterPageLoad;
