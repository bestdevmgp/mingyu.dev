"use client";

import cn from "classnames";
import Link from "next/link";

import { subtleBoxClasses } from "@/utils/pressClasses";
import useTouchPress from "@/utils/useTouchPress";

import { track } from "./analytics/posthog";

type ContactLinkProps = React.ComponentProps<typeof Link> & { channel: string };

const ContactLink = ({ channel, className, ...props }: ContactLinkProps) => {
  const [isPressed, pressHandlers] = useTouchPress();
  return (
    <Link
      rel="noopener noreferrer"
      {...props}
      {...pressHandlers}
      onClick={() => track("contact_click", { channel, variant: "footer" })}
      className={cn(
        className,
        "relative",
        "before:-inset-x-1.5 before:-top-0.75 before:-bottom-1.5 md:before:-top-[1.75px] md:before:-bottom-[5.25px] before:rounded-md before:transition-colors",
        subtleBoxClasses(isPressed),
      )}
    />
  );
};

export default ContactLink;
