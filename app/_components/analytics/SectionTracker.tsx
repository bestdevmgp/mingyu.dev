"use client";

import { useEffect } from "react";

import { isAnalyticsEnabled, track } from "./posthog";

const SECTIONS = ["main", "intro", "skills", "career", "projects", "blog", "education", "contact"] as const;

const MIN_DWELL_MS = 1000;

type Target = { id: string; order: number; el: HTMLElement };

const SectionTracker = () => {
  useEffect(() => {
    if (!isAnalyticsEnabled()) return;

    const targets: Target[] = [];
    SECTIONS.forEach((id, order) => {
      const el = document.getElementById(id);
      if (el) targets.push({ id, order, el });
    });
    if (!targets.length) return;

    const orderOf = new Map(targets.map(t => [t.id, t.order]));
    const rankOf = (id: string) => orderOf.get(id) ?? 0;
    const dwell = new Map<string, number>();
    const reported = new Map<string, number>();
    const seen = new Set<string>();

    const startedAt = performance.now();
    let engagedBase = 0;
    let engagedFrom = document.visibilityState === "visible" ? startedAt : 0;
    let maxScroll = 0;
    let rafId = 0;
    let lastLeave = "";

    const currentSection = () => {
      const middle = window.innerHeight / 2;
      let current = targets[0].id;
      for (const t of targets) {
        if (t.el.getBoundingClientRect().top > middle) break;
        current = t.id;
      }
      return current;
    };

    const scrollPct = () => {
      const height = document.documentElement.scrollHeight;
      if (height <= 0) return 0;
      return Math.min(100, ((window.scrollY + window.innerHeight) / height) * 100);
    };

    let active = currentSection();
    let activeSince = engagedFrom;
    let deepest = active;

    const sample = () => {
      maxScroll = Math.max(maxScroll, scrollPct());
      const id = currentSection();
      if (rankOf(id) > rankOf(deepest)) deepest = id;
      return id;
    };

    const bank = (now: number) => {
      if (activeSince) dwell.set(active, (dwell.get(active) ?? 0) + (now - activeSince));
      activeSince = 0;
    };

    const resume = (now: number) => {
      active = sample();
      activeSince = now;
    };

    const flush = () => {
      const now = performance.now();
      sample();
      bank(now);
      if (engagedFrom) {
        engagedBase += now - engagedFrom;
        engagedFrom = 0;
      }

      dwell.forEach((total, id) => {
        const delta = total - (reported.get(id) ?? 0);
        if (delta < MIN_DWELL_MS) return;
        reported.set(id, total);
        track("section_dwell", {
          section: id,
          section_order: orderOf.get(id),
          visible_ms: Math.round(delta),
          total_visible_ms: Math.round(total),
        });
      });

      const leave = {
        max_section: deepest,
        max_section_order: rankOf(deepest),
        max_scroll_pct: Math.round(maxScroll),
        engaged_ms: Math.round(engagedBase),
      };
      const signature = JSON.stringify(leave);
      if (signature === lastLeave) return;
      lastLeave = signature;
      track("page_leave", leave);
    };

    const observer = new IntersectionObserver(
      entries => {
        const now = performance.now();
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = entry.target.id;
          if (seen.has(id)) continue;
          seen.add(id);
          track("section_viewed", {
            section: id,
            section_order: orderOf.get(id),
            reached_after_ms: Math.round(now - startedAt),
          });
        }
      },
      { threshold: 0 },
    );
    targets.forEach(t => observer.observe(t.el));

    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        const next = sample();
        if (next === active || !activeSince) return;
        const now = performance.now();
        bank(now);
        active = next;
        activeSince = now;
      });
    };

    const onVisibility = () => {
      const now = performance.now();
      if (document.visibilityState === "hidden") {
        flush();
        return;
      }
      engagedFrom = now;
      resume(now);
    };

    const onPageHide = () => flush();

    const onClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest?.("[data-analytics]");
      const name = target?.getAttribute("data-analytics");
      if (name) track(name, { section: currentSection() });
    };

    sample();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("click", onClick, true);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("click", onClick, true);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return null;
};

export default SectionTracker;
