"use client";

import { useEffect } from "react";

import ProjectModalLoader from "./ProjectModalLoader";
import { markProjectClose, settleProjectClose } from "./projectHistory";
import Modal from "../Modal";

interface ProjectModalOverlayProps {
  id: number;
  locale: string;
}

export default function ProjectModalOverlay({ id, locale }: ProjectModalOverlayProps) {
  useEffect(() => settleProjectClose, []);

  return (
    <Modal onClose={markProjectClose} labelledBy="project-modal-title">
      <ProjectModalLoader id={id} locale={locale} />
    </Modal>
  );
}
