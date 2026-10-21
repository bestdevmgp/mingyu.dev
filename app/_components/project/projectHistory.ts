let traversed = false;
let closing = false;
let pushedPath: string | null = null;
const listeners = new Set<() => void>();
const titles = new Map<string, string>();

const setPushedPath = (path: string | null) => {
  if (pushedPath === path) return;
  pushedPath = path;
  listeners.forEach(listener => listener());
};

if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    traversed = true;
    closing = false;
    setPushedPath(window.history.state?.projectModal ? window.location.pathname : null);
  });
}

export const markProjectPush = (path: string, title: string) => {
  traversed = false;
  titles.set(path, title);
  setPushedPath(path);
};

export const projectTitle = (path: string) => titles.get(path);

export const settleProjectPush = () => setPushedPath(null);

export const subscribeProjectPush = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const pushedProjectPath = () => pushedPath;

export const openedFromHistory = () => traversed;

export const markProjectClose = () => {
  closing = true;
};

export const settleProjectClose = () => {
  closing = false;
};

export const projectClosing = () => closing;
