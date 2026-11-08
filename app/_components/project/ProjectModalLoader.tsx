"use client";

import { useEffect, useState } from "react";

import { useIsPresent } from "motion/react";

import { localePath } from "@i18n/config";

import ProjectSkeleton from "./ProjectSkeleton";
import {
  ProjectModalClient,
  type ProjectData,
  cachedProject,
  fetchProject,
  loadProjectModalClient,
} from "./projectCache";

interface ProjectModalLoaderProps {
  id: number;
  locale: string;
}

export default function ProjectModalLoader({ id, locale }: ProjectModalLoaderProps) {
  const isPresent = useIsPresent();
  const [projectData, setProjectData] = useState<ProjectData | null>(() =>
    ProjectModalClient ? cachedProject(locale, id) : null,
  );

  useEffect(() => {
    if (projectData || !isPresent) return;
    let active = true;
    Promise.all([fetchProject(locale, id), loadProjectModalClient()])
      .then(([result]) => {
        if (active) setProjectData(result);
      })
      .catch(() => {
        if (active) window.location.replace(localePath(locale, `/projects/${id}`));
      });
    return () => {
      active = false;
    };
  }, [id, locale, projectData, isPresent]);

  if (!projectData || !ProjectModalClient) return <ProjectSkeleton />;
  return <ProjectModalClient id={id} projectData={projectData} revealImages />;
}
