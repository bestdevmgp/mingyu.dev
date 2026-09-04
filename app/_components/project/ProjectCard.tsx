"use client";

import cn from "classnames";
import Image from "next/image";
import Link from "next/link";

import richText from "@/utils/richText";
import useTouchPress from "@/utils/useTouchPress";

import { track } from "../analytics/posthog";
import SkillItem from "../skill/SkillItem";

import type { skill } from "@prisma/client";

interface ProjectCardProps {
  id: number;
  title: string;
  sub_title: string;
  skills: skill[];
}

const ProjectCard = ({ id, title, sub_title, skills }: ProjectCardProps) => {
  const [isPressed, pressHandlers] = useTouchPress();

  const dropSectionHash = () => {
    if (!window.location.hash) return;
    window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
  };

  const onOpen = () => {
    dropSectionHash();
    track("project_opened", { project_id: id, project_title: title.replace(/<[^>]+>/g, "") });
  };

  return (
    <Link className="no-underline" href={`/project/${id}`} passHref scroll={false} onClick={onOpen}>
      <div
        id={`project-card-${id}`}
        {...pressHandlers}
        className={cn(
          "w-full h-fit md:h-full md:min-h-72 p-5 md:p-6 bg-background border border-foreground/15 hover:border-foreground/0 rounded-md md:rounded-lg flex flex-col justify-between gap-6 md:gap-8 group",
          "transition-[background-color,border-color,color,scale] duration-200",
          id % 3 === 0 && "hover:bg-blue",
          id % 3 === 1 && "hover:bg-green",
          id % 3 === 2 && "hover:bg-lime hover:text-gray-800",
          isPressed && "scale-[0.97]",
        )}
      >
        <div className="text-left">
          <div className="relative mb-2.5 md:mb-4 w-5 md:w-6 h-5 md:h-6">
            <Image
              className="group-hover:hidden object-contain"
              src={`/assets/shape-variant-${id % 9}.svg`}
              alt="shape"
              fill
            />
            <Image
              className="hidden group-hover:block object-contain"
              src={`/assets/shape-variant-${id % 9}-invert.svg`}
              alt="shape"
              fill
            />
          </div>
          <p className="text-lg md:text-xl font-semibold md:mb-4">{richText(title)}</p>
          <p className="text-sm font-normal opacity-60 hidden md:inline-block">{richText(sub_title)}</p>
        </div>

        <ul className="p-0 flex gap-2 list-none flex-wrap">
          {skills.map(skill => (
            <li key={`project-${id}-skill-${skill.id}`} className="indent-0">
              <SkillItem label={skill.item} imageUrl={skill.blobUrl} size="xs" />
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
};

export default ProjectCard;
