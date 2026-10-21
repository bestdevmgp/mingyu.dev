const ANCHOR = "main section[id], main [data-reveal], main [data-reveal-stagger], main li, main h2, main p";
const FOLLOW_CAP = 3000;
const RELEASE_CAP = 30000;

let active = false;
let following = false;
let committed = false;
let hash = "";
let fallbackY = 0;
let anchorIndex = -1;
let anchorTop = 0;
let frame = 0;
let followTimer = 0;
let releaseTimer = 0;
const endListeners = new Set<() => void>();

const captureAnchor = () => {
  anchorIndex = -1;
  if (window.scrollY <= 0) return;

  const nodes = document.querySelectorAll(ANCHOR);
  const limit = window.innerHeight;
  let above = -1;
  for (let i = 0; i < nodes.length; i++) {
    if (!nodes[i].getClientRects().length) continue;
    const top = nodes[i].getBoundingClientRect().top;
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
    anchorTop = nodes[above].getBoundingClientRect().top;
  }
};

const followAnchor = () => {
  if (anchorIndex < 0) {
    if (Math.abs(window.scrollY - fallbackY) > 1) window.scrollTo(0, fallbackY);
    return;
  }
  const el = document.querySelectorAll(ANCHOR)[anchorIndex];
  if (!el) return;
  const delta = el.getBoundingClientRect().top - anchorTop;
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

export const onLocaleSwitchEnd = (listener: () => void) => {
  endListeners.add(listener);
  return () => {
    endListeners.delete(listener);
  };
};

export const beginLocaleSwitch = () => {
  active = true;
  following = true;
  committed = false;
  hash = window.location.hash;
  fallbackY = window.scrollY;
  captureAnchor();
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
  if (following) return;
  following = true;
  frame = requestAnimationFrame(loop);
};

export const endLocaleSwitch = () => {
  if (!active) return;
  active = false;
  following = false;
  window.removeEventListener("scroll", onScroll);
  cancelAnimationFrame(frame);
  window.clearTimeout(followTimer);
  window.clearTimeout(releaseTimer);

  const limit = window.innerHeight;
  document.querySelectorAll("[data-reveal]:not(.is-revealed)").forEach(el => {
    if (el.getBoundingClientRect().top < limit) el.classList.add("is-revealed");
  });
  document.documentElement.classList.remove("locale-switching");
  if (hash && !window.location.hash)
    window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search + hash);

  followAnchor();
  const lenis = window.__lenis;
  if (lenis && window.scrollY > lenis.limit) lenis.resize();
  lenis?.scrollTo(window.scrollY, { immediate: true });
  endListeners.forEach(listener => listener());
};
