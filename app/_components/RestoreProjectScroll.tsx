"use client";

import { useEffect } from "react";

const RestoreProjectScroll = () => {
  useEffect(() => {
    if (!sessionStorage.getItem("from-project")) return;
    sessionStorage.removeItem("from-project");

    const target = document.getElementById("projects");
    if (!target) return;

    const scroll = () => {
      if (window.__lenis) window.__lenis.scrollTo(target, { immediate: true });
      else target.scrollIntoView();
    };

    scroll();
    const timers = [window.setTimeout(scroll, 120), window.setTimeout(scroll, 400)];
    return () => timers.forEach(window.clearTimeout);
  }, []);

  return null;
};

export default RestoreProjectScroll;
