import { HTMLAttributes } from "react";

import cn from "classnames";

interface LogoProps extends HTMLAttributes<HTMLDivElement> {}

const Logo = ({ className, ...props }: LogoProps) => {
  return (
    <div className={cn("relative", className)} {...props}>
      <div className="shape flex gap-2">
        <div className="w-3 md:w-4 h-3 md:h-4 rounded-full bg-blue" />
        <div className="w-3 md:w-4 h-3 md:h-4 rounded-full bg-green" />
        <div className="w-3 md:w-4 h-3 md:h-4 rounded-full bg-lime" />
      </div>
    </div>
  );
};

export default Logo;
