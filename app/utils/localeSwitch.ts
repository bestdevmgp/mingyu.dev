import { REVEAL_INSET_PERCENT } from "@/utils/reveal";

const ANCHOR = "main section[id], main [data-reveal], main [data-reveal-stagger], main li, main h2, main p";
const FOLLOW_CAP = 3000;
const RELEASE_CAP = 30000;

let active = false;
let following = false;
let committed = false;
let hash = "";
let fromPath = "";
let fallbackY = 0;
let anchorIndex = -1;
let anchorTop = 0;
let frame = 0;
let followTimer = 0;
let releaseTimer = 0;
let revealedSections = new Set<string>();
let revealWatcher: MutationObserver | null = null;
const endListeners = new Set<() => void>();

const sectionOf = (el: Element) => el.closest("section[id]")?.id ?? "";

const restoreReveals = () =>
  document.querySelectorAll("[data-reveal]:not(.is-revealed)").forEach(el => {
    if (revealedSections.has(sectionOf(el))) el.classList.add("is-revealed");
  });

const revealInView = () => {
  const line = window.innerHeight * (1 - REVEAL_INSET_PERCENT / 100);
  document.querySelectorAll("[data-reveal]:not(.is-revealed)").forEach(el => {
    const { top, bottom } = el.getBoundingClientRect();
    if (top < line && bottom > 0) el.classList.add("is-revealed");
  });
};

const watchReveals = () => {
  revealWatcher ??= new MutationObserver(records =>
    records.forEach(({ target }) => {
      if (target instanceof Element && target.classList.contains("is-revealed"))
        revealedSections.add(sectionOf(target));
    }),
  );
  revealWatcher.observe(document.body, { subtree: true, attributeFilter: ["class"] });
};

const layoutTop = (el: HTMLElement) => {
  let top = -window.scrollY;
  for (let node: HTMLElement | null = el; node; node = node.offsetParent as HTMLElement | null) top += node.offsetTop;
  return top;
};

const captureAnchor = () => {
  anchorIndex = -1;
  if (window.scrollY <= 0) return;

  const nodes = document.querySelectorAll<HTMLElement>(ANCHOR);
  const limit = window.innerHeight;
  let above = -1;
  for (let i = 0; i < nodes.length; i++) {
    if (!nodes[i].getClientRects().length) continue;
    const top = layoutTop(nodes[i]);
    if (top >= 0) {
      if (top < limit) {
        anchorIndex = i;
        anchorTop = top;
      }
      break;
    }
    above = i;
  }

  if (anchorIndex < 0 && above >= 0) {
    anchorIndex = above;
    anchorTop = layoutTop(nodes[above]);
  }
};

const followAnchor = () => {
  if (anchorIndex < 0) {
    if (Math.abs(window.scrollY - fallbackY) > 1) window.scrollTo(0, fallbackY);
    return;
  }
  const el = document.querySelectorAll<HTMLElement>(ANCHOR)[anchorIndex];
  if (!el) return;
  const delta = layoutTop(el) - anchorTop;
  if (Math.abs(delta) > 0.5) window.scrollTo(0, window.scrollY + delta);
};

const loop = () => {
  if (!active || !following) return;
  followAnchor();
  frame = requestAnimationFrame(loop);
};

const onScroll = () => {
  if (following) followAnchor();
  else if (!committed) {
    fallbackY = window.scrollY;
    captureAnchor();
  }
};

export const isLocaleSwitching = () => active;

export const isLocaleSwitchNavigation = () => active && window.location.pathname !== fromPath;

export const recaptureLocaleAnchor = () => {
  if (!active) return;
  fallbackY = window.scrollY;
  captureAnchor();
};

export const onLocaleSwitchEnd = (listener: () => void) => {
  endListeners.add(listener);
  return () => {
    endListeners.delete(listener);
  };
};

export const beginLocaleSwitch = ({ hold = true } = {}) => {
  active = true;
  following = hold;
  committed = false;
  hash = window.location.hash;
  fromPath = window.location.pathname;
  fallbackY = window.scrollY;
  captureAnchor();
  revealedSections = new Set([...document.querySelectorAll("[data-reveal].is-revealed")].map(sectionOf));
  watchReveals();
  document.documentElement.classList.add("locale-switching", "locale-switched");

  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(loop);
  window.addEventListener("scroll", onScroll, { passive: true });

  window.clearTimeout(followTimer);
  window.clearTimeout(releaseTimer);
  followTimer = window.setTimeout(() => {
    following = false;
  }, FOLLOW_CAP);
  releaseTimer = window.setTimeout(endLocaleSwitch, RELEASE_CAP);
};

export const markLocaleCommitted = () => {
  if (!active || committed) return;
  committed = true;
  revealWatcher?.disconnect();
  restoreReveals();
  followAnchor();
  revealInView();
  if (following) return;
  following = true;
  frame = requestAnimationFrame(loop);
};

export const endLocaleSwitch = () => {
  if (!active) return;
  active = false;
  following = false;
  window.removeEventListener("scroll", onScroll);
  revealWatcher?.disconnect();
  cancelAnimationFrame(frame);
  window.clearTimeout(followTimer);
  window.clearTimeout(releaseTimer);

  followAnchor();
  restoreReveals();
  revealInView();
  void document.documentElement.offsetWidth;
  document.documentElement.classList.remove("locale-switching");
  if (hash && !window.location.hash)
    window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search + hash);

  const lenis = window.__lenis;
  if (lenis && window.scrollY > lenis.limit) lenis.resize();
  lenis?.scrollTo(window.scrollY, { immediate: true });
  endListeners.forEach(listener => listener());
};
