"use client";

import { useEffect, useState } from "react";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

import { bootPostHog } from "./analytics/posthog";

import type { SpeedInsightsProps } from "@vercel/speed-insights";

const Analytics = dynamic(() => import("@vercel/analytics/react").then(m => m.Analytics));
const SpeedInsights = dynamic<SpeedInsightsProps>(() =>
  import("@vercel/speed-insights/next").then(m => m.SpeedInsights),
);

const PROJECT_PATH = /^\/project\/\d+$/;

const DeferredAnalytics = () => {
  const [ready, setReady] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let idleId = 0;
    const schedule = () => {
      idleId = window.requestIdleCallback
        ? window.requestIdleCallback(() => setReady(true), { timeout: 2000 })
        : window.setTimeout(() => setReady(true), 1);
    };

    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    return () => {
      window.removeEventListener("load", schedule);
      if (idleId && window.cancelIdleCallback) window.cancelIdleCallback(idleId);
    };
  }, []);

  useEffect(() => {
    if (ready) void bootPostHog();
  }, [ready]);

  if (!ready) return null;

  return (
    <>
      <Analytics />
      <SpeedInsights {...(PROJECT_PATH.test(pathname) ? { route: "/project/[id]" } : {})} />
    </>
  );
};

export default DeferredAnalytics;
