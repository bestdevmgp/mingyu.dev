import { education } from "@prisma/client";
import cn from "classnames";
import parse from "html-react-parser";

import Shape from "@/assets/shape-sparkle.svg";

interface EducationCardProps extends education {}

const EducationCard = ({ id, period, title, sub_title, items, is_active }: EducationCardProps) => {
  return (
    <div key={`edu-card-${id}`} className="grid sm:grid-cols-3 sm:gap-x-10 sm:items-start">
      <div className="flex gap-2.5 sm:justify-end items-center mb-3">
        <Shape className={cn(is_active ? "text-primary" : "text-foreground/30")} />
        <p className="text-sm md:text-base font-normal text-foreground/60">{period}</p>
      </div>

      <div className="pl-6 sm:pl-0 sm:col-span-2 flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <p className="text-base md:text-lg font-semibold">{title}</p>
          <p className="text-sm md:text-base font-normal text-foreground/60 whitespace-pre-wrap">{sub_title}</p>
        </div>

        {items.length > 0 && (
          <ul className="list-disc list-inside -indent-4 md:-indent-5 pl-4 md:pl-5">
            {items.map((item, index) => (
              <li
                key={`edu-card-item-${index}`}
                className="text-xs md:text-sm font-normal mb-1 last:mb-0 text-foreground/80 leading-normal"
              >
                {parse(item)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default EducationCard;
