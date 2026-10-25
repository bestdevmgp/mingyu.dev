"use client";

import { useEffect } from "react";

import { isLocaleSwitching } from "@/utils/localeSwitch";

import { beforeLocaleChange, isAnalyticsEnabled, track } from "./posthog";

const SECTIONS = ["main", "competencies", "skills", "career", "projects", "blog", "education", "contact"] as const;

const MIN_DWELL_MS = 1000;
const BOTTOM_TOLERANCE = 2;

type Target = { id: string; order: number; el: HTMLElement };

type Visit = {
  startedAt: number;
  engagedBase: number;
  engagedFrom: number;
  maxScroll: number;
  deepest: string;
  lastLeave: string;
  dwell: Map<string, number>;
  reported: Map<string, number>;
  seen: Set<string>;
};

let carried: Visit | null = null;

const SectionTracker = () => {
  useEffect(() => {
    if (!isAnalyticsEnabled()) return;

    const targets: Target[] = [];
    SECTIONS.forEach((id, order) => {
      const el = document.getElementById(id);
      if (el) targets.push({ id, order, el });
    });

    const orderOf = new Map(targets.map(t => [t.id, t.order]));
    const rankOf = (id: string) => orderOf.get(id) ?? 0;

    const now = performance.now();
    const visit: Visit =
      isLocaleSwitching() && carried
        ? carried
        : {
            startedAt: now,
            engagedBase: 0,
            engagedFrom: document.visibilityState === "visible" ? now : 0,
            maxScroll: 0,
            deepest: targets[0].id,
            lastLeave: "",
            dwell: new Map(),
            reported: new Map(),
            seen: new Set(),
          };
    carried = null;
    let rafId = 0;

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

    const atBottom = () =>
      window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - BOTTOM_TOLERANCE;

    const sample = () => {
      visit.maxScroll = Math.max(visit.maxScroll, scrollPct());
      const id = currentSection();
      const reached = atBottom() ? targets[targets.length - 1].id : id;
      if (rankOf(reached) > rankOf(visit.deepest)) visit.deepest = reached;
      return id;
    };

    let active = sample();
    let activeSince = visit.engagedFrom ? now : 0;

    const bank = (at: number) => {
      if (activeSince) visit.dwell.set(active, (visit.dwell.get(active) ?? 0) + (at - activeSince));
      activeSince = 0;
    };

    const resume = (at: number) => {
      active = sample();
      activeSince = at;
    };

    const reportDwell = () =>
      visit.dwell.forEach((total, id) => {
        const delta = total - (visit.reported.get(id) ?? 0);
        if (delta < MIN_DWELL_MS) return;
        visit.reported.set(id, total);
        track("section_dwell", {
          section: id,
          section_order: orderOf.get(id),
          visible_ms: Math.round(delta),
          total_visible_ms: Math.round(total),
        });
      });

    const reportBeforeLocaleChange = () => {
      const at = performance.now();
      bank(at);
      reportDwell();
      if (visit.engagedFrom) resume(at);
    };

    const flush = () => {
      const at = performance.now();
      sample();
      bank(at);
      if (visit.engagedFrom) {
        visit.engagedBase += at - visit.engagedFrom;
        visit.engagedFrom = 0;
      }

      reportDwell();

      const leave = {
        max_section: visit.deepest,
        max_section_order: rankOf(visit.deepest),
        max_scroll_pct: Math.round(visit.maxScroll),
        engaged_ms: Math.round(visit.engagedBase),
      };
      const signature = JSON.stringify(leave);
      if (signature === visit.lastLeave) return;
      visit.lastLeave = signature;
      track("page_leave", leave);
    };

    const observer = new IntersectionObserver(entries => {
      const at = performance.now();
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const id = entry.target.id;
        if (visit.seen.has(id)) continue;
        visit.seen.add(id);
        track("section_viewed", {
          section: id,
          section_order: orderOf.get(id),
          reached_after_ms: Math.round(at - visit.startedAt),
        });
      }
    });
    targets.forEach(t => observer.observe(t.el));

    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        const next = sample();
        if (next === active || !activeSince) return;
        const at = performance.now();
        bank(at);
        active = next;
        activeSince = at;
      });
    };

    const onVisibility = () => {
      const at = performance.now();
      if (document.visibilityState === "hidden") {
        flush();
        return;
      }
      visit.engagedFrom = at;
      resume(at);
    };

    const onClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest?.("[data-analytics]");
      const name = target?.getAttribute("data-analytics");
      if (name) track(name, { section: currentSection() });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    document.addEventListener("click", onClick, true);
    const stopLocaleWatch = beforeLocaleChange(reportBeforeLocaleChange);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("click", onClick, true);
      stopLocaleWatch();
      if (rafId) cancelAnimationFrame(rafId);
      if (!isLocaleSwitching()) return;
      bank(performance.now());
      carried = visit;
    };
  }, []);

  return null;
};

export default SectionTracker;
