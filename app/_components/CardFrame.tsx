"use client";

import cn from "classnames";

import useTouchPress from "@/utils/useTouchPress";

interface CardFrameProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  boxId?: string;
  boxClassName: string;
}

const CardFrame = ({ boxId, boxClassName, children, ...linkProps }: CardFrameProps) => {
  const [isPressed, pressHandlers] = useTouchPress();

  return (
    <a className="no-underline focus-visible:rounded-md md:focus-visible:rounded-lg -outline-offset-1" {...linkProps}>
      <div
        id={boxId}
        {...pressHandlers}
        className={cn(
          "w-full h-fit md:h-full md:min-h-72 p-5 md:p-6 border border-foreground/15 rounded-md md:rounded-lg group",
          boxClassName,
          isPressed && "scale-[0.97]",
        )}
      >
        {children}
      </div>
    </a>
  );
};

export default CardFrame;
