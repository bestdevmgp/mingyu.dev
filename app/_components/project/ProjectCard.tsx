"use client";

import { skill } from "@prisma/client";
import cn from "classnames";
import parse from "html-react-parser";
import Image from "next/image";
import Link from "next/link";

import SkillItem from "../skill/SkillItem";

interface ProjectCardProps {
  id: number;
  title: string;
  sub_title: string;
  skills: skill[];
}

const ProjectCard = ({ id, title, sub_title, skills }: ProjectCardProps) => {
  return (
    <Link className="no-underline" href={`/project/${id}`} passHref scroll={false}>
      <div
        id={`project-card-${id}`}
        className={cn(
          "w-full h-fit md:h-72 p-5 md:p-6 bg-background border border-foreground/15 hover:border-foreground/0 rounded-md md:rounded-lg flex flex-col justify-between gap-6 md:gap-0 group",
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
              priority={true}
            />
            <Image
              className="hidden group-hover:block object-contain"
              src={`/assets/shape-variant-${id % 9}-invert.svg`}
              alt="shape"
              fill
              priority={true}
            />
          </div>
          <p className="text-lg md:text-xl font-semibold md:mb-4">{parse(title)}</p>
          <p className="text-sm font-normal opacity-60 hidden md:inline-block">{parse(sub_title)}</p>
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
