"use client";

import { useEffect } from "react";

const WAIT_LIMIT = 8000;
const RETRY_INTERVAL = 100;
const SETTLED_TOLERANCE = 2;

const RestoreProjectScroll = () => {
  useEffect(() => {
    if (!sessionStorage.getItem("from-project")) return;

    const started = Date.now();
    let observer: MutationObserver | null = null;
    let retry = 0;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      sessionStorage.removeItem("from-project");
      observer?.disconnect();
      window.clearInterval(retry);
      window.removeEventListener("wheel", finish);
      window.removeEventListener("touchstart", finish);
      window.removeEventListener("keydown", finish);
    };

    const step = () => {
      if (finished) return;
      if (Date.now() - started > WAIT_LIMIT) return finish();

      const target = document.getElementById("projects");
      if (!target) return;

      observer?.disconnect();
      observer = null;

      const before = window.scrollY;
      window.__lenis?.resize?.();
      if (window.__lenis) window.__lenis.scrollTo(target, { immediate: true });
      else target.scrollIntoView();

      const reached = target.getBoundingClientRect().top < window.innerHeight / 2;
      if (reached && Math.abs(window.scrollY - before) < SETTLED_TOLERANCE) finish();
    };

    step();

    if (!finished) {
      retry = window.setInterval(step, RETRY_INTERVAL);
      if (!document.getElementById("projects")) {
        observer = new MutationObserver(step);
        observer.observe(document.body, { childList: true, subtree: true });
      }
      window.addEventListener("wheel", finish, { once: true, passive: true });
      window.addEventListener("touchstart", finish, { once: true, passive: true });
      window.addEventListener("keydown", finish, { once: true });
    }

    return finish;
  }, []);

  return null;
};

export default RestoreProjectScroll;
