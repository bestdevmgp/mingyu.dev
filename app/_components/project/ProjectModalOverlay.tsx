"use client";

import ProjectModalLoader from "./ProjectModalLoader";
import Modal from "../Modal";

interface ProjectModalOverlayProps {
  id: number;
  locale: string;
}

export default function ProjectModalOverlay({ id, locale }: ProjectModalOverlayProps) {
  return (
    <Modal>
      <ProjectModalLoader id={id} locale={locale} />
    </Modal>
  );
}
