let backPending = false;
let opens = 0;
let pushedPath: string | null = null;
let leavingPath: string | null = null;
const listeners = new Set<() => void>();
const titles = new Map<string, string>();

const notify = () => listeners.forEach(listener => listener());

const setPushedPath = (path: string | null) => {
  if (path) opens++;
  pushedPath = path;
  notify();
};

if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    backPending = false;
    setPushedPath(window.history.state?.projectModal ? window.location.pathname : null);
  });
}

export const markProjectPush = (path: string, title: string) => {
  titles.set(path, title);
  setPushedPath(path);
};

export const projectTitle = (path: string) => titles.get(path);

export const settleProjectPush = () => setPushedPath(null);

export const subscribeProjectHistory = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const pushedProjectPath = () => pushedPath;

export const leavingProjectPath = () => leavingPath;

export const projectOpens = () => opens;

export const leaveProject = () => {
  backPending = true;
  leavingPath = window.location.pathname;
  notify();
  window.history.back();
};

export const settleProjectClose = () => {
  if (leavingPath === null) return;
  leavingPath = null;
  notify();
};

export const projectBackPending = () => backPending;
