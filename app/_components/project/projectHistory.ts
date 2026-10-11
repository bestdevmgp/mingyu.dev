let traversed = false;
let pushedPath: string | null = null;
const listeners = new Set<() => void>();

const setPushedPath = (path: string | null) => {
  if (pushedPath === path) return;
  pushedPath = path;
  listeners.forEach(listener => listener());
};

if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    traversed = true;
    setPushedPath(null);
  });
}

export const markProjectPush = (path: string) => {
  traversed = false;
  setPushedPath(path);
};

export const settleProjectPush = () => setPushedPath(null);

export const subscribeProjectPush = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const pushedProjectPath = () => pushedPath;

export const openedFromHistory = () => traversed;
