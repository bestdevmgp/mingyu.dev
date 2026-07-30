"use client";

import { useEffect, useState } from "react";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Mount Vercel Analytics + Speed Insights only AFTER the page has loaded and the
// main thread is idle. On iOS Safari/Chrome these scripts run inside the busy
// first-load window and tip the compositor over frame budget (Brave/Opera block
// them by default, which is why only Safari/Chrome janked). Deferring keeps the
// data but moves the work out of the critical window.
const DeferredAnalytics = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let idleId = 0;
    const schedule = () => {
      idleId = window.requestIdleCallback
        ? window.requestIdleCallback(() => setReady(true))
        : window.setTimeout(() => setReady(true), 1);
    };

    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    return () => {
      window.removeEventListener("load", schedule);
      if (idleId && window.cancelIdleCallback) window.cancelIdleCallback(idleId);
    };
  }, []);

  if (!ready) return null;

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
};

export default DeferredAnalytics;
