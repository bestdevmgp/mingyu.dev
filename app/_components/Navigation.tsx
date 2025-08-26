"use client";

import { forwardRef } from "react";

import cn from "classnames";
import Link from "next/link";

import Logo from "./Logo";

interface NavigationProps extends React.ComponentPropsWithoutRef<"nav"> {}

type NavRef = React.ComponentPropsWithRef<"nav">["ref"];

const Navigation = forwardRef(({ className, ...props }: NavigationProps, ref: NavRef) => {
  return (
    <nav className={cn(className, "w-full h-screen min-h-[550px] sticky top-0 flex-col")} ref={ref} {...props}>
      <div className="h-20  flex items-center">
        <Logo />
      </div>

      <div className="flex flex-col text-xs gap-3 pt-4 mb-12 text-foreground/80 border-t border-t-black/25 dark:border-t-white/25">
        <p className="text-sm font-extrabold">Contents</p>
        {[
          { label: "간단 자기소개", id: "intro" },
          { label: "프로젝트", id: "project" },
          { label: "프로젝트 경험", id: "experience" },
          { label: "자격", id: "education" },
          { label: "기술", id: "skill" },
        ].map((data, index) => (
          <Link key={`nav-${index}`} href={`#${data.id}`} className="grid grid-cols-[32px_auto] no-underline">
            <p className="font-semibold">{String(index + 1).padStart(2, "0")}</p>
            <p className="font-normal">{data.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-[60px_auto] text-xs gap-3 pt-4 text-foreground/80 border-t border-t-black/25 dark:border-t-white/25">
        <p className="col-span-2 text-sm font-extrabold">Contact</p>

        <p className="font-semibold">전화번호</p>
        <Link href="tel:01036723858" target="_blank">
          <p className="font-normal">010-3672-3858</p>
        </Link>

        <p className="font-semibold">이메일</p>
        <Link href="mailto:me@mingyu.dev" target="_blank">
          <p className="font-normal">me@mingyu.dev</p>
        </Link>

        <p className="font-semibold">Github</p>
        <Link href="https://github.com/bestdevmgp" target="_blank">
          <p className="font-normal">@bestdevmgp</p>
        </Link>
      </div>

      {/* <div className="absolute bottom-0 w-full py-4 border-t border-t-black/25 dark:border-t-white/25 flex flex-col gap-2">
        <DarkModeSwitch />
        <LangSelect />
      </div> */}
    </nav>
  );
});

export default Navigation;
