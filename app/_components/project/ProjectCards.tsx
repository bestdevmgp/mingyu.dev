"use client";

import { useState } from "react";

import { project, skill } from "@prisma/client";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";

import ProjectCard from "./ProjectCard";
import CTAButton from "../buttons/CTAButton";

type OmittedProject = Pick<project, "id" | "title" | "sub_title"> & {
  skills: skill[];
};

interface ProjectCardsProps {
  projects: OmittedProject[];
}

const ITEMS_TO_SHOW = 6;

const ProjectCards = ({ projects }: ProjectCardsProps) => {
  const t = useTranslations("Project");
  const [shownCount, setShownCount] = useState(ITEMS_TO_SHOW);
  const hasNext = shownCount < projects.length;

  const showMore = () => {
    if (!hasNext) return;
    setShownCount(count => count + ITEMS_TO_SHOW);
  };

  const initialCards = projects.slice(0, ITEMS_TO_SHOW);

  const extraBatches: OmittedProject[][] = [];
  for (let start = ITEMS_TO_SHOW; start < shownCount; start += ITEMS_TO_SHOW) {
    extraBatches.push(projects.slice(start, Math.min(start + ITEMS_TO_SHOW, projects.length)));
  }

  return (
    <div className="cards flex flex-col">
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
        {initialCards.map(props => (
          <ProjectCard key={`project-card-${props.id}`} {...props} />
        ))}
      </div>

      {extraBatches.map(batch => (
        <motion.div
          key={`project-batch-${batch[0].id}`}
          className="overflow-hidden"
          initial={{ height: 0 }}
          animate={{ height: "auto" }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 pt-6 md:pt-8">
            {batch.map(props => (
              <ProjectCard key={`project-card-${props.id}`} {...props} />
            ))}
          </div>
        </motion.div>
      ))}

      {hasNext && (
        <div className="flex justify-center pt-6 md:pt-8">
          <CTAButton label={t("showMore")} onClick={showMore} />
        </div>
      )}
    </div>
  );
};

export default ProjectCards;
