"use client";

import { useEffect, useState } from "react";

import dynamic from "next/dynamic";
import { useParams, usePathname } from "next/navigation";

import afterPageLoad from "@/utils/afterPageLoad";

import { bootPostHog, isLocalhost } from "./analytics/posthog";

import type { SpeedInsightsProps } from "@vercel/speed-insights";

const Unavailable = () => null;

const Analytics = dynamic(() =>
  import("@vercel/analytics/react").then(
    m => m.Analytics,
    () => Unavailable,
  ),
);
const SpeedInsights = dynamic<SpeedInsightsProps>(() =>
  import("@vercel/speed-insights/next").then(
    m => m.SpeedInsights,
    () => Unavailable,
  ),
);

const PROJECT_PATH = /^\/project\/\d+$/;
const LOCALE_PROJECT_PATH = /^\/[\w-]+\/project\/\d+$/;

const DeferredAnalytics = () => {
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const params = useParams();
  const projectRoute =
    Boolean(params?.locale) && (PROJECT_PATH.test(pathname) || (LOCALE_PROJECT_PATH.test(pathname) && !params?.id));

  useEffect(() => afterPageLoad(() => setReady(true), 1), []);

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
