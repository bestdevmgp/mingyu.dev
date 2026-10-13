"use client";

import { useEffect, useState } from "react";

import dynamic from "next/dynamic";
import { useParams, usePathname } from "next/navigation";

import { bootPostHog, isLocalhost } from "./analytics/posthog";

import type { SpeedInsightsProps } from "@vercel/speed-insights";

const Analytics = dynamic(() => import("@vercel/analytics/react").then(m => m.Analytics));
const SpeedInsights = dynamic<SpeedInsightsProps>(() =>
  import("@vercel/speed-insights/next").then(m => m.SpeedInsights),
);

const PROJECT_PATH = /^\/project\/\d+$/;
const LOCALE_PROJECT_PATH = /^\/[\w-]+\/project\/\d+$/;

const DeferredAnalytics = () => {
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const params = useParams();
  const projectRoute =
    Boolean(params?.locale) && (PROJECT_PATH.test(pathname) || (LOCALE_PROJECT_PATH.test(pathname) && !params?.id));

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

  if (!ready || isLocalhost()) return null;

  return (
    <>
      <Analytics />
      <SpeedInsights {...(projectRoute ? { route: "/project/[id]" } : {})} />
    </>
  );
};

export default DeferredAnalytics;
