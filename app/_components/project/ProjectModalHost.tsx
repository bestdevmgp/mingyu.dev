"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";

import { localePath, locales } from "@i18n/config";

import afterPageLoad from "@/utils/afterPageLoad";

import { loadProjectModalClient } from "./projectCache";
import {
  leavingProjectPath,
  projectOpens,
  pushedProjectPath,
  settleProjectPush,
  subscribeProjectHistory,
} from "./projectHistory";

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
  loadProjectModalClient().catch(() => {});
};

const PROJECT_PATH = new RegExp(`^(?:/(?:${locales.join("|")}))?/projects/(\\d+)$`);

const projectId = (path: string | null) => (path ? PROJECT_PATH.exec(path)?.[1] : undefined);

const ProjectModalHost = () => {
  const pathname = usePathname();
  const pushedPath = useSyncExternalStore(subscribeProjectHistory, pushedProjectPath, () => null);
  const leavingPath = useSyncExternalStore(subscribeProjectHistory, leavingProjectPath, () => null);
  const opens = useSyncExternalStore(subscribeProjectHistory, projectOpens, () => 0);
  const id = projectId(pushedPath ?? pathname) ?? projectId(leavingPath);
  const locale = useLocale();
  const [, setOverlayLoaded] = useState(false);

  useEffect(() => afterPageLoad(preloadModalCode, 200), []);

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
        if (active) window.location.replace(localePath(locale, `/projects/${id}`));
      },
    );
    return () => {
      active = false;
    };
  }, [id, locale]);

  if (!id || !ProjectModalOverlay) return null;
  return <ProjectModalOverlay key={opens} id={Number(id)} locale={locale} />;
};

export default ProjectModalHost;
