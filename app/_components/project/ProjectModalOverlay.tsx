"use client";

import { useEffect } from "react";

import { localePath } from "@i18n/config";

import ProjectModalLoader from "./ProjectModalLoader";
import { leaveProject, projectTitle, settleProjectClose } from "./projectHistory";
import Modal from "../Modal";

interface ProjectModalOverlayProps {
  id: number;
  locale: string;
}

export default function ProjectModalOverlay({ id, locale }: ProjectModalOverlayProps) {
  useEffect(() => settleProjectClose, []);

  return (
    <Modal
      onRelease={leaveProject}
      onExited={settleProjectClose}
      labelledBy="project-modal-title"
      label={projectTitle(localePath(locale, `/project/${id}`))}
    >
      <ProjectModalLoader id={id} locale={locale} />
    </Modal>
  );
}
