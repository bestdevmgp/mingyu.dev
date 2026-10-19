"use client";

import { useEffect } from "react";

const HeroIdle = () => {
  useEffect(() => {
    const hero = document.getElementById("main");
    if (!hero) return;
    const root = document.documentElement;
    const observer = new IntersectionObserver(([entry]) => root.classList.toggle("hero-idle", !entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return null;
};

export default HeroIdle;
