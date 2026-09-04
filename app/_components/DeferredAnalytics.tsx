"use client";

import { useEffect, useState } from "react";

import dynamic from "next/dynamic";

import { bootPostHog } from "./analytics/posthog";

const Analytics = dynamic(() => import("@vercel/analytics/react").then(m => m.Analytics));
const SpeedInsights = dynamic(() => import("@vercel/speed-insights/next").then(m => m.SpeedInsights));

const DeferredAnalytics = () => {
  const [ready, setReady] = useState(false);

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
      <SpeedInsights />
    </>
  );
};

export default DeferredAnalytics;
