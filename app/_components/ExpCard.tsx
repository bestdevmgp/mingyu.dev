"use client";

import { useState } from "react";
import { ChevronRight } from "react-feather";

import { experience, skill } from "@prisma/client";
import cn from "classnames";
import parse from "html-react-parser";

import Shape from "@/assets/shape-sparkle.svg";

import SkillItem from "./skill/SkillItem";

interface ExpCardProps extends Omit<experience, "skill_ids"> {
  skills: skill[];
}

const ExpCard = ({ id, period, is_active, title, sub_title, skills, items }: ExpCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleDetail = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="grid sm:grid-cols-3 sm:gap-x-10 sm:items-start">
      <div className="flex gap-2.5 sm:justify-end items-center mb-3">
        <Shape className={cn(is_active ? "text-primary" : "text-foreground/30")} />
        <p className="text-sm md:text-base font-normal text-foreground/60">{period}</p>
      </div>

      <div className="pl-6 sm:pl-0 sm:col-span-2 flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-base md:text-lg font-semibold">{title}</p>
          {sub_title && (
            <p className="text-xs md:text-sm font-normal text-foreground/60 whitespace-pre-wrap">{parse(sub_title)}</p>
          )}
        </div>

        <ul className="p-0 flex gap-2 list-none flex-wrap max-w-80 md:max-w-none">
          {skills.map(skill => (
            <li key={`experience-${id}-skill-${skill.id}`} className="indent-0">
              <SkillItem size="xs" label={skill.item} imageUrl={skill.blobUrl} />
            </li>
          ))}
        </ul>

        {items.length > 0 && (
          <>
            <button className="text-primary/75 flex items-center gap-1 mt-2" onClick={toggleDetail}>
              <ChevronRight className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-90")} />
              <p className="text-left text-xs md:text-sm">주요 내용 {isExpanded ? "가리기" : "보기"}</p>
            </button>
            <div
              className={cn(
                "grid transition-all duration-300 ease-in-out",
                isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <ul className="list-disc list-inside bg-foreground/5 rounded-lg p-4 -indent-5 pl-10 mt-2">
                  {items.map((data, index) => (
                    <li
                      key={`exp-${id}-detail-${index}`}
                      className="text-sm md:text-base font-normal mb-1 last:mb-0 text-foreground/80"
                    >
                      {data}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExpCard;
