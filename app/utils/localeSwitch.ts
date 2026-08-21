const ANCHOR = "main section[id], main [data-reveal], main [data-reveal-stagger], main li, main h2, main h3, main p";
const RELEASE_CAP = 3000;

let active = false;
let fallbackY = 0;
let anchorIndex = -1;
let anchorTop = 0;
let detach: (() => void) | null = null;
let capTimer = 0;

const captureAnchor = () => {
  const nodes = document.querySelectorAll(ANCHOR);
  const limit = window.innerHeight;
  let above = -1;

  anchorIndex = -1;
  for (let i = 0; i < nodes.length; i++) {
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

export const isLocaleSwitching = () => active;

export const beginLocaleSwitch = () => {
  active = true;
  fallbackY = window.scrollY;
  captureAnchor();
  document.documentElement.classList.add("locale-switching");

  let frame = requestAnimationFrame(function loop() {
    if (!active) return;
    followAnchor();
    frame = requestAnimationFrame(loop);
  });
  window.addEventListener("scroll", followAnchor, { passive: true });

  detach = () => {
    window.removeEventListener("scroll", followAnchor);
    cancelAnimationFrame(frame);
  };

  window.clearTimeout(capTimer);
  capTimer = window.setTimeout(endLocaleSwitch, RELEASE_CAP);
};

export const endLocaleSwitch = () => {
  if (!active) return;
  active = false;
  detach?.();
  detach = null;
  window.clearTimeout(capTimer);

  const limit = window.innerHeight;
  document.querySelectorAll("[data-reveal]:not(.is-revealed)").forEach(el => {
    if (el.getBoundingClientRect().top < limit) el.classList.add("is-revealed");
  });
  document.documentElement.classList.remove("locale-switching");

  followAnchor();
  window.__lenis?.scrollTo(window.scrollY, { immediate: true });
};
