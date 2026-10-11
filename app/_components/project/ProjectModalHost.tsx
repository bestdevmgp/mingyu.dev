"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";

import { localePath } from "@i18n/config";

import { pushedProjectPath, settleProjectPush, subscribeProjectPush } from "./projectHistory";

type ProjectModalOverlayType = typeof import("./ProjectModalOverlay").default;

let ProjectModalOverlay: ProjectModalOverlayType | null = null;
let overlayLoading: Promise<void> | null = null;

const loadOverlay = () =>
  (overlayLoading ??= import("./ProjectModalOverlay").then(
    module => {
      ProjectModalOverlay = module.default;
    },
    error => {
      overlayLoading = null;
      throw error;
    },
  ));

const preloadModalCode = () => {
  loadOverlay().catch(() => {});
  import("./ProjectModalClient").catch(() => {});
};

const IDLE_TIMEOUT = 2000;

const afterPageLoad = (task: () => void) => {
  const idle = "requestIdleCallback" in globalThis;
  let handle: number | undefined;
  const schedule = () => {
    handle = idle ? window.requestIdleCallback(task, { timeout: IDLE_TIMEOUT }) : window.setTimeout(task, 200);
  };
  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });
  return () => {
    window.removeEventListener("load", schedule);
    if (handle === undefined) return;
    if (idle) window.cancelIdleCallback(handle);
    else window.clearTimeout(handle);
  };
};

const PROJECT_PATH = /^\/project\/(\d+)$/;

const ProjectModalHost = () => {
  const pathname = usePathname();
  const pushedPath = useSyncExternalStore(subscribeProjectPush, pushedProjectPath, () => null);
  const id = PROJECT_PATH.exec(pushedPath ?? pathname)?.[1];
  const locale = useLocale();
  const [, setOverlayLoaded] = useState(false);

  useEffect(() => afterPageLoad(preloadModalCode), []);

  useEffect(() => {
    if (pushedPath !== null && pathname === pushedPath) settleProjectPush();
  }, [pathname, pushedPath]);

  useEffect(() => {
    if (!id || ProjectModalOverlay) return;
    let active = true;
    loadOverlay().then(
      () => {
        if (active) setOverlayLoaded(true);
      },
      () => {
        if (active) window.location.replace(localePath(locale, `/project/${id}`));
      },
    );
    return () => {
      active = false;
    };
  }, [id, locale]);

  if (!id || !ProjectModalOverlay) return null;
  return <ProjectModalOverlay key={id} id={Number(id)} locale={locale} />;
};

export default ProjectModalHost;
