const RELEASE_CAP = 3000;

let held: number | null = null;
let detach: (() => void) | null = null;
let capTimer = 0;

export const beginLocaleSwitch = () => {
  const root = document.documentElement;
  held = window.scrollY;
  root.classList.add("locale-switching");

  const hold = () => {
    if (held !== null && Math.abs(window.scrollY - held) > 1) window.scrollTo(0, held);
  };

  let frame = requestAnimationFrame(function loop() {
    if (held === null) return;
    hold();
    frame = requestAnimationFrame(loop);
  });
  window.addEventListener("scroll", hold, { passive: true });

  detach = () => {
    window.removeEventListener("scroll", hold);
    cancelAnimationFrame(frame);
  };

  window.clearTimeout(capTimer);
  capTimer = window.setTimeout(endLocaleSwitch, RELEASE_CAP);
};

export const endLocaleSwitch = () => {
  const target = held;
  held = null;
  detach?.();
  detach = null;
  window.clearTimeout(capTimer);

  if (target !== null) {
    const limit = window.innerHeight;
    document.querySelectorAll("[data-reveal]:not(.is-revealed)").forEach(el => {
      if (el.getBoundingClientRect().top < limit) el.classList.add("is-revealed");
    });
  }
  document.documentElement.classList.remove("locale-switching");

  if (target === null) return;
  window.scrollTo(0, target);
  window.__lenis?.scrollTo(target, { immediate: true });
};
