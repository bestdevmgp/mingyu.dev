"use client";

import { useRef, useState } from "react";

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

const SCROLL_THRESHOLD = 10;

const ProjectCard = ({ id, title, sub_title, skills }: ProjectCardProps) => {
  const [isPressed, setIsPressed] = useState(false);
  const touchStart = useRef({ x: 0, y: 0 });

  const handleTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
    setIsPressed(true);
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    const moved = Math.hypot(touch.clientX - touchStart.current.x, touch.clientY - touchStart.current.y);
    if (moved > SCROLL_THRESHOLD) setIsPressed(false);
  };

  const release = () => setIsPressed(false);

  // a section link leaves its hash in the url; closing the modal would jump back to it
  const dropSectionHash = () => {
    if (!window.location.hash) return;
    window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
  };

  const fill = ["bg-blue", "bg-green", "bg-lime text-gray-800"][id % 3];

  return (
    <Link className="no-underline" href={`/project/${id}`} passHref scroll={false} onClick={dropSectionHash}>
      <div
        id={`project-card-${id}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={release}
        onTouchCancel={release}
        className={cn(
          "w-full h-fit md:h-full md:min-h-72 p-5 md:p-6 bg-background border border-foreground/15 hover:border-foreground/0 rounded-md md:rounded-lg flex flex-col justify-between gap-6 md:gap-8 group transition-colors duration-200",
          id % 3 === 0 && "hover:bg-blue",
          id % 3 === 1 && "hover:bg-green",
          id % 3 === 2 && "hover:bg-lime hover:text-gray-800",
          isPressed && cn("border-foreground/0", fill),
        )}
      >
        <div className="text-left">
          <div className="relative mb-2.5 md:mb-4 w-5 md:w-6 h-5 md:h-6">
            <Image
              className={cn("object-contain", isPressed ? "hidden" : "group-hover:hidden")}
              src={`/assets/shape-variant-${id % 9}.svg`}
              alt="shape"
              fill
              priority={true}
            />
            <Image
              className={cn("object-contain", isPressed ? "block" : "hidden group-hover:block")}
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
