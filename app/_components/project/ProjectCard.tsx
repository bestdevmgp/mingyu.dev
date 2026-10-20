"use client";

import cn from "classnames";
import Image from "next/image";
import { useLocale } from "next-intl";

import { localePath } from "@i18n/config";

import type { SkillIcon } from "@/utils/api";
import { isLocaleSwitching } from "@/utils/localeSwitch";
import richText from "@/utils/richText";

import { markProjectPush, projectClosing } from "./projectHistory";
import CardFrame from "../CardFrame";
import { track } from "../analytics/posthog";
import SkillItem from "../skill/SkillItem";

interface ProjectCardProps {
  id: number;
  title: string;
  sub_title: string;
  skills: SkillIcon[];
}

const isModifiedClick = (event: React.MouseEvent<HTMLAnchorElement>) =>
  event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;

const ProjectCard = ({ id, title, sub_title, skills }: ProjectCardProps) => {
  const path = localePath(useLocale(), `/project/${id}`);

  const dropSectionHash = () => {
    if (!window.location.hash) return;
    window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
  };

  const onOpen = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if ((projectClosing() || isLocaleSwitching()) && !isModifiedClick(event)) {
      event.preventDefault();
      return;
    }
    dropSectionHash();
    track("project_opened", { project_id: id, project_title: title.replace(/<[^>]+>/g, "") });
    if (event.defaultPrevented || isModifiedClick(event)) return;
    event.preventDefault();
    if (window.location.pathname === path) return;
    markProjectPush(path);
    window.history.pushState({ projectModal: true }, "", path);
  };

  return (
    <CardFrame
      href={path}
      onClick={onOpen}
      boxId={`project-card-${id}`}
      boxClassName={cn(
        "bg-background hover:border-foreground/0 flex flex-col justify-between gap-6 md:gap-8",
        "transition-[background-color,border-color,color,scale] duration-200",
        id % 3 === 0 && "hover:bg-blue",
        id % 3 === 1 && "hover:bg-green",
        id % 3 === 2 && "hover:bg-lime hover:text-gray-800",
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

      <ul className="p-0 flex gap-2 list-none flex-wrap xl:-mr-px">
        {skills.map(skill => (
          <li key={`project-${id}-skill-${skill.id}`} className="indent-0">
            <SkillItem label={skill.item} imageUrl={skill.blobUrl} size="xs" />
          </li>
        ))}
      </ul>
    </CardFrame>
  );
};

export default ProjectCard;
