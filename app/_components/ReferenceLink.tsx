"use client";

import { ArrowUpRight } from "react-feather";

import cn from "classnames";

import useTouchPress from "@/utils/useTouchPress";

interface ReferenceLinkProps {
  href: string;
  label: string;
  labelClassName?: string;
}

const ReferenceLink = ({ href, label, labelClassName }: ReferenceLinkProps) => {
  const [isPressed, pressHandlers] = useTouchPress();

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "no-underline text-primary inline-flex items-center gap-1 transition-opacity",
        "mouse:hover:opacity-70",
        isPressed && "opacity-70",
      )}
      {...pressHandlers}
    >
      <span className={cn("underline underline-offset-2", labelClassName)}>{label}</span>
      <ArrowUpRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
    </a>
  );
};

export default ReferenceLink;
