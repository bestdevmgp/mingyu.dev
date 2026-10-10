"use client";

import { useEffect, useState } from "react";
import type { ComponentProps } from "react";

import { localePath } from "@i18n/config";

import ProjectSkeleton from "./ProjectSkeleton";
import { openedFromHistory } from "./projectHistory";

type ProjectModalClientType = typeof import("./ProjectModalClient").default;
type ProjectData = ComponentProps<ProjectModalClientType>["projectData"];

let ProjectModalClient: ProjectModalClientType | null = null;

const loadProjectModalClient = () =>
  import("./ProjectModalClient").then(module => {
    ProjectModalClient = module.default;
  });

interface ProjectModalLoaderProps {
  id: number;
  locale: string;
}

const loaded = new Map<string, ProjectData>();

export default function ProjectModalLoader({ id, locale }: ProjectModalLoaderProps) {
  const key = `${locale}/${id}`;
  const [projectData, setProjectData] = useState<ProjectData | null>(() =>
    openedFromHistory() && ProjectModalClient ? (loaded.get(key) ?? null) : null,
  );

  useEffect(() => {
    if (projectData) return;
    let active = true;
    const data = fetch(`/assets/projects/${key}`).then(response => {
      if (!response.ok) throw new Error(`Project ${key} failed to load: ${response.status}`);
      return response.json() as Promise<ProjectData>;
    });
    Promise.all([data, loadProjectModalClient()])
      .then(([result]) => {
        loaded.set(key, result);
        if (active) setProjectData(result);
      })
      .catch(() => {
        if (active) window.location.replace(localePath(locale, `/project/${id}`));
      });
    return () => {
      active = false;
    };
  }, [id, locale, key, projectData]);

  if (!projectData || !ProjectModalClient) return <ProjectSkeleton />;
  return <ProjectModalClient id={id} projectData={projectData} revealImages />;
}
