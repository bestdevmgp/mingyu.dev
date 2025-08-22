import { education } from "@prisma/client";
import parse from "html-react-parser";

interface EducationCardProps extends education {}

const EducationCard = ({ id, period, title, sub_title, items }: EducationCardProps) => {
  return (
    <div key={`edu-card-${id}`} className="grid sm:grid-cols-3 sm:gap-x-10 sm:items-start">
      <p
        className="
          text-sm md:text-base text-foreground/60 mb-3 sm:ml-auto
          before:content-['*'] before:text-foreground/30 before:w-[21px] before:inline-block
        "
      >
        {period}
      </p>

      <div className="pl-5 sm:pl-0 sm:col-span-2 flex flex-col gap-2">
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
