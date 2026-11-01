"use client";

import { ArrowUpRight } from "react-feather";

import cn from "classnames";

import { subtleBoxClasses } from "@/utils/pressClasses";
import useTouchPress from "@/utils/useTouchPress";

interface ReferenceLinkProps {
  href: string;
  label: string;
  labelClassName?: string;
  className?: string;
}

const ReferenceLink = ({ href, label, labelClassName, className }: ReferenceLinkProps) => {
  const [isPressed, pressHandlers] = useTouchPress();

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "relative no-underline text-primary inline-flex items-center gap-1",
        "before:-left-1.5 before:-right-0.75 before:-top-1 before:-bottom-[5.75px] before:rounded-md before:transition-colors",
        subtleBoxClasses(isPressed),
        className,
      )}
      {...pressHandlers}
    >
      <span className={cn("underline underline-offset-2", labelClassName)}>{label}</span>
      <ArrowUpRight className="w-3.5 h-3.5 shrink-0 [stroke-width:2.229]" aria-hidden="true" />
    </a>
  );
};

export default ReferenceLink;
